import { Switch, Route, Redirect, useLocation } from "wouter";
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

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

  // When logged in, ensure we're on today's date
  useEffect(() => {
    if (isLoggedIn === true) {
      const today = format(new Date(), "yyyy-MM-dd");
      const currentLocation = window.location.pathname;
      
      // If on a day route but not today, redirect to today
      if (currentLocation.startsWith("/day/")) {
        const dateMatch = currentLocation.match(/\/day\/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch && dateMatch[1] !== today) {
          setLocation(`/day/${today}`);
        }
      }
    }
  }, [isLoggedIn, setLocation]);

  if (isLoggedIn === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center" />;
  }

  const today = format(new Date(), "yyyy-MM-dd");

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
