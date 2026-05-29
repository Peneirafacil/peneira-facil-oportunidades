import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, Loader2, RefreshCw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CheckoutStep = "plans" | "form" | "pix" | "success";

interface PixData {
  payment_id: string;
  pix_copy_paste: string | null;
  pix_qr_code: string | null;
  billing_url: string;
  expires_at: string;
}

export default function Planos() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [profile, setProfile] = useState<{
    subscription_provider: string | null;
    subscription_tier: string | null;
    subscription_expires_at: string | null;
    full_name: string | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [step, setStep] = useState<CheckoutStep>("plans");
  const [selectedPlan, setSelectedPlan] = useState<"monthly_1490" | "anual">("monthly_1490");
  const [submitting, setSubmitting] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixStatus, setPixStatus] = useState<"pending" | "paid" | "expired">("pending");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({ name: "", cpf: "", phone: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect success redirect from AbacatePay
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

      const { data } = await supabase
        .from("profiles")
        .select("subscription_provider, subscription_tier, subscription_expires_at, full_name")
        .eq("id", user.id)
        .single();

      setProfile(data ?? null);
      if (data?.full_name) setForm(f => ({ ...f, name: f.name || data.full_name || "" }));
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

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  const startPolling = (paymentId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await supabase.functions.invoke("check-pix-status", {
          body: { payment_id: paymentId },
        });

        if (res.error) return;
        const data = res.data as { status: string };

        if (data.status === "paid") {
          stopPolling();
          setPixStatus("paid");
          setStep("success");
        } else if (data.status === "expired") {
          stopPolling();
          setPixStatus("expired");
        }
      } catch (_) { /* ignore */ }
    }, 4000);
  };

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

      setPixData(res.data as PixData);
      setStep("pix");
      startPolling(res.data.payment_id);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Tente novamente", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!pixData?.pix_copy_paste) return;
    navigator.clipboard.writeText(pixData.pix_copy_paste);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    toast({ title: "Copiado!", description: "Código Pix copiado para a área de transferência" });
  };

  // ─── Plans display ─────────────────────────────────────────────────────────

  const planMonthlyPrice = 14.90;
  const planAnualPrice = 99.00;
  const oldMonthlyPrice = 9.90;

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

  if (step === "pix" && pixData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-10 max-w-md">
          <button
            onClick={() => { stopPolling(); setStep("form"); }}
            className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>

          <Card>
            <CardContent className="p-6 text-center space-y-6">
              <div>
                <Badge className="mb-3 bg-green-600 text-white">PIX</Badge>
                <h2 className="text-2xl font-bold">
                  {selectedPlan === "anual"
                    ? `R$ ${planAnualPrice.toFixed(2).replace(".", ",")}`
                    : `R$ ${planMonthlyPrice.toFixed(2).replace(".", ",")}`}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPlan === "anual" ? "Plano Anual" : "Plano Mensal"}
                </p>
              </div>

              {pixStatus === "expired" ? (
                <div className="space-y-3">
                  <p className="text-destructive font-medium">Pix expirado</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setStep("form"); setPixData(null); setPixStatus("pending"); }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Gerar novo Pix
                  </Button>
                </div>
              ) : (
                <>
                  {pixData.pix_qr_code ? (
                    <img
                      src={`data:image/png;base64,${pixData.pix_qr_code}`}
                      alt="QR Code Pix"
                      className="w-48 h-48 mx-auto rounded-lg border"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">QR Code indisponível</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Escaneie o QR code ou copie o código abaixo
                    </p>
                    {pixData.pix_copy_paste && (
                      <div className="bg-muted rounded-lg p-3 break-all text-xs font-mono text-left">
                        {pixData.pix_copy_paste.slice(0, 60)}...
                      </div>
                    )}
                    <Button
                      className="cta-button w-full"
                      onClick={handleCopy}
                      disabled={!pixData.pix_copy_paste}
                    >
                      {copied ? (
                        <><CheckCircle className="w-4 h-4 mr-2" /> Copiado!</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" /> Copiar código Pix</>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Aguardando pagamento...
                  </div>

                  {pixData.billing_url && (
                    <a
                      href={pixData.billing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-primary underline"
                    >
                      Abrir página de pagamento
                    </a>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "form") {
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
                  {selectedPlan === "anual"
                    ? `Plano Anual — R$ ${planAnualPrice.toFixed(2).replace(".", ",")}`
                    : `Plano Mensal — R$ ${planMonthlyPrice.toFixed(2).replace(".", ",")}/mês`}
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

  // ─── Plans page ────────────────────────────────────────────────────────────

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

              {/* Plano Mensal */}
              <Card className={`relative border-2 ${selectedPlan === "monthly_1490" ? "border-primary" : "border-border"}`}>
                {!isReturningUser && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1 text-xs font-bold uppercase">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Plano Mensal</h2>
                      <p className="text-sm text-muted-foreground">30 dias de acesso completo</p>
                    </div>
                    <div className="text-right">
                      {!isReturningUser && (
                        <p className="text-sm text-muted-foreground line-through">
                          R$ {oldMonthlyPrice.toFixed(2).replace(".", ",")}
                        </p>
                      )}
                      <p className="text-3xl font-black text-primary">
                        R$ {planMonthlyPrice.toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-xs text-muted-foreground">por mês</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm">
                    {[
                      "Todas as peneiras do Brasil",
                      "Filtros avançados de busca",
                      "Perfil completo de atleta",
                      "Notificações personalizadas",
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="cta-button w-full mt-5"
                    onClick={() => {
                      setSelectedPlan("monthly_1490");
                      setStep("form");
                    }}
                  >
                    {isActiveSubscriber ? "RENOVAR PLANO" : isReturningUser ? "ASSINAR AGORA" : "COMEÇAR AGORA"}
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Anual */}
              <Card className={`relative border-2 ${selectedPlan === "anual" ? "border-primary" : "border-border"}`}>
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
                      <p className="text-3xl font-black text-primary">
                        R$ {planAnualPrice.toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-xs text-muted-foreground">por ano</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm">
                    {[
                      "Tudo do plano mensal",
                      "12 meses de acesso contínuo",
                      "Maior economia — 45% off",
                      "Notificações prioritárias",
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    className="w-full mt-5 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => {
                      setSelectedPlan("anual");
                      setStep("form");
                    }}
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
