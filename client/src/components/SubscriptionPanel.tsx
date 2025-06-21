import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Download, AlertTriangle } from "lucide-react";

interface SubscriptionPanelProps {
  subscription: {
    status: string;
    amount: string;
    paymentMethod?: string;
    nextBillingDate?: string;
    lastPaymentDate?: string;
  };
}

export default function SubscriptionPanel({ subscription }: SubscriptionPanelProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-badge-active">ATIVO</Badge>;
      case 'pending':
        return <Badge className="status-badge-pending">PENDENTE</Badge>;
      case 'expired':
        return <Badge className="status-badge-expired">EXPIRADO</Badge>;
      default:
        return <Badge className="bg-gray-500">DESCONHECIDO</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-500';
      case 'pending':
        return 'border-yellow-500';
      case 'expired':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const showAlert = subscription.status === 'pending' || subscription.status === 'expired';

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {showAlert && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Renove sua assinatura para continuar acessando as peneiras!
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Card */}
      <Card className={`border-2 ${getStatusColor(subscription.status)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-caps">
              {subscription.status === 'active' ? 'ASSINATURA ATIVA' : 
               subscription.status === 'pending' ? 'PAGAMENTO PENDENTE' : 
               'ASSINATURA EXPIRADA'}
            </CardTitle>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo pagamento:</span>
              <span className="font-medium">
                {subscription.status === 'expired' ? 'Expirado' : formatDate(subscription.nextBillingDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Último pagamento:</span>
              <span className="font-medium">{formatDate(subscription.lastPaymentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método de pagamento:</span>
              <span className="font-medium">
                {subscription.paymentMethod || 'Não definido'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor mensal:</span>
              <span className="font-bold text-primary">
                R$ {parseFloat(subscription.amount).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            {subscription.status === 'expired' ? (
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold">
                RENOVAR ASSINATURA
              </Button>
            ) : (
              <Button className="w-full cta-button">
                <CreditCard className="h-4 w-4 mr-2" />
                ALTERAR MÉTODO PAGAMENTO
              </Button>
            )}
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              BAIXAR RECIBO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-caps">BENEFÍCIOS DO PLANO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-primary">✓</span>
            <span>Acesso completo a todas as peneiras</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-primary">✓</span>
            <span>Filtros avançados de busca</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-primary">✓</span>
            <span>Perfil completo de atleta</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-primary">✓</span>
            <span>Portfólio de vídeos</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-primary">✓</span>
            <span>Notificações personalizadas</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-primary">✓</span>
            <span>Histórico de peneiras</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
