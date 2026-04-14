import { useState, useEffect } from "react";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { CartProvider } from "@/contexts/CartContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { applyTheme, getThemeById } from "@/lib/themes";
import AppNavbar from "@/components/AppNavbar";
import HeroSection from "@/components/HeroSection";
import MenuGrid from "@/components/MenuGrid";
import AdminPanel from "@/components/AdminPanel";
import ContactSection from "@/components/ContactSection";
import CartSidebar from "@/components/CartSidebar";
import CartFAB from "@/components/CartFAB";
import GallerySection from "@/components/GallerySection";
import FloatingNavSelector from "@/components/FloatingNavSelector";

function AppContent() {
  const { isAdmin } = useAdmin();
  const [showAdmin, setShowAdmin] = useState(false);
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
      {settings?.show_gallery && <GallerySection />}
      <ContactSection />
      <CartFAB />
      <CartSidebar />
      <FloatingNavSelector />
      <footer className="border-t border-border py-8 text-center">
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} · Powered by love for great food
        </p>
      </footer>
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
