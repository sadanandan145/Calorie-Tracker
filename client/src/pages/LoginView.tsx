import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Activity, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface UserRegistry {
  [username: string]: string; // username -> password mapping
}

function getUserRegistry(): UserRegistry {
  const stored = localStorage.getItem("users_registry");
  return stored ? JSON.parse(stored) : {};
}

function setUserRegistry(registry: UserRegistry) {
  localStorage.setItem("users_registry", JSON.stringify(registry));
}

export default function LoginView() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (pwd: string): boolean => {
    return /^\d{4}$/.test(pwd);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be 4 digits");
      return;
    }

    setIsLoading(true);

    try {
      const normalizedUsername = username.trim().toLowerCase();
      const registry = getUserRegistry();

      // Check if user exists
      if (registry[normalizedUsername]) {
        // Existing user - validate password
        if (registry[normalizedUsername] !== password) {
          setError("Incorrect password");
          setIsLoading(false);
          return;
        }
      } else {
        // New user - create account
        registry[normalizedUsername] = password;
        setUserRegistry(registry);
      }

      // Login successful
      localStorage.setItem("user", JSON.stringify({ username: normalizedUsername }));
      
      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", JSON.stringify({ 
          username: normalizedUsername,
          enabled: true 
        }));
      } else {
        localStorage.removeItem("rememberMe");
      }
      
      setLocation(`/day/${format(new Date(), "yyyy-MM-dd")}`);
    } catch (err) {
      setError("Login failed. Please try again.");
      setIsLoading(false);
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
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <Input
                type="text"
                placeholder="e.g., john"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                disabled={isLoading}
                data-testid="input-username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium mb-2 block">Password (4 digits)</label>
              <Input
                type="password"
                placeholder="e.g., 1234"
                value={password}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPassword(val);
                }}
                maxLength={4}
                disabled={isLoading}
                data-testid="input-password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                First login creates your account
              </p>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                data-testid="checkbox-remember-me"
                className="rounded"
              />
              <label htmlFor="remember-me" className="text-sm cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <Button 
              type="submit"
              className="w-full"
              disabled={!username.trim() || !password || isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login"}
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
