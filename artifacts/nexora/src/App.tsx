import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import CrmPage from "@/pages/CrmPage";
import TicketsPage from "@/pages/TicketsPage";
import FieldServicePage from "@/pages/FieldServicePage";
import HrPage from "@/pages/HrPage";
import FinancePage from "@/pages/FinancePage";
import OmnichannelPage from "@/pages/OmnichannelPage";
import AiPage from "@/pages/AiPage";
import GamificationPage from "@/pages/GamificationPage";
import AutomationsPage from "@/pages/AutomationsPage";
import PricingPage from "@/pages/PricingPage";
import BusinessHealthPage from "@/pages/BusinessHealthPage";
import CustomerSuccessPage from "@/pages/CustomerSuccessPage";
import ContractsPage from "@/pages/ContractsPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/app/dashboard">
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/app/health-score">
        <AppLayout><BusinessHealthPage /></AppLayout>
      </Route>
      <Route path="/app/customer-success">
        <AppLayout><CustomerSuccessPage /></AppLayout>
      </Route>
      <Route path="/app/contracts">
        <AppLayout><ContractsPage /></AppLayout>
      </Route>
      <Route path="/app/crm">
        <AppLayout><CrmPage /></AppLayout>
      </Route>
      <Route path="/app/tickets">
        <AppLayout><TicketsPage /></AppLayout>
      </Route>
      <Route path="/app/field-service">
        <AppLayout><FieldServicePage /></AppLayout>
      </Route>
      <Route path="/app/hr">
        <AppLayout><HrPage /></AppLayout>
      </Route>
      <Route path="/app/finance">
        <AppLayout><FinancePage /></AppLayout>
      </Route>
      <Route path="/app/omnichannel">
        <AppLayout><OmnichannelPage /></AppLayout>
      </Route>
      <Route path="/app/ai">
        <AppLayout><AiPage /></AppLayout>
      </Route>
      <Route path="/app/gamification">
        <AppLayout><GamificationPage /></AppLayout>
      </Route>
      <Route path="/app/automations">
        <AppLayout><AutomationsPage /></AppLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
