import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";

// Page imports
function Home() { return <div className="p-8 text-white">Home Page placeholder</div>; }
function Dashboard() { return <div className="text-white">Dashboard placeholder</div>; }
function Crm() { return <div className="text-white">CRM placeholder</div>; }
function Tickets() { return <div className="text-white">Tickets placeholder</div>; }
function FieldService() { return <div className="text-white">Field Service placeholder</div>; }
function Hr() { return <div className="text-white">HR placeholder</div>; }
function Finance() { return <div className="text-white">Finance placeholder</div>; }
function Omnichannel() { return <div className="text-white">Omnichannel placeholder</div>; }
function Ai() { return <div className="text-white">AI placeholder</div>; }
function Gamification() { return <div className="text-white">Gamification placeholder</div>; }
function Automations() { return <div className="text-white">Automations placeholder</div>; }

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/app/dashboard">
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/app/crm">
        <AppLayout><Crm /></AppLayout>
      </Route>
      <Route path="/app/tickets">
        <AppLayout><Tickets /></AppLayout>
      </Route>
      <Route path="/app/field-service">
        <AppLayout><FieldService /></AppLayout>
      </Route>
      <Route path="/app/hr">
        <AppLayout><Hr /></AppLayout>
      </Route>
      <Route path="/app/finance">
        <AppLayout><Finance /></AppLayout>
      </Route>
      <Route path="/app/omnichannel">
        <AppLayout><Omnichannel /></AppLayout>
      </Route>
      <Route path="/app/ai">
        <AppLayout><Ai /></AppLayout>
      </Route>
      <Route path="/app/gamification">
        <AppLayout><Gamification /></AppLayout>
      </Route>
      <Route path="/app/automations">
        <AppLayout><Automations /></AppLayout>
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
