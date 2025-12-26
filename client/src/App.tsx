import { Switch, Route, Redirect } from "wouter";
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

  return (
    <Switch>
      <Route path="/" component={() => <Redirect to={`/day/${today}`} />} />
      <Route path="/day/:date" component={DailyView} />
      <Route path="/trends" component={TrendsView} />
      <Route path="/settings" component={SettingsView} />
      <Route path="/login" component={LoginView} />
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
