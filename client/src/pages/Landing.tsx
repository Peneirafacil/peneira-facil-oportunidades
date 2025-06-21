import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import TryoutCard from "@/components/TryoutCard";
import AthleteProfile from "@/components/AthleteProfile";
import SubscriptionPanel from "@/components/SubscriptionPanel";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Landing() {
  const [searchFilters, setSearchFilters] = useState({
    city: "",
    state: "",
    modality: "Campo",
    dateOfBirth: "",
  });

  const [sortOrder, setSortOrder] = useState("Mais Recentes");

  const { data: tryouts, isLoading: tryoutsLoading } = useQuery({
    queryKey: ["/api/tryouts", searchFilters],
    enabled: Object.values(searchFilters).some(v => v !== ""),
  });

  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Tryout Discovery */}
      <section className="py-12 bg-gradient-to-br from-background via-gray-800 to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight text-caps">
              A OPORTUNIDADE QUE VOCÊ PROCURA NO FUTEBOL<br />
              <span className="text-primary">PODE ESTAR NA SUA CIDADE!</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium text-caps">
              OPORTUNIDADES EM CAMPO POR TODO O BRASIL.<br />
              ENCONTRE A SUA E ENTRE PRO JOGO.
            </p>
          </div>
          
          <SearchFilters onSearch={handleSearch} />
        </div>
      </section>

      {/* Recent Tryouts Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-caps">
              PENEIRAS POSTADAS RECENTEMENTE!
            </h2>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-card border border-border px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition-colors"
            >
              <option value="Mais Recentes">Mais Recentes</option>
              <option value="Mais Antigas">Mais Antigas</option>
            </select>
          </div>
          
          {/* Tryout Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tryoutsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : tryouts && tryouts.length > 0 ? (
              tryouts.map((tryout: any) => (
                <TryoutCard key={tryout.id} tryout={tryout} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Use os filtros acima para encontrar peneiras na sua região
                </p>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="mt-4 cta-button"
                >
                  FAZER LOGIN PARA VER TODAS AS PENEIRAS
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sample Athlete Profiles Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-caps">
            PERFIS DE ATLETAS EM DESTAQUE
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sample profiles - these would be loaded from API in real app */}
            <AthleteProfile 
              athlete={{
                name: "Gabriel Santos",
                bio: "Atacante promissor do interior de SP, busca oportunidade no futebol profissional",
                state: "São Paulo",
                age: 18,
                position: "Atacante",
                modality: "Campo",
                gender: "Masculino",
                clubHistory: [
                  { clubName: "Corinthians Base", startYear: 2020, endYear: 2022, level: "Base" },
                  { clubName: "EC Santo André", startYear: 2022, endYear: 2023, level: "Amador" }
                ],
                videos: []
              }}
            />
            <AthleteProfile 
              athlete={{
                name: "Maria Silva",
                bio: "Meio-campista técnica, destaque no futebol feminino do Rio de Janeiro",
                state: "Rio de Janeiro",
                age: 19,
                position: "Meia",
                modality: "Campo",
                gender: "Feminino",
                clubHistory: [
                  { clubName: "Flamengo Feminino", startYear: 2021, endYear: 2023, level: "Profissional" },
                  { clubName: "Vasco da Gama", startYear: 2023, endYear: 2024, level: "Profissional" }
                ],
                videos: []
              }}
            />
            <AthleteProfile 
              athlete={{
                name: "João Pereira",
                bio: "Zagueiro sólido de Minas Gerais, líder em campo e fora dele",
                state: "Minas Gerais",
                age: 17,
                position: "Zagueiro",
                modality: "Campo",
                gender: "Masculino",
                clubHistory: [
                  { clubName: "Atlético-MG Base", startYear: 2019, endYear: 2022, level: "Base" },
                  { clubName: "Cruzeiro Sub-17", startYear: 2022, endYear: 2024, level: "Base" }
                ],
                videos: []
              }}
            />
          </div>
        </div>
      </section>

      {/* Subscription Preview Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-caps">
              PLANO DE ASSINATURA
            </h2>
            
            <Card className="text-center p-8">
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-primary mb-2">R$ 12,00</h3>
                  <p className="text-muted-foreground">por mês</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-primary">✓</span>
                    <span>Acesso completo a todas as peneiras</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-primary">✓</span>
                    <span>Filtros avançados de busca</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-primary">✓</span>
                    <span>Perfil completo de atleta</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-primary">✓</span>
                    <span>Notificações personalizadas</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-primary">✓</span>
                    <span>Histórico de peneiras</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="cta-button text-lg px-8 py-4"
                >
                  COMEÇAR AGORA
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="peneira-logo w-10 h-10"></div>
                <h3 className="text-lg font-bold text-caps">PENEIRA FÁCIL</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Conectando talentos do futebol brasileiro com as melhores oportunidades em todo o país.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-caps">NAVEGAÇÃO</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Página Inicial</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Peneiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Perfil</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Assinatura</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-caps">SUPORTE</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-caps">REDES SOCIAIS</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                  <span>📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                  <span>📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                  <span>📺</span>
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                  <span>🎵</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PENEIRA FÁCIL. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
