import { useEffect } from "react";
import { Link } from "react-router-dom";
import { DemoProvider, useDemo } from "@/contexts/DemoContext";
import { CartProvider } from "@/contexts/CartContext";
import { applyTheme, getThemeById } from "@/lib/themes";
import { applyBgStyle, getBgStyleById } from "@/components/BackgroundStyleSelector";
import DemoAdminPanel from "@/components/demo/DemoAdminPanel";
import DemoMenuGrid from "@/components/demo/DemoMenuGrid";
import CartFAB from "@/components/CartFAB";
import CartSidebar from "@/components/CartSidebar";
import OrderCustomizationModal from "@/components/OrderCustomizationModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Smartphone, Eye, EyeOff } from "lucide-react";
import heroDefault from "@/assets/hero-restaurant.jpg";
import { MapPin, Phone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

function DemoHeroSection() {
  const { settings } = useDemo();
  const heroImage = settings.header_image_url || heroDefault;

  return (
    <section className="relative h-[200px] flex items-end overflow-hidden rounded-t-2xl">
      <img src={heroImage} alt="Restaurant hero" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
      <div className="relative z-10 px-4 pb-4 space-y-1">
        <h1 className="text-2xl font-serif font-bold text-gradient-gold leading-tight">
          {settings.business_name || "Your Restaurant"}
        </h1>
        {settings.business_address && (
          <p className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="w-3 h-3 text-gold" />
            {settings.business_address}
          </p>
        )}
        {settings.business_phone && (
          <p className="flex items-center gap-1 text-muted-foreground text-xs">
            <Phone className="w-3 h-3 text-gold" />
            {settings.business_phone}
          </p>
        )}
      </div>
    </section>
  );
}

function MobileFrame() {
  const { settings, isAdmin, setIsAdmin, menuItems } = useDemo();
  const { setPendingItem } = useCart();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/80 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-gold" />
          <span className="text-xs font-medium text-foreground">Customer Preview</span>
        </div>
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
            isAdmin
              ? "bg-gold/15 text-gold border-gold/30 hover:bg-gold/25"
              : "bg-secondary text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {isAdmin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {isAdmin ? "Admin View" : "Customer View"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <DemoHeroSection />
        <div className="px-3">
          <DemoMenuGrid />
        </div>
        {menuItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No menu items yet.</p>
            <p className="text-xs mt-1">Use the Admin panel to add items.</p>
          </div>
        )}
      </div>

      {!isAdmin && (
        <>
          <CartFAB />
          <CartSidebar />
        </>
      )}
    </div>
  );
}

function DemoContent() {
  const { settings, resetDemo } = useDemo();
  const { pendingItem } = useCart();

  useEffect(() => {
    applyBgStyle(getBgStyleById((settings.bg_style as any) ?? "deep-charcoal"));
    applyTheme(getThemeById((settings.theme as any) ?? "midnight-gold"));
  }, [settings.theme, settings.bg_style]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-50 bg-[#1a1200] border-b border-gold/30 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gold/80 hover:text-gold gap-1.5 text-xs h-8 px-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Leave Demo
              </Button>
            </Link>
            <div className="h-4 w-px bg-gold/20" />
            <p className="text-sm font-semibold text-gold tracking-wide hidden sm:block">
              Gilded Table Sandbox: Feel the ease of use.
            </p>
            <p className="text-xs font-semibold text-gold sm:hidden">Gilded Table Sandbox</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDemo}
              className="text-muted-foreground hover:text-foreground gap-1.5 text-xs h-8 px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
            <Link to="/">
              <Button
                size="sm"
                className="gradient-gold text-primary-foreground font-semibold text-xs h-8 px-3"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-amber-950/30 border-b border-amber-700/30 px-4 py-2 text-center">
        <p className="text-xs text-amber-300/80">
          You are in Demo Mode — all changes are saved to your browser only.{" "}
          <Link to="/" className="text-gold font-semibold underline underline-offset-2 hover:text-gold/80 transition-colors">
            Start Free Trial
          </Link>{" "}
          to go live.
        </p>
      </div>

      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6 h-full">
          <div className="hidden lg:block w-[380px] xl:w-[420px] flex-shrink-0">
            <div className="sticky top-[88px]">
              <DemoAdminPanel />
            </div>
          </div>

          <div className="flex-1 lg:hidden">
            <DemoAdminPanel />
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Menu Preview
              </p>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <MobileFrame />
              </div>
            </div>
          </div>

          <div className="flex-1 hidden lg:flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</span>
            </div>

            <div className="relative mx-auto w-full max-w-[390px]">
              <div className="absolute inset-0 bg-gradient-to-b from-card to-transparent pointer-events-none rounded-[2.5rem] border-[10px] border-card z-10 shadow-2xl" />
              <div className="border-[3px] border-border rounded-[2.5rem] overflow-hidden shadow-2xl bg-background" style={{ minHeight: "700px", maxHeight: "80vh" }}>
                <div className="h-6 bg-card flex items-center justify-center rounded-t-[2.2rem]">
                  <div className="w-16 h-1 bg-border rounded-full" />
                </div>
                <div className="overflow-hidden" style={{ height: "calc(80vh - 88px - 40px)" }}>
                  <MobileFrame />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pendingItem && <OrderCustomizationModal />}
    </div>
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
