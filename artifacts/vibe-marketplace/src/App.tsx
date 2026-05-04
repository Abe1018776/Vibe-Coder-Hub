import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import GigBoard from "@/pages/GigBoard";
import CreateGig from "@/pages/CreateGig";
import GigDetail from "@/pages/GigDetail";
import GigPublic from "@/pages/GigPublic";
import GigPublicBySlug from "@/pages/GigPublicBySlug";
import Freelancers from "@/pages/Freelancers";
import CreateFreelancer from "@/pages/CreateFreelancer";
import FreelancerProfile from "@/pages/FreelancerProfile";
import Availability from "@/pages/Availability";
import Showcase from "@/pages/Showcase";
import Tags from "@/pages/Tags";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public gig reply pages — no layout, no auth */}
      <Route path="/gigs/public/:slug" component={GigPublicBySlug} />
      <Route path="/gigs/:id/public" component={GigPublic} />

      {/* All other pages use sidebar layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/gigs" component={GigBoard} />
            <Route path="/gigs/new" component={CreateGig} />
            <Route path="/gigs/:id" component={GigDetail} />
            <Route path="/freelancers" component={Freelancers} />
            <Route path="/freelancers/new" component={CreateFreelancer} />
            <Route path="/freelancers/:id" component={FreelancerProfile} />
            <Route path="/availability" component={Availability} />
            <Route path="/showcase" component={Showcase} />
            <Route path="/tags" component={Tags} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
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
