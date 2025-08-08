import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Crown, Star, Gift } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AthleteRanking {
  id: string;
  name: string;
  points: number;
  position: string;
  age: number;
  city: string;
  state: string;
  avatar?: string;
}

export default function Ranking() {
  const [athletes, setAthletes] = useState<AthleteRanking[]>([]);

  useEffect(() => {
    // Mock data - In a real app, this would come from an API
    setAthletes([
      {
        id: "1",
        name: "João Silva",
        points: 150,
        position: "Atacante",
        age: 17,
        city: "São Paulo",
        state: "SP",
        avatar: "/api/placeholder/64/64"
      },
      {
        id: "2", 
        name: "Maria Santos",
        points: 145,
        position: "Meio-campo",
        age: 16,
        city: "Rio de Janeiro",
        state: "RJ",
        avatar: "/api/placeholder/64/64"
      },
      {
        id: "3",
        name: "Pedro Costa",
        points: 140,
        position: "Defensor",
        age: 18,
        city: "Belo Horizonte",
        state: "MG",
        avatar: "/api/placeholder/64/64"
      },
      {
        id: "4",
        name: "Ana Oliveira",
        points: 135,
        position: "Goleira",
        age: 17,
        city: "Porto Alegre",
        state: "RS",
        avatar: "/api/placeholder/64/64"
      },
      {
        id: "5",
        name: "Carlos Ferreira",
        points: 130,
        position: "Lateral",
        age: 16,
        city: "Salvador",
        state: "BA",
        avatar: "/api/placeholder/64/64"
      }
    ]);
  }, []);

  const topThree = athletes.slice(0, 3);
  const remainingAthletes = athletes.slice(3);

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getPodiumEmoji = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏆";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-background via-gray-800 to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-caps">
              🏆 RANKING EXCLUSIVO
            </h1>
            <p className="text-lg text-muted-foreground font-medium text-caps">
              OS MELHORES ATLETAS DO PENEIRA FÁCIL
            </p>
          </div>
        </div>
      </section>

      {/* Pódium do Campeão - Versão Única */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-caps flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              PÓDIUM DO CAMPEÃO
            </h2>
            <p className="text-muted-foreground">
              Os 3 atletas com maior pontuação do mês
            </p>
          </div>

          {/* Podium Display */}
          <div className="flex flex-col md:flex-row items-end justify-center gap-8 mb-12">
            {/* 2º Lugar */}
            {topThree[1] && (
              <div className="flex flex-col items-center order-1 md:order-1">
                <div className="bg-gradient-to-b from-gray-200 to-gray-400 rounded-lg p-6 mb-4 min-h-[200px] flex flex-col justify-end items-center shadow-lg">
                  <div className="text-6xl mb-2">🥈</div>
                  <Badge variant="secondary" className="mb-2">2º Lugar</Badge>
                  <Avatar className="w-16 h-16 mb-3 border-4 border-gray-300">
                    <AvatarImage src={topThree[1].avatar} />
                    <AvatarFallback>{topThree[1].name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-center">{topThree[1].name}</h3>
                  <p className="text-sm text-muted-foreground">{topThree[1].position}</p>
                  <p className="text-lg font-bold text-primary">{topThree[1].points} pts</p>
                </div>
              </div>
            )}

            {/* 1º Lugar */}
            {topThree[0] && (
              <div className="flex flex-col items-center order-2 md:order-2">
                <div className="bg-gradient-to-b from-yellow-200 to-yellow-500 rounded-lg p-8 mb-4 min-h-[250px] flex flex-col justify-end items-center shadow-xl transform scale-110">
                  <div className="text-8xl mb-3">🥇</div>
                  <Badge className="mb-3 bg-yellow-600 text-white">CAMPEÃO</Badge>
                  <Avatar className="w-20 h-20 mb-4 border-4 border-yellow-400">
                    <AvatarImage src={topThree[0].avatar} />
                    <AvatarFallback>{topThree[0].name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl text-center">{topThree[0].name}</h3>
                  <p className="text-sm text-muted-foreground">{topThree[0].position}</p>
                  <p className="text-xl font-bold text-primary">{topThree[0].points} pts</p>
                </div>
              </div>
            )}

            {/* 3º Lugar */}
            {topThree[2] && (
              <div className="flex flex-col items-center order-3 md:order-3">
                <div className="bg-gradient-to-b from-amber-200 to-amber-600 rounded-lg p-6 mb-4 min-h-[180px] flex flex-col justify-end items-center shadow-lg">
                  <div className="text-6xl mb-2">🥉</div>
                  <Badge variant="outline" className="mb-2 border-amber-600">3º Lugar</Badge>
                  <Avatar className="w-16 h-16 mb-3 border-4 border-amber-500">
                    <AvatarImage src={topThree[2].avatar} />
                    <AvatarFallback>{topThree[2].name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-center">{topThree[2].name}</h3>
                  <p className="text-sm text-muted-foreground">{topThree[2].position}</p>
                  <p className="text-lg font-bold text-primary">{topThree[2].points} pts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prêmios Mensais - Texto Atualizado */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Gift className="h-6 w-6 text-primary" />
                🎁 Prêmios Mensais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg leading-relaxed">
                <p className="mb-4">
                  <strong>No dia 30 de cada mês, o 1º colocado do ranking ganha um prêmio exclusivo do Peneira Fácil.</strong>
                </p>
                <p className="text-muted-foreground">
                  O 2º e 3º lugares ganham apenas destaque visual no ranking, sem brindes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ranking Completo */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-caps text-center">
            RANKING COMPLETO
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {athletes.map((athlete, index) => (
              <Card key={athlete.id} className={`transition-all hover:shadow-lg ${
                index < 3 ? 'border-primary bg-primary/5' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                      <span className="text-2xl">{getPodiumEmoji(index + 1)}</span>
                    </div>
                    
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={athlete.avatar} />
                      <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{athlete.name}</h3>
                        {index < 3 && (
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            {index === 0 ? "CAMPEÃO" : `${index + 1}º LUGAR`}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {athlete.position} • {athlete.age} anos • {athlete.city}, {athlete.state}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{athlete.points}</p>
                      <p className="text-sm text-muted-foreground">pontos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

