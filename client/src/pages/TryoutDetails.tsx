import { useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, Users, Phone, FileText, Building, Clock } from "lucide-react";
import { useState } from "react";

export default function TryoutDetails() {
  const [, params] = useRoute("/tryout/:id");
  const tryoutId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch tryout details
  const { data: tryout, isLoading: tryoutLoading } = useQuery({
    queryKey: ["/api/tryouts", tryoutId],
    enabled: !!tryoutId && isAuthenticated,
  });

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/tryouts", tryoutId, "comments"],
    enabled: !!tryoutId && isAuthenticated,
  });

  // Register for tryout mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/tryouts/${tryoutId}/register`);
    },
    onSuccess: () => {
      toast({
        title: "Inscrição realizada",
        description: "Você foi inscrito na peneira com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível realizar a inscrição",
        variant: "destructive",
      });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/tryouts/${tryoutId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tryouts", tryoutId, "comments"] });
      setComment("");
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    registerMutation.mutate();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate(comment);
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (!tryoutId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Peneira não encontrada</h1>
              <p className="text-muted-foreground">A peneira que você está procurando não existe.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {tryoutLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-60 w-full" />
              </div>
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        ) : tryout ? (
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="h-64 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-2 text-caps">{tryout.title}</h1>
                <p className="text-xl">
                  {new Date(tryout.date).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(tryout.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-caps">INFORMAÇÕES DA PENEIRA</CardTitle>
                      <Badge 
                        className={
                          tryout.status === 'active' 
                            ? 'status-badge-active' 
                            : tryout.status === 'completed' 
                            ? 'bg-gray-500' 
                            : 'bg-red-500'
                        }
                      >
                        {tryout.status === 'active' ? 'ATIVO' : tryout.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Data e Hora</p>
                          <p className="text-muted-foreground">
                            {new Date(tryout.date).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(tryout.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Local</p>
                          <p className="text-muted-foreground">{tryout.city}, {tryout.state}</p>
                          {tryout.venue && <p className="text-sm text-muted-foreground">{tryout.venue}</p>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Categoria</p>
                          <p className="text-muted-foreground">
                            {tryout.ageMinimum && tryout.ageMaximum
                              ? `${tryout.ageMinimum} a ${tryout.ageMaximum} anos`
                              : 'Todas as idades'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-primary">⚽</div>
                        <div>
                          <p className="font-medium">Modalidade</p>
                          <p className="text-muted-foreground">{tryout.modality}</p>
                        </div>
                      </div>
                    </div>

                    {tryout.description && (
                      <div>
                        <h3 className="font-medium mb-2">Descrição</h3>
                        <p className="text-muted-foreground">{tryout.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact & Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tryout.contactInfo && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Phone className="h-5 w-5" />
                          <span>CONTATO</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{tryout.contactInfo}</p>
                      </CardContent>
                    </Card>
                  )}

                  {tryout.requiredDocuments && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>DOCUMENTOS</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{tryout.requiredDocuments}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {tryout.organizerDetails && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <span>ORGANIZADOR</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{tryout.organizerDetails}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Comments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-caps">COMENTÁRIOS E PERGUNTAS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="space-y-4">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Adicione um comentário ou faça uma pergunta..."
                        rows={3}
                      />
                      <Button 
                        type="submit" 
                        className="cta-button"
                        disabled={addCommentMutation.isPending || !comment.trim()}
                      >
                        {addCommentMutation.isPending ? "PUBLICANDO..." : "PUBLICAR COMENTÁRIO"}
                      </Button>
                    </form>

                    {/* Comments List */}
                    {commentsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : comments && comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment: any) => (
                          <div key={comment.id} className="p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Usuário #{comment.userId.slice(-4)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <p className="whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum comentário ainda. Seja o primeiro a comentar!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Registration Card */}
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-caps">INSCRIÇÃO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-primary to-secondary rounded-lg text-white">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-bold text-lg">
                        {new Date(tryout.date) > new Date() ? 'INSCRIÇÕES ABERTAS' : 'PENEIRA ENCERRADA'}
                      </p>
                      <p className="text-sm opacity-90">
                        {new Date(tryout.date) > new Date() 
                          ? 'Não perca esta oportunidade!'
                          : 'Esta peneira já aconteceu'
                        }
                      </p>
                    </div>

                    {new Date(tryout.date) > new Date() && (
                      <Button 
                        onClick={handleRegister}
                        className="cta-button w-full text-lg py-6"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "INSCREVENDO..." : "INSCREVER-SE"}
                      </Button>
                    )}

                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• Inscrição gratuita via plataforma</p>
                      <p>• Confirmação por email</p>
                      <p>• Leve os documentos necessários</p>
                      <p>• Chegue com antecedência</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Peneira não encontrada</h1>
              <p className="text-muted-foreground">A peneira que você está procurando não existe.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
