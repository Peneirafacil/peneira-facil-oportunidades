import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, X, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CheckoutStep = "plans" | "form" | "success";
type PlanType = "monthly_1490" | "anual" | "oferta_exclusiva" | "promo_mes_gratis_retorno";

const PLAN_DISPLAY: Record<PlanType, { label: string; price: number; duration: string }> = {
  monthly_1490: { label: "Plano Mensal", price: 14.90, duration: "/mês" },
  anual: { label: "Plano Anual", price: 99.00, duration: "/ano" },
  oferta_exclusiva: { label: "Oferta de Boas-Vindas", price: 5.90, duration: "/mês" },
  promo_mes_gratis_retorno: { label: "Oferta de Retorno", price: 9.90, duration: "/2 meses" },
};

export default function Planos() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [profile, setProfile] = useState<{
    subscription_provider: string | null;
    subscription_tier: string | null;
    subscription_expires_at: string | null;
    full_name: string | null;
  } | null>(null);
  const [hasRedeemedOffer590, setHasRedeemedOffer590] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [step, setStep] = useState<CheckoutStep>("plans");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly_1490");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", cpf: "", phone: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pix_success") === "true") {
      setStep("success");
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfileLoading(false); return; }

      const [profileResult, pixResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("subscription_provider, subscription_tier, subscription_expires_at, full_name")
          .eq("id", user.id)
          .single(),
        supabase
          .from("pix_payments")
          .select("id")
          .eq("user_id", user.id)
          .eq("plan", "oferta_exclusiva")
          .eq("status", "paid")
          .limit(1),
      ]);

      setProfile(profileResult.data ?? null);
      setHasRedeemedOffer590(!!(pixResult.data && pixResult.data.length > 0));
      if (profileResult.data?.full_name) {
        setForm(f => ({ ...f, name: f.name || profileResult.data?.full_name || "" }));
      }
      setProfileLoading(false);
    }
    loadProfile();
  }, []);

  const isReturningUser = !!(
    profile?.subscription_provider ||
    profile?.subscription_tier?.startsWith("premium")
  );

  const isActiveSubscriber = !!(
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date()
  );

  // Welcome gift config
  const giftPlan: PlanType = !isReturningUser ? "oferta_exclusiva" : "promo_mes_gratis_retorno";
  const giftPrice = !isReturningUser ? 5.90 : 9.90;
  const giftSuffix = !isReturningUser
    ? "somente esse mês"
    : "+ 1 mês grátis";

  const formatCPF = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const words = form.name.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2 || form.name.trim().length < 5)
      errors.name = "Informe nome e sobrenome";
    const cpf = form.cpf.replace(/\D/g, "");
    if (cpf.length !== 11) errors.cpf = "CPF inválido";
    const phone = form.phone.replace(/\D/g, "");
    if (phone.length < 10) errors.phone = "Telefone inválido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("create-pix-charge", {
        body: {
          plan_type: selectedPlan,
          customer: {
            name: form.name.trim(),
            document: form.cpf.replace(/\D/g, ""),
            cellphone: form.phone.replace(/\D/g, ""),
          },
        },
      });

      if (res.error || !res.data?.success) {
        const msg = res.data?.message || res.error?.message || "Erro ao gerar cobrança";
        toast({ title: "Erro", description: msg, variant: "destructive" });
        return;
      }

      const billingUrl: string | undefined = res.data.billing_url;
      if (billingUrl) {
        window.location.href = billingUrl;
      } else {
        toast({ title: "Erro", description: "URL de pagamento não encontrada", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Tente novamente", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const selectAndGo = (plan: PlanType) => {
    setSelectedPlan(plan);
    setStep("form");
  };

  // ─── Success ────────────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="text-center max-w-sm">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground mb-8">
              Sua assinatura está ativa. Aproveite todas as peneiras!
            </p>
            <Button className="cta-button w-full" onClick={() => setLocation("/")}>
              IR PARA O APP
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────────

  if (step === "form") {
    const plan = PLAN_DISPLAY[selectedPlan];
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-10 max-w-md">
          <button
            onClick={() => setStep("plans")}
            className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground"
          >
            <X className="w-4 h-4" /> Voltar
          </button>

          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold">Dados para o Pix</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.label} — R$ {plan.price.toFixed(2).replace(".", ",")}{plan.duration}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome completo</label>
                  <Input
                    placeholder="Seu nome e sobrenome"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">CPF</label>
                  <Input
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={e => setForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))}
                    className={formErrors.cpf ? "border-destructive" : ""}
                    inputMode="numeric"
                  />
                  {formErrors.cpf && <p className="text-xs text-destructive mt-1">{formErrors.cpf}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp / Celular</label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                    className={formErrors.phone ? "border-destructive" : ""}
                    inputMode="tel"
                  />
                  {formErrors.phone && <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              <Button
                className="cta-button w-full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando Pix...</>
                ) : (
                  "GERAR PIX"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Pagamento 100% seguro via Pix. Acesso liberado em instantes após confirmação.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Plans ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 bg-gradient-to-br from-background via-gray-800 to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-caps">
            PLANOS E PREÇOS
          </h1>
          <p className="text-lg text-white/80">
            Acesso completo a todas as peneiras do Brasil
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-lg">
          {profileLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* ── Presente de Boas-Vindas ── */}
              {!isActiveSubscriber && (
                <Card className="border-2 border-primary overflow-hidden">
                  <div className="gradient-primary px-4 py-2 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-bold uppercase tracking-wide">
                      Presente de Boas-Vindas
                    </span>
                  </div>
                  <CardContent className="p-5">
                    {hasRedeemedOffer590 ? (
                      <div className="text-center py-3">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                        <p className="font-bold text-lg">Presente Resgatado</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Você já utilizou sua oferta de boas-vindas
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground line-through">R$ 14,90</p>
                            <p className="text-3xl font-black text-primary">
                              R$ {giftPrice.toFixed(2).replace(".", ",")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{giftSuffix}</p>
                          </div>
                          <Badge className="bg-primary/10 text-primary border border-primary/30 text-xs px-3 py-1">
                            {!isReturningUser ? "Só esse mês" : "+ 1 mês grátis"}
                          </Badge>
                        </div>
                        <Button
                          className="cta-button w-full"
                          onClick={() => selectAndGo(giftPlan)}
                        >
                          RESGATAR OFERTA — R$ {giftPrice.toFixed(2).replace(".", ",")}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ── Plano Mensal ── */}
              <Card className="relative border-2 border-border">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Plano Mensal</h2>
                      <p className="text-sm text-muted-foreground">30 dias de acesso completo</p>
                    </div>
                    <div className="text-right">
                      {!isReturningUser && (
                        <p className="text-sm text-muted-foreground line-through">R$ 9,90</p>
                      )}
                      <p className="text-3xl font-black text-primary">R$ 14,90</p>
                      <p className="text-xs text-muted-foreground">por mês</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm">
                    {[
                      "Todas as peneiras do Brasil",
                      "Filtros avançados de busca",
                      "Perfil completo de atleta",
                      "Notificações personalizadas",
                    ].map(feat => (
                      <li key={feat} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="cta-button w-full mt-5"
                    onClick={() => selectAndGo("monthly_1490")}
                  >
                    {isActiveSubscriber ? "RENOVAR PLANO" : isReturningUser ? "ASSINAR AGORA" : "COMEÇAR AGORA"}
                  </Button>
                </CardContent>
              </Card>

              {/* ── Plano Anual ── */}
              <Card className="relative border-2 border-border">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1 text-xs font-bold uppercase">
                    Melhor Custo-Benefício
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Plano Anual</h2>
                      <p className="text-sm text-muted-foreground">365 dias — equivale a R$ 8,25/mês</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-primary">R$ 99,00</p>
                      <p className="text-xs text-muted-foreground">por ano</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm">
                    {[
                      "Tudo do plano mensal",
                      "12 meses de acesso contínuo",
                      "Maior economia — 45% off",
                      "Notificações prioritárias",
                    ].map(feat => (
                      <li key={feat} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    className="w-full mt-5 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => selectAndGo("anual")}
                  >
                    {isActiveSubscriber ? "RENOVAR ANUAL" : "ASSINAR ANUAL"}
                  </Button>
                </CardContent>
              </Card>

            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            Pagamento via Pix · Acesso imediato após confirmação · Sem fidelidade
          </p>
        </div>
      </section>
    </div>
  );
}
