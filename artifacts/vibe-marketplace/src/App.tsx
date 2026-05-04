import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import GigBoard from "@/pages/GigBoard";
import CreateGig from "@/pages/CreateGig";
import GigDetail from "@/pages/GigDetail";
import GigPublic from "@/pages/GigPublic";
import GigPublicBySlug from "@/pages/GigPublicBySlug";
import GigThread from "@/pages/GigThread";
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

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#6366f1",
    colorForeground: "#0f0f11",
    colorMutedForeground: "#6b7280",
    colorDanger: "#ef4444",
    colorBackground: "#ffffff",
    colorInput: "#f9fafb",
    colorInputForeground: "#0f0f11",
    colorNeutral: "#e5e7eb",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border border-gray-100",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-gray-900 font-bold",
    headerSubtitle: "text-gray-500",
    socialButtonsBlockButtonText: "text-gray-700",
    formFieldLabel: "text-gray-700 font-medium",
    footerActionLink: "text-indigo-600 hover:text-indigo-700 font-medium",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-400",
    identityPreviewEditButton: "text-indigo-600",
    formFieldSuccessText: "text-green-600",
    alertText: "text-gray-700",
    logoBox: "mb-2",
    logoImage: "h-10 w-10",
    socialButtonsBlockButton: "border border-gray-200 bg-white hover:bg-gray-50",
    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-medium",
    formFieldInput: "border-gray-200 bg-gray-50 text-gray-900",
    footerAction: "bg-gray-50",
    dividerLine: "bg-gray-200",
    alert: "border-red-200 bg-red-50",
    otpCodeFieldInput: "border-gray-200",
    formFieldRow: "",
    main: "px-2",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ProtectedLayout() {
  return (
    <>
      <Show when="signed-in">
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
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public pages — no auth */}
      <Route path="/gigs/public/:slug" component={GigPublicBySlug} />
      <Route path="/gigs/:id/public" component={GigPublic} />
      <Route path="/gigs/thread/:token" component={GigThread} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />

      {/* All other pages require login */}
      <Route component={ProtectedLayout} />
    </Switch>
  );
}

function ClerkProviderWithRouter() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your Vibe Marketplace",
          },
        },
        signUp: {
          start: {
            title: "Join Vibe Marketplace",
            subtitle: "Create your account to get started",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRouter />
    </WouterRouter>
  );
}

export default App;
