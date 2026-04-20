import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RestaurantProvider, useRestaurant } from "@/contexts/RestaurantContext";
import Index from "./pages/Index.tsx";
import Landing from "./pages/Landing.tsx";
import Kitchen from "./pages/Kitchen.tsx";
import Demo from "./pages/Demo.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function RootRoute() {
  const { resolution } = useRestaurant();

  if (resolution.status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // Bare domain / Vercel URL with no subdomain → show landing page
  if (resolution.status === "root") return <Landing />;

  // Valid subdomain/domain → show the restaurant menu
  if (resolution.status === "found") return <Index />;

  // Subdomain in URL but no matching restaurant
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-4xl">🍽️</p>
      <h1 className="text-2xl font-serif font-bold text-foreground">Restaurant Not Found</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        This address doesn't match any restaurant in our system. Double-check the URL or contact the restaurant for their correct link.
      </p>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RestaurantProvider>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/demo" element={<Demo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RestaurantProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
