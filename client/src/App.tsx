import { Switch, Route, Router, useHashLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallPrompt } from "@/components/InstallPrompt";
import { StorageRecovery } from "@/components/StorageRecovery";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CreateTemplate from "@/pages/CreateTemplate";
import EditTemplate from "@/pages/EditTemplate";
import SendTemplate from "@/pages/SendTemplate";

function AppRoutes() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={CreateTemplate} />
        <Route path="/edit/:id" component={EditTemplate} />
        <Route path="/send/:id" component={SendTemplate} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRoutes />
        <InstallPrompt />
        <StorageRecovery />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
