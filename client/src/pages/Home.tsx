import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import TryoutCard from "@/components/TryoutCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState({
    city: "",
    state: "",
    modality: "Campo",
    dateOfBirth: "",
  });

  const [sortOrder, setSortOrder] = useState("Mais Recentes");

  const { data: tryouts, isLoading: tryoutsLoading } = useQuery({
    queryKey: ["/api/tryouts", searchFilters],
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
