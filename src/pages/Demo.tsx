import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DemoProvider, useDemo } from "@/contexts/DemoContext";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { applyTheme, getThemeById } from "@/lib/themes";
import { applyBgStyle, getBgStyleById } from "@/components/BackgroundStyleSelector";
import DemoAdminPanel from "@/components/demo/DemoAdminPanel";
import DemoMenuGrid from "@/components/demo/DemoMenuGrid";
import GuidePanel from "@/components/demo/GuidePanel";
import CartFAB from "@/components/CartFAB";
import CartSidebar from "@/components/CartSidebar";
import OrderCustomizationModal from "@/components/OrderCustomizationModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Smartphone, UtensilsCrossed, Users, Wifi, ShoppingBag, Clock, CircleCheck as CheckCircle2 } from "lucide-react";
import heroDefault from "@/assets/hero-restaurant.jpg";
import { MapPin, Phone } from "lucide-react";

function DemoHeroSection() {
  const { settings } = useDemo();
  const heroImage = settings.header_image_url || heroDefault;

  return (
    <section className="relative h-[160px] flex items-end overflow-hidden">
      <img src={heroImage} alt="Restaurant hero" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
      <div className="relative z-10 px-4 pb-3 space-y-0.5">
        <h1 className="text-xl font-serif font-bold text-gradient-gold leading-tight">
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

type PhoneView = "customer" | "kitchen";

function KitchenView() {
  const { cartItems } = useCart() as any;

  const mockOrders = [
    {
      id: "ORD-001",
      table: "Table 4",
      status: "in-progress" as const,
      time: "2 min ago",
      items: [{ name: "Eggs Benedict", qty: 1 }, { name: "Fresh-Press OJ", qty: 2 }],
    },
    {
      id: "ORD-002",
      table: "Table 7",
      status: "new" as const,
      time: "just now",
      items: [{ name: "Ribeye Steak", qty: 1 }, { name: "Garlic Fries", qty: 1 }],
    },
    {
      id: "ORD-003",
      table: "Table 2",
      status: "ready" as const,
      time: "8 min ago",
      items: [{ name: "Caesar Salad", qty: 2 }, { name: "Gold Margarita", qty: 2 }],
    },
  ];

  const statusConfig = {
    "new": { label: "New", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    "in-progress": { label: "In Progress", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    "ready": { label: "Ready", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-serif font-bold text-gold">Kitchen Queue</h2>
        <span className="text-xs text-muted-foreground">{mockOrders.length} active</span>
      </div>

      {mockOrders.map((order) => {
        const cfg = statusConfig[order.status];
        return (
          <div key={order.id} className={`rounded-lg border ${cfg.border} bg-card p-3 space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-semibold text-foreground">{order.table}</span>
                <span className="text-xs text-muted-foreground">{order.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{order.time}</span>
              </div>
            </div>

            <div className="space-y-0.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-gold font-semibold w-4 text-center">{item.qty}×</span>
                  <span className="text-foreground">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                {cfg.label}
              </span>
              {order.status !== "ready" && (
                <button className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                  order.status === "new"
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                }`}>
                  {order.status === "new" ? "Start" : "Mark Ready"}
                </button>
              )}
              {order.status === "ready" && (
                <button className="text-xs px-2 py-0.5 rounded font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Complete
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
        <p className="text-xs text-muted-foreground">
          In your live account, real customer orders appear here instantly.
        </p>
      </div>
    </div>
  );
}

function MobileFrame() {
  const { menuItems, phoneHighlight, markStepComplete } = useDemo();
  const [phoneView, setPhoneView] = useState<PhoneView>("customer");

  const handleCustomerClick = () => {
    setPhoneView("customer");
    markStepComplete("ordering");
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 ${
      phoneHighlight ? "brightness-110" : ""
    }`}>
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/90 flex-shrink-0">
        <button
          onClick={handleCustomerClick}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all flex-1 justify-center ${
            phoneView === "customer"
              ? "bg-gold/20 text-gold border-gold/40 font-semibold"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          <Users className="w-3 h-3" /> Customer
        </button>
        <button
          onClick={() => setPhoneView("kitchen")}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all flex-1 justify-center ${
            phoneView === "kitchen"
              ? "bg-gold/20 text-gold border-gold/40 font-semibold"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          <UtensilsCrossed className="w-3 h-3" /> Kitchen
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        {phoneView === "customer" ? (
          <>
            <DemoHeroSection />
            <div className="px-3">
              <DemoMenuGrid />
            </div>
            {menuItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground px-4">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No menu items yet.</p>
                <p className="text-xs mt-1">Use "Load Sample Menu" in the Menu tab.</p>
              </div>
            )}
          </>
        ) : (
          <KitchenView />
        )}
      </div>

      {phoneView === "customer" && (
        <>
          <CartFAB />
          <CartSidebar />
        </>
      )}
    </div>
  );
}

function SyncIndicator() {
  const { syncPulse } = useDemo();

  return (
    <div className="relative flex flex-col items-center justify-center gap-3 px-1 py-4 select-none">
      <div className="relative flex items-center justify-center">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          syncPulse
            ? "border-gold bg-gold/20 scale-110"
            : "border-border bg-secondary"
        }`}>
          <Wifi className={`w-3.5 h-3.5 transition-colors duration-300 ${syncPulse ? "text-gold" : "text-muted-foreground/40"}`} />
        </div>
        {syncPulse && (
          <div className="absolute w-10 h-10 rounded-full border border-gold/40 animate-ping" />
        )}
      </div>

      <div className="flex flex-col gap-1 items-center">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-0.5 rounded-full transition-all duration-200 ${
              syncPulse ? "bg-gold/50 h-2.5" : "bg-border h-1.5"
            }`}
            style={{ transitionDelay: syncPulse ? `${i * 60}ms` : "0ms" }}
          />
        ))}
      </div>
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
        <div className="max-w-screen-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gold/80 hover:text-gold gap-1.5 text-xs h-8 px-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Leave Demo
              </Button>
            </Link>
            <div className="h-4 w-px bg-gold/20" />
            <p className="text-sm font-semibold text-gold tracking-wide hidden sm:block">
              Gilded Table Sandbox — Feel the ease of use.
            </p>
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
              <Button size="sm" className="gradient-gold text-primary-foreground font-semibold text-xs h-8 px-3">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-amber-950/30 border-b border-amber-700/30 px-4 py-1.5 text-center">
        <p className="text-xs text-amber-300/70">
          You are in Demo Mode — all changes are saved to your browser only.{" "}
          <Link to="/" className="text-gold font-semibold underline underline-offset-2 hover:text-gold/80 transition-colors">
            Start Free Trial
          </Link>{" "}
          to go live.
        </p>
      </div>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-5">
        <div className="flex gap-4 h-full">
          <div className="hidden xl:block w-[195px] flex-shrink-0">
            <div className="sticky top-[84px]">
              <GuidePanel />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="sticky top-[84px]">
              <DemoAdminPanel />
            </div>
          </div>

          <div className="flex-shrink-0 flex items-start pt-2">
            <SyncIndicator />
          </div>

          <div className="hidden lg:flex w-[330px] xl:w-[355px] flex-shrink-0 flex-col gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</span>
            </div>

            <div className="border-[3px] border-border/80 rounded-[2.2rem] overflow-hidden shadow-2xl bg-background" style={{ height: "calc(100vh - 150px)" }}>
              <div className="h-5 bg-card/90 flex items-center justify-center">
                <div className="w-12 h-1 bg-border rounded-full" />
              </div>
              <div className="overflow-hidden" style={{ height: "calc(100% - 24px)" }}>
                <MobileFrame />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-6 border-t border-border pt-6 space-y-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Menu Preview
            </p>
            <div className="bg-card border border-border rounded-2xl overflow-hidden" style={{ maxHeight: "600px" }}>
              <MobileFrame />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <GuidePanel />
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
