import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AuthFlow from "@/pages/auth/AuthFlow";

import Home from "@/pages/Home";
import Listings from "@/pages/Listings";
import ListingDetail from "@/pages/ListingDetail";
import Sell from "@/pages/Sell";
import Sellers from "@/pages/Sellers";
import SellerProfile from "@/pages/SellerProfile";
import Favorites from "@/pages/Favorites";
import Messages from "@/pages/Messages";
import Jobs from "@/pages/sections/Jobs";
import Roommates from "@/pages/sections/Roommates";
import Startups from "@/pages/sections/Startups";
import LostFound from "@/pages/sections/LostFound";
import Borrow from "@/pages/sections/Borrow";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-primary animate-spin" />
          <p className="font-black text-lg font-display">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthFlow />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/listings" component={Listings} />
          <Route path="/listings/:id" component={ListingDetail} />
          <Route path="/sell" component={Sell} />
          <Route path="/sellers" component={Sellers} />
          <Route path="/sellers/:id" component={SellerProfile} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/messages" component={Messages} />
          <Route path="/messages/:id" component={Messages} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/roommates" component={Roommates} />
          <Route path="/startups" component={Startups} />
          <Route path="/lost-found" component={LostFound} />
          <Route path="/borrow" component={Borrow} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
