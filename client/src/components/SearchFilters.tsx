import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { brazilianCities, brazilianStates } from "@/data/brazilianCities";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  onSearch: (filters: {
    city: string;
    state: string;
    modality: string;
    dateOfBirth: string;
  }) => void;
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    modality: "Campo",
    dateOfBirth: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleModalityToggle = (modality: string) => {
    setFilters({ ...filters, modality });
  };

  // Filter cities based on selected state
  const filteredCities = filters.state 
    ? brazilianCities.filter(city => city.state === filters.state)
    : brazilianCities;

  // Format date input to DD/MM/YY
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 7);
    }
    
    setFilters({ ...filters, dateOfBirth: value });
  };

  return (
    <Card className="bg-card rounded-2xl max-w-4xl mx-auto shadow-2xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* State Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-caps">ESTADO</label>
              <Select 
                value={filters.state} 
                onValueChange={(value) => setFilters({ ...filters, state: value === "all" ? "" : value, city: "" })}
              >
                <SelectTrigger className="w-full bg-input border-border text-foreground focus:border-primary">
                  <SelectValue placeholder="Selecionar estado..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Todos os estados</SelectItem>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name} ({state.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-caps">CIDADE</label>
              <Select 
                value={filters.city} 
                onValueChange={(value) => setFilters({ ...filters, city: value === "all" ? "" : value })}
                disabled={!filters.state}
              >
                <SelectTrigger className="w-full bg-input border-border text-foreground focus:border-primary">
                  <SelectValue placeholder={filters.state ? "Selecionar cidade..." : "Primeiro selecione o estado"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {filteredCities.map((city) => (
                    <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Age Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-caps">DATA DE NASCIMENTO</label>
              <Input 
                type="text"
                placeholder="DD/MM/AA"
                value={filters.dateOfBirth}
                onChange={handleDateChange}
                maxLength={8}
                className="w-full bg-input border-border text-foreground focus:border-primary"
              />
            </div>
          </div>

          {/* Modality Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-caps">MODALIDADE</label>
            <div className="flex bg-input rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleModalityToggle("Campo")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-caps ${
                  filters.modality === "Campo"
                    ? "bg-primary text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                CAMPO
              </button>
              <button
                type="button"
                onClick={() => handleModalityToggle("Futsal")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-caps ${
                  filters.modality === "Futsal"
                    ? "bg-primary text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                FUTSAL
              </button>
            </div>
          </div>
          
          {/* Search Button */}
          <Button 
            type="submit"
            className="w-full cta-button font-bold py-4 px-6 text-lg text-caps"
          >
            <Search className="h-5 w-5 mr-2" />
            BUSCAR PENEIRAS
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
