import { useState } from "react";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { CartProvider } from "@/contexts/CartContext";
import AppNavbar from "@/components/AppNavbar";
import HeroSection from "@/components/HeroSection";
import MenuGrid from "@/components/MenuGrid";
import AdminPanel from "@/components/AdminPanel";
import CartSidebar from "@/components/CartSidebar";
import CartFAB from "@/components/CartFAB";

function AppContent() {
  const { isAdmin } = useAdmin();
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar showAdmin={showAdmin} onToggleAdmin={() => setShowAdmin(!showAdmin)} />
      {isAdmin && showAdmin && <AdminPanel />}
      <HeroSection />
      <MenuGrid />
      <CartFAB />
      <CartSidebar />
      <footer className="border-t border-border py-8 text-center text-muted-foreground text-xs">
        &copy; {new Date().getFullYear()} · Powered by love for great food
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
