import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import TryoutCard from "@/components/TryoutCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tryout } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState({
    city: "",
    state: "",
    modality: "Campo",
    dateOfBirth: "",
  });

  const [sortOrder, setSortOrder] = useState("Mais Recentes");

  const { data: tryouts, isLoading: tryoutsLoading } = useQuery<Tryout[]>({
    queryKey: ["/api/tryouts", searchFilters],
  });

  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Main Call to Action */}
      <section 
        className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-5 py-10 relative"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--hero-bg-start)) 0%, hsl(var(--hero-bg-end)) 100%)'
        }}
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-white font-semibold text-xl md:text-2xl tracking-wider">
              ENCONTRE A
            </h2>
            <h1 className="text-white font-bold text-4xl md:text-5xl tracking-wide leading-tight">
              PRÓXIMA
            </h1>
            <h1 
              className="font-extrabold text-5xl md:text-6xl leading-tight"
              style={{ color: 'hsl(var(--hero-primary))' }}
            >
              PENEIRA
            </h1>
          </div>
          
          <p 
            className="text-base md:text-lg leading-relaxed mx-auto max-w-[340px]"
            style={{ color: 'hsl(var(--hero-text-light))' }}
          >
            A plataforma que conecta atletas às melhores oportunidades do futebol brasileiro
          </p>
          
          <button
            className="w-full max-w-sm font-bold text-base md:text-lg px-8 py-4 rounded-xl transition-transform hover:scale-105 shadow-lg"
            style={{
              backgroundColor: 'hsl(var(--hero-primary))',
              color: 'hsl(var(--hero-bg-start))'
            }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            VER TODAS AS PENEIRAS
          </button>
        </div>
        
        {/* Optional football icon */}
        <div className="absolute top-8 left-8 text-4xl opacity-20">
          ⚽
        </div>
      </section>

      {/* Search & Filter Section */}
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
                  Nenhuma peneira encontrada com os filtros selecionados
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
