import { Switch, Route, Redirect } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { format } from "date-fns";
import DailyView from "@/pages/DailyView";
import TrendsView from "@/pages/TrendsView";
import SettingsView from "@/pages/SettingsView";
import LoginView from "@/pages/LoginView";
import NotFound from "@/pages/not-found";

function Router() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    
    if (user) {
      setIsLoggedIn(true);
    } else {
      // Check if remember me is enabled for auto-login
      const rememberMeData = localStorage.getItem("rememberMe");
      if (rememberMeData) {
        try {
          const { username, enabled } = JSON.parse(rememberMeData);
          if (enabled && username) {
            // Auto-login
            localStorage.setItem("user", JSON.stringify({ username }));
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } catch {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

  if (isLoggedIn === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center" />;
  }

  return (
    <Switch>
      <Route path="/login" component={LoginView} />
      <Route path="/" component={() => isLoggedIn ? <Redirect to={`/day/${today}`} /> : <Redirect to="/login" />} />
      <Route path="/day/:date" component={() => isLoggedIn ? <DailyView /> : <Redirect to="/login" />} />
      <Route path="/trends" component={() => isLoggedIn ? <TrendsView /> : <Redirect to="/login" />} />
      <Route path="/settings" component={() => isLoggedIn ? <SettingsView /> : <Redirect to="/login" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
