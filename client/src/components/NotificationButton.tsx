import { useState, useEffect } from "react";
import { Bell, Calendar, Trophy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";

interface PeneiraNotification {
  id: string;
  title: string;
  publishedAt: string;
  isNew?: boolean;
}

interface PontosNotification {
  id: string;
  athleteName: string;
  points: number;
  peneiraName: string;
  date: string;
  isNew?: boolean;
}

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [peneiraNotifications, setPeneiraNotifications] = useState<PeneiraNotification[]>([]);
  const [pontosNotifications, setPontosNotifications] = useState<PontosNotification[]>([]);
  const { user } = useAuth();

  // Mock data - In a real app, this would come from an API
  useEffect(() => {
    // Simulated peneira notifications
    setPeneiraNotifications([
      {
        id: "1",
        title: "Corinthians Sub-15",
        publishedAt: "22/07/2025",
        isNew: true
      },
      {
        id: "2", 
        title: "Flamengo Base",
        publishedAt: "21/07/2025",
        isNew: true
      },
      {
        id: "3",
        title: "São Paulo FC Sub-17",
        publishedAt: "20/07/2025",
        isNew: false
      },
      {
        id: "4",
        title: "Palmeiras Academia",
        publishedAt: "19/07/2025",
        isNew: false
      }
    ]);

    // Simulated pontos notifications
    setPontosNotifications([
      {
        id: "1",
        athleteName: "João Souza",
        points: 10,
        peneiraName: "Palmeiras Sub-17",
        date: "22/07/2025",
        isNew: true
      },
      {
        id: "2",
        athleteName: "Maria Silva",
        points: 5,
        peneiraName: "São Paulo FC",
        date: "21/07/2025",
        isNew: true
      },
      {
        id: "3",
        athleteName: "Pedro Santos",
        points: 15,
        peneiraName: "Flamengo Base",
        date: "20/07/2025",
        isNew: false
      }
    ]);
  }, []);

  const handleViewAllPeneiras = () => {
    setIsOpen(false);
    // Navigate to all peneiras page
    window.location.href = "/peneiras";
  };

  const newNotificationsCount = peneiraNotifications.filter(n => n.isNew).length + 
                               pontosNotifications.filter(n => n.isNew).length;

  // Only show when user is authenticated
  if (!user) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {newNotificationsCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {newNotificationsCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Admin
        </SheetTitle>
        <SheetDescription>
          Acompanhe as últimas atualizações do Peneira Fácil.
        </SheetDescription>
        
        <Tabs defaultValue="peneiras" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="peneiras" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Peneiras
              {peneiraNotifications.filter(n => n.isNew).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {peneiraNotifications.filter(n => n.isNew).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pontos" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Pontos
              {pontosNotifications.filter(n => n.isNew).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pontosNotifications.filter(n => n.isNew).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="peneiras" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">📌 Notificações de Peneiras</h3>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {peneiraNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                      notification.isNew ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">Peneira: {notification.title}</p>
                          {notification.isNew && (
                            <Badge variant="default" className="text-xs">Novo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Publicado em: {notification.publishedAt}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleViewAllPeneiras}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-3 w-3" />
                          Ver peneira
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleViewAllPeneiras}
              >
                Ver todas as peneiras
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pontos" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">⭐ Notificações de Pontos</h3>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {pontosNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                      notification.isNew ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {notification.isNew && (
                            <Badge variant="default" className="text-xs">Novo</Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm leading-relaxed">
                          ✅ <span className="font-semibold">{notification.athleteName}</span> ganhou{" "}
                          <span className="text-primary font-bold">+{notification.points} pontos</span>{" "}
                          por participar da peneira "{notification.peneiraName}" em {notification.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}


