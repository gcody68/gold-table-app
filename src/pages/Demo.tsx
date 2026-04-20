import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { DemoProvider, useDemo } from "@/contexts/DemoContext";
import { CartProvider } from "@/contexts/CartContext";
import { DemoAdminProvider } from "@/contexts/AdminContext";
import { DemoModeProvider, type DemoModeContextType } from "@/contexts/DemoModeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setImageUploadDemoMode } from "@/hooks/useImageUpload";
import { applyTheme, getThemeById } from "@/lib/themes";
import { applyBgStyle, getBgStyleById } from "@/components/BackgroundStyleSelector";
import AppNavbar from "@/components/AppNavbar";
import AdminPanel from "@/components/AdminPanel";
import HeroSection from "@/components/HeroSection";
import MenuGrid from "@/components/MenuGrid";
import CartSidebar from "@/components/CartSidebar";
import CartFAB from "@/components/CartFAB";
import GallerySection from "@/components/GallerySection";
import FloatingNavSelector from "@/components/FloatingNavSelector";
import { RotateCcw, X, Shield } from "lucide-react";
import { toast } from "sonner";
import type { GalleryItem } from "@/hooks/useGallery";
import type { RestaurantSettings } from "@/hooks/useRestaurantSettings";
import type { MenuItem } from "@/hooks/useMenuItems";

function DemoContent() {
  const {
    settings,
    menuItems,
    updateSettings,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    clearMenuItems,
    resetDemo,
    addDemoOrder,
  } = useDemo();

  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Enable in-memory image uploads
  useEffect(() => {
    setImageUploadDemoMode(true);
    return () => setImageUploadDemoMode(false);
  }, []);

  // Apply theme whenever settings change
  useEffect(() => {
    applyBgStyle(getBgStyleById((settings.bg_style as any) ?? "forest-dark"));
    applyTheme(getThemeById((settings.theme as any) ?? "sunwashed-citrus"));
  }, [settings.theme, settings.bg_style]);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: Infinity,
            retry: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  // Keep QueryClient cache in sync with DemoContext state
  useEffect(() => {
    const rs: RestaurantSettings = { ...settings };
    queryClient.setQueryData(["restaurant-settings", "owner"], rs);
    queryClient.setQueryData(["restaurant-settings", undefined], rs);
    queryClient.setQueryData(["restaurant-settings", null], rs);
  }, [settings, queryClient]);

  useEffect(() => {
    queryClient.setQueryData(["menu-items", "all"], menuItems);
    queryClient.setQueryData(["menu-items", undefined], menuItems);
    queryClient.setQueryData(["menu-items", null], menuItems);
  }, [menuItems, queryClient]);

  useEffect(() => {
    queryClient.setQueryData(["gallery-items", "all"], galleryItems);
    queryClient.setQueryData(["gallery-items", undefined], galleryItems);
    queryClient.setQueryData(["gallery-items", null], galleryItems);
  }, [galleryItems, queryClient]);

  const handleLogout = useCallback(() => {
    setShowAdmin(false);
    setIsAdminLoggedIn(false);
  }, []);

  const demoMode = useMemo<DemoModeContextType>(
    () => ({
      isDemo: true,
      updateSettings: (updates) => {
        updateSettings(updates);
      },
      getSettings: () => ({ ...settings } as RestaurantSettings),
      getMenuItems: () => menuItems,
      createMenuItem: (item) => createMenuItem({ ...item, restaurant_id: null } as any),
      upsertMenuItem: (id, updates) => {
        updateMenuItem(id, updates);
        queryClient.setQueryData(
          ["menu-items", "all"],
          (prev: MenuItem[] | undefined) =>
            (prev ?? []).map((m) => (m.id === id ? { ...m, ...updates } : m))
        );
      },
      deleteMenuItem: (id) => {
        deleteMenuItem(id);
        queryClient.setQueryData(
          ["menu-items", "all"],
          (prev: MenuItem[] | undefined) => (prev ?? []).filter((m) => m.id !== id)
        );
      },
      clearMenuItems: () => {
        clearMenuItems();
        queryClient.setQueryData(["menu-items", "all"], []);
      },
      decrementStock: (items) => {
        items.forEach(({ id, quantity }) => {
          updateMenuItem(id, {
            daily_stock: Math.max(
              0,
              (menuItems.find((m) => m.id === id)?.daily_stock ?? 0) - quantity
            ),
          });
        });
      },
      getGalleryItems: () => galleryItems,
      addGalleryItem: (item) => {
        const newItem: GalleryItem = {
          id: `demo-gallery-${Date.now()}`,
          restaurant_id: null,
          image_url: item.image_url,
          caption: item.caption ?? null,
          sort_order: Date.now(),
          created_at: new Date().toISOString(),
        };
        setGalleryItems((prev) => [...prev, newItem]);
      },
      deleteGalleryItem: (id) => {
        setGalleryItems((prev) => prev.filter((g) => g.id !== id));
      },
      submitOrder: (payload) => {
        addDemoOrder({
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          items: payload.items,
          total: payload.total,
        });
      },
    }),
    [settings, menuItems, galleryItems, updateSettings, createMenuItem, updateMenuItem, deleteMenuItem, clearMenuItems, addDemoOrder, queryClient]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DemoModeProvider value={demoMode}>
        <DemoAdminProvider onLogout={handleLogout} onLogin={() => { setIsAdminLoggedIn(true); setShowAdmin(true); }} isAdmin={isAdminLoggedIn}>
          <div className="min-h-screen bg-background">
            {/* Demo banner */}
            <div className="bg-amber-950/60 border-b border-amber-700/40 px-4 py-2 flex items-center justify-between gap-4">
              <p className="text-xs text-amber-300/80 flex-1 text-center">
                Demo Mode &mdash; changes are saved to your browser only.{" "}
                To access admin, tap the{" "}
                <span className="inline-flex items-center gap-0.5 text-gold font-semibold">
                  <Shield className="w-3 h-3 inline" /> shield icon
                </span>{" "}
                in the top-right (username: <span className="font-semibold text-gold">test</span>, password: <span className="font-semibold text-gold">test</span>).{" "}
                <Link to="/" className="text-gold font-semibold underline underline-offset-2 hover:text-gold/80 transition-colors">
                  Start Free Trial
                </Link>
              </p>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => { resetDemo(); toast.success("Demo reset to defaults!"); }}
                  className="flex items-center gap-1 text-xs text-amber-400/70 hover:text-amber-300 transition-colors"
                  title="Reset demo to defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <Link to="/" className="text-amber-400/70 hover:text-amber-300 transition-colors" title="Leave demo">
                  <X className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <AppNavbar showAdmin={showAdmin} onToggleAdmin={() => setShowAdmin((v) => !v)} />
            {showAdmin && <AdminPanel />}
            <HeroSection />
            <MenuGrid />
            <GallerySection />
            <CartFAB />
            <CartSidebar />
            <FloatingNavSelector />

            <footer className="border-t border-border py-8 text-center">
              <p className="text-muted-foreground text-xs">
                &copy; {new Date().getFullYear()} · Powered by love for great food
              </p>
            </footer>
          </div>
        </DemoAdminProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
}

export default function Demo() {
  return (
    <DemoProvider>
      <CartProvider>
        <DemoContent />
      </CartProvider>
    </DemoProvider>
  );
}
