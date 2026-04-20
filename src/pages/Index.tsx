import { useState, useEffect } from "react";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { CartProvider } from "@/contexts/CartContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { applyTheme, getThemeById } from "@/lib/themes";
import { applyBgStyle, getBgStyleById } from "@/components/BackgroundStyleSelector";
import AppNavbar from "@/components/AppNavbar";
import HeroSection from "@/components/HeroSection";
import MenuGrid from "@/components/MenuGrid";
import AdminPanel from "@/components/AdminPanel";
import CartSidebar from "@/components/CartSidebar";
import CartFAB from "@/components/CartFAB";
import GallerySection from "@/components/GallerySection";
import FloatingNavSelector from "@/components/FloatingNavSelector";

function AppContent() {
  const { isAdmin } = useAdmin();
  const { restaurantId } = useRestaurant();
  const { data: settings } = useRestaurantSettings(restaurantId);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (settings) {
      applyBgStyle(getBgStyleById(settings.bg_style || "deep-charcoal"));
      applyTheme(getThemeById(settings.theme || "midnight-gold"));
    }
  }, [settings?.theme, settings?.bg_style]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar restaurantId={restaurantId} showAdmin={showAdmin} onToggleAdmin={() => setShowAdmin((v) => !v)} />
      {isAdmin && showAdmin && <AdminPanel restaurantId={restaurantId} />}
      <HeroSection restaurantId={restaurantId} />
      <MenuGrid restaurantId={restaurantId} />
      <GallerySection restaurantId={restaurantId} />
      <CartFAB />
      <CartSidebar restaurantId={restaurantId} />
      <FloatingNavSelector restaurantId={restaurantId} />
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
