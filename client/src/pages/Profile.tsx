import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import SubscriptionPanel from "@/components/SubscriptionPanel";
import VideoPortfolio from "@/components/VideoPortfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { PlayerProfile, ClubHistory, Subscription } from "@shared/schema";

const footballPositions = [
  "Goleiro", "Zagueiro", "Lateral Direito", "Lateral Esquerdo",
  "Volante", "Meia", "Atacante", "Ponta", "Centroavante",
  "Ala (Futsal)", "Fixo (Futsal)", "Universal (Futsal)"
];

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState({
    bio: "",
    dateOfBirth: "",
    gender: "",
    position: "",
    modality: "Campo",
    state: "",
    city: "",
  });

  const [clubData, setClubData] = useState({
    clubName: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    level: "Base",
  });

  const [isClubDialogOpen, setIsClubDialogOpen] = useState(false);

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

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery<PlayerProfile | null>({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  // Fetch club history
  const { data: clubHistory, isLoading: clubHistoryLoading } = useQuery<ClubHistory[]>({
    queryKey: ["/api/profile", profile?.id, "clubs"],
    enabled: !!profile?.id,
  });

  // Fetch subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription | null>({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated,
  });

  // Update profile data when loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        bio: profile.bio || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        position: profile.position || "",
        modality: profile.modality || "Campo",
        state: profile.state || "",
        city: profile.city || "",
      });
    }
  }, [profile]);

  // Create/Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      if (profile) {
        return await apiRequest("PUT", "/api/profile", data);
      } else {
        return await apiRequest("POST", "/api/profile", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
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
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
    },
  });

  // Add club history mutation
  const addClubMutation = useMutation({
    mutationFn: async (data: typeof clubData) => {
      return await apiRequest("POST", `/api/profile/${profile!.id}/clubs`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profile?.id, "clubs"] });
      setIsClubDialogOpen(false);
      setClubData({
        clubName: "",
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear(),
        level: "Base",
      });
      toast({
        title: "Clube adicionado",
        description: "Histórico de clube atualizado com sucesso!",
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
        description: "Não foi possível adicionar o clube",
        variant: "destructive",
      });
    },
  });

  // Delete club mutation
  const deleteClubMutation = useMutation({
    mutationFn: async (clubId: number) => {
      return await apiRequest("DELETE", `/api/clubs/${clubId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profile?.id, "clubs"] });
      toast({
        title: "Clube removido",
        description: "Histórico de clube atualizado com sucesso!",
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
        description: "Não foi possível remover o clube",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(profileData);
  };

  const handleClubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClubMutation.mutate(clubData);
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <Card className="gradient-primary text-white">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <Avatar className="w-24 h-24 border-4 border-white">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-2xl bg-white text-primary">
                      {profile?.bio?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || "PF"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold mb-2">
                      {profile?.bio || "Seu Nome"}
                    </h1>
                    <p className="text-white/80 mb-4 max-w-md">
                      {profileData.bio || "Adicione uma biografia para se destacar"}
                    </p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      {profileData.state && (
                        <div className="text-center">
                          <div className="text-white font-bold">📍</div>
                          <div className="text-xs text-white/80">{profileData.state}</div>
                        </div>
                      )}
                      {profileData.dateOfBirth && (
                        <div className="text-center">
                          <div className="text-white font-bold">📅</div>
                          <div className="text-xs text-white/80">{calculateAge(profileData.dateOfBirth)} anos</div>
                        </div>
                      )}
                      {profileData.position && (
                        <div className="text-center">
                          <div className="text-white font-bold">🎯</div>
                          <div className="text-xs text-white/80">{profileData.position}</div>
                        </div>
                      )}
                      {profileData.modality && (
                        <div className="text-center">
                          <div className="text-white font-bold">🏟️</div>
                          <div className="text-xs text-white/80">{profileData.modality}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-caps">INFORMAÇÕES PESSOAIS</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome Completo</label>
                      <Input
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                      <Input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Gênero</label>
                      <Select value={profileData.gender} onValueChange={(value) => setProfileData({...profileData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Feminino">Feminino</SelectItem>
                          <SelectItem value="Prefiro não dizer">Prefiro não dizer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Posição</label>
                      <Select value={profileData.position} onValueChange={(value) => setProfileData({...profileData, position: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar posição" />
                        </SelectTrigger>
                        <SelectContent>
                          {footballPositions.map(position => (
                            <SelectItem key={position} value={position}>{position}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Modalidade</label>
                      <Select value={profileData.modality} onValueChange={(value) => setProfileData({...profileData, modality: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Campo">Campo</SelectItem>
                          <SelectItem value="Futsal">Futsal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Estado</label>
                      <Select value={profileData.state} onValueChange={(value) => setProfileData({...profileData, state: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cidade</label>
                      <Input
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        placeholder="Sua cidade"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="cta-button w-full"
                    disabled={profileMutation.isPending}
                  >
                    {profileMutation.isPending ? "SALVANDO..." : "SALVAR PERFIL"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Club History */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-caps">CLUBES E TIMES QUE JÁ PASSOU</CardTitle>
                  <Dialog open={isClubDialogOpen} onOpenChange={setIsClubDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        ADICIONAR CLUBE
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Clube</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleClubSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nome do Clube</label>
                          <Input
                            value={clubData.clubName}
                            onChange={(e) => setClubData({...clubData, clubName: e.target.value})}
                            placeholder="Ex: Corinthians Base"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Ano de Início</label>
                            <Input
                              type="number"
                              value={clubData.startYear}
                              onChange={(e) => setClubData({...clubData, startYear: parseInt(e.target.value)})}
                              min="1950"
                              max={new Date().getFullYear()}
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Ano de Fim</label>
                            <Input
                              type="number"
                              value={clubData.endYear}
                              onChange={(e) => setClubData({...clubData, endYear: parseInt(e.target.value)})}
                              min={clubData.startYear}
                              max={new Date().getFullYear()}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Nível</label>
                          <Select value={clubData.level} onValueChange={(value) => setClubData({...clubData, level: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Base">Base</SelectItem>
                              <SelectItem value="Amador">Amador</SelectItem>
                              <SelectItem value="Profissional">Profissional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button 
                          type="submit" 
                          className="cta-button w-full"
                          disabled={addClubMutation.isPending}
                        >
                          {addClubMutation.isPending ? "ADICIONANDO..." : "ADICIONAR CLUBE"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {clubHistoryLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : clubHistory && clubHistory.length > 0 ? (
                  <div className="space-y-2">
                    {clubHistory.map((club: any) => (
                      <div key={club.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <span className="font-medium">{club.clubName}</span>
                          <div className="text-sm text-muted-foreground">
                            {club.startYear} - {club.endYear || 'Atual'} • {club.level}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteClubMutation.mutate(club.id)}
                          disabled={deleteClubMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum clube adicionado ainda. Clique em "Adicionar Clube" para começar.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Video Portfolio */}
            {profile?.id && <VideoPortfolio profileId={profile.id} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            {subscription && <SubscriptionPanel subscription={subscription} />}
          </div>
        </div>
      </div>
    </div>
  );
}
