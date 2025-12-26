import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navigation } from "./Navigation";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUsername(parsed.username);
      } catch {
        setUsername(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {username && (
        <header className="bg-muted/30 border-b border-border/50 sticky top-0 z-50">
          <div className="max-w-md mx-auto w-full px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-medium">Hi {username}</p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="gap-2 h-8"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Logout</span>
            </Button>
          </div>
        </header>
      )}
      <main className="max-w-md mx-auto w-full px-4 pt-4 sm:pt-8 animate-in fade-in duration-500">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
