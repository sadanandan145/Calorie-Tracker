import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Activity, ChevronLeft } from "lucide-react";

export default function LoginView() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDemoLogin = () => {
    // For now, just redirect to app
    setLocation("/trends");
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
            {mode === "login" ? "Welcome back" : "Get started tracking"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Demo Banner */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-semibold">Free Tier:</span> Auth system coming soon. Try the demo to explore.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="opacity-50"
              data-testid="input-login-email"
            />
            <p className="text-xs text-muted-foreground mt-1">Coming in next update</p>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled
              className="opacity-50"
              data-testid="input-login-password"
            />
          </div>

          {/* Demo Button */}
          <Button 
            onClick={handleDemoLogin}
            className="w-full"
            data-testid="button-try-demo"
          >
            Try Demo
          </Button>

          {/* Toggle Mode */}
          <div className="text-center text-sm">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline"
              disabled
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>

          {/* Back Button */}
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => setLocation("/trends")}
            data-testid="button-back-login"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
