import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Activity } from "lucide-react";
import { format } from "date-fns";

export default function LoginView() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      localStorage.setItem("user", JSON.stringify({ username: username.trim() }));
      setLocation(`/day/${format(new Date(), "yyyy-MM-dd")}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Health Tracker</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start tracking your health
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-sm font-medium mb-2 block">Enter your name</label>
              <Input
                type="text"
                placeholder="e.g., John"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                data-testid="input-username"
              />
            </div>

            {/* Login Button */}
            <Button 
              type="submit"
              className="w-full"
              disabled={!username.trim() || isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Get Started"}
            </Button>
          </form>

          <div className="text-xs text-center text-muted-foreground">
            Your data is stored locally on this device
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
