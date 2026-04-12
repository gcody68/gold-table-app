import { useState, useEffect } from "react";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { CartProvider } from "@/contexts/CartContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { applyTheme, getThemeById } from "@/lib/themes";
import AppNavbar from "@/components/AppNavbar";
import HeroSection from "@/components/HeroSection";
import MenuGrid from "@/components/MenuGrid";
import AdminPanel from "@/components/AdminPanel";
import ProfitCalculator from "@/components/ProfitCalculator";
import CartSidebar from "@/components/CartSidebar";
import CartFAB from "@/components/CartFAB";
import AdminLoginModal from "@/components/AdminLoginModal";
import { Shield } from "lucide-react";

function AppContent() {
  const { isAdmin } = useAdmin();
  const [showAdmin, setShowAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { data: settings } = useRestaurantSettings();

  useEffect(() => {
    if (settings?.theme) {
      applyTheme(getThemeById(settings.theme));
    }
  }, [settings?.theme]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar showAdmin={showAdmin} onToggleAdmin={() => setShowAdmin(!showAdmin)} />
      {isAdmin && showAdmin && <AdminPanel />}
      <HeroSection />
      <MenuGrid />
      <ProfitCalculator />
      <CartFAB />
      <CartSidebar />
      <footer className="border-t border-border py-8 text-center space-y-4">
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} · Powered by love for great food
        </p>
        {!isAdmin && (
          <button
            onClick={() => setLoginOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors text-sm"
          >
            <Shield className="w-4 h-4" />
            Owner Login / Admin Dashboard
          </button>
        )}
      </footer>
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

export default function Index() {
  return (
    <AdminProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AdminProvider>
  );
}
