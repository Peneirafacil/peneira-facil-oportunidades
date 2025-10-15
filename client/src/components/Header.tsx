import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Home, User, Phone, FileText, HelpCircle, LogOut, Bell } from "lucide-react";
import NotificationButton from "./NotificationButton";
import { supabase } from "@/integrations/supabase/client";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    { icon: Home, label: "Página Inicial", href: "/" },
    { icon: User, label: "Perfil", href: "/profile", authRequired: true },
    { icon: Phone, label: "Contato", href: "/contact" },
    { icon: FileText, label: "Termos", href: "/terms" },
    { icon: HelpCircle, label: "Suporte", href: "/support" },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-4">
          {/* Logo */}
          <div className="peneira-logo">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-secondary text-lg">⚽</span>
            </div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-caps">PENEIRA FÁCIL</h1>
            <p className="text-xs text-muted-foreground font-medium text-caps">
              PENEIRAS EM TODO BRASIL E TODOS OS DIAS!
            </p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationButton />
              <span className="hidden md:block text-sm text-muted-foreground">
                Olá, {user?.user_metadata?.name || user?.email || 'Usuário'}!
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="hidden md:flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button className="cta-button hidden md:block">
                ENTRAR
              </Button>
            </Link>
          )}

          {/* Hamburger Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="text-caps mb-6">MENU</SheetTitle>
              <nav className="space-y-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  
                  // Skip auth-required items if not authenticated
                  if (item.authRequired && !isAuthenticated) {
                    return null;
                  }
                  
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-primary hover:text-background ${
                          location === item.href ? 'bg-primary text-background' : ''
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
                
                {isAuthenticated ? (
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                    className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-red-500 hover:text-white w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sair</span>
                  </button>
                ) : (
                  <Link href="/auth">
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-lg transition-colors bg-primary text-background hover:bg-[hsl(var(--cta-green))] w-full text-left font-bold"
                    >
                      <User className="h-5 w-5" />
                      <span>ENTRAR</span>
                    </button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
