import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

interface TryoutCardProps {
  tryout: {
    id: number;
    title: string;
    date: string;
    city: string;
    state: string;
    ageMinimum?: number;
    ageMaximum?: number;
    status: string;
    imageUrl?: string;
  };
}

export default function TryoutCard({ tryout }: TryoutCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-badge-active">ATIVO</Badge>;
      case 'pending':
        return <Badge className="status-badge-pending">AGUARDANDO</Badge>;
      case 'expired':
        return <Badge className="status-badge-expired">EXPIRADO</Badge>;
      default:
        return <Badge className="bg-gray-500">DESCONHECIDO</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDate(tryout.date);

  return (
    <Card className="overflow-hidden card-hover">
      {/* Mock image placeholder - in real app this would use tryout.imageUrl */}
      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">⚽</div>
          <p className="text-sm">Imagem da Peneira</p>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-primary line-clamp-2">
            {tryout.title}
          </h3>
          {getStatusBadge(tryout.status)}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span>{date} - {time}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span>{tryout.city}, {tryout.state}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-primary" />
            <span>
              {tryout.ageMinimum && tryout.ageMaximum
                ? `${tryout.ageMinimum} a ${tryout.ageMaximum} anos`
                : 'Todas as idades'
              }
            </span>
          </div>
        </div>
        
        <Link href={`/tryout/${tryout.id}`}>
          <Button className="w-full cta-button font-bold py-3 text-caps">
            MAIS INFORMAÇÕES
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
