import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DemoProvider, useDemo } from "@/contexts/DemoContext";
import { CartProvider } from "@/contexts/CartContext";
import { applyTheme, getThemeById } from "@/lib/themes";
import { applyBgStyle, getBgStyleById } from "@/components/BackgroundStyleSelector";
import DemoAdminPanel from "@/components/demo/DemoAdminPanel";
import DemoMenuGrid from "@/components/demo/DemoMenuGrid";
import DemoCartSidebar from "@/components/demo/DemoCartSidebar";
import CartFAB from "@/components/CartFAB";
import DemoFloatingNavSelector from "@/components/demo/DemoFloatingNavSelector";
import { useLightMode } from "@/hooks/useLightMode";
import { Settings, Sun, Moon, RotateCcw, X } from "lucide-react";
import heroDefault from "@/assets/hero-restaurant.jpg";
import { MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

function DemoNavbar({ showAdmin, onToggleAdmin }: { showAdmin: boolean; onToggleAdmin: () => void }) {
  const { settings } = useDemo();
  const { isLight, toggle: toggleLight } = useLightMode();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-14">
        {settings?.logo_url ? (
          <img src={settings.logo_url} alt={settings.business_name || "Logo"} className="h-8 max-w-[160px] object-contain" />
        ) : (
          <span className="font-serif text-lg font-semibold text-gold truncate" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {settings?.business_name || "Restaurant"}
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLight}
            className="p-2 rounded-md text-muted-foreground hover:text-gold transition-colors"
            aria-label="Toggle light/dark mode"
          >
            {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={onToggleAdmin}
            className={`p-2 rounded-md transition-colors ${showAdmin ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-gold"}`}
            title="Toggle admin panel"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function DemoHeroSection() {
  const { settings } = useDemo();
  const heroImage = settings.header_image_url || heroDefault;

  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
      <img src={heroImage} alt="Restaurant hero" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
      <div className="relative z-10 container pb-8 space-y-3">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gradient-gold leading-tight">
          {settings?.business_name || "Your Restaurant"}
        </h1>
        {settings?.business_address && (
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 text-gold" />
            {settings.business_address}
          </p>
        )}
        {settings?.business_phone && (
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <Phone className="w-4 h-4 text-gold" />
            {settings.business_phone}
          </p>
        )}
      </div>
    </section>
  );
}

function DemoContent() {
  const { settings, resetDemo } = useDemo();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    applyBgStyle(getBgStyleById((settings.bg_style as any) ?? "forest-dark"));
    applyTheme(getThemeById((settings.theme as any) ?? "sunwashed-citrus"));
  }, [settings.theme, settings.bg_style]);

  return (
    <div className="min-h-screen bg-background">
      {/* Demo mode banner */}
      <div className="bg-amber-950/60 border-b border-amber-700/40 px-4 py-2 flex items-center justify-between gap-4">
        <p className="text-xs text-amber-300/80 flex-1 text-center">
          Demo Mode: Changes are saved locally to your browser and won't affect the live site.{" "}
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

      <DemoNavbar showAdmin={showAdmin} onToggleAdmin={() => setShowAdmin(!showAdmin)} />

      {showAdmin && <DemoAdminPanel />}

      <DemoHeroSection />
      <DemoMenuGrid />

      <CartFAB />
      <DemoCartSidebar />
      <DemoFloatingNavSelector />

      <footer className="border-t border-border py-8 text-center">
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} · Powered by love for great food
        </p>
      </footer>
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
