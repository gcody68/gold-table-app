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
import DemoOrderCustomizationModal from "@/components/demo/DemoOrderCustomizationModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Smartphone, UtensilsCrossed, Users, Wifi, ShoppingBag, Clock, CircleCheck as CheckCircle2, Settings, Minus, Plus, Trash2, MessageSquare } from "lucide-react";
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

type PhoneView = "admin" | "customer" | "cart" | "kitchen";

function KitchenView() {
  const { demoOrders, updateDemoOrderStatus } = useDemo();

  const activeOrders = demoOrders.filter((o) => o.status !== "completed");

  const statusConfig = {
    "new": { label: "New", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    "in-progress": { label: "In Progress", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    "ready": { label: "Ready", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    "completed": { label: "Complete", bg: "bg-secondary", text: "text-muted-foreground", border: "border-border" },
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-serif font-bold text-gold">Kitchen Queue</h2>
        <span className="text-xs text-muted-foreground">{activeOrders.length} active</span>
      </div>

      {activeOrders.length === 0 && (
        <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center space-y-1">
          <UtensilsCrossed className="w-6 h-6 text-muted-foreground/40 mx-auto" />
          <p className="text-xs text-muted-foreground">No orders yet.</p>
          <p className="text-xs text-muted-foreground/70">Switch to Customer view and place an order to see it here.</p>
        </div>
      )}

      {activeOrders.map((order) => {
        const cfg = statusConfig[order.status];
        return (
          <div key={order.id} className={`rounded-lg border ${cfg.border} bg-card p-3 space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-semibold text-foreground">{order.customerName}</span>
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
              <div className="flex items-center gap-1">
                {order.status === "new" && (
                  <button
                    onClick={() => updateDemoOrderStatus(order.id, "in-progress")}
                    className="text-xs px-2 py-0.5 rounded font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                  >
                    Start
                  </button>
                )}
                {order.status === "in-progress" && (
                  <button
                    onClick={() => updateDemoOrderStatus(order.id, "ready")}
                    className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === "ready" && (
                  <button
                    onClick={() => updateDemoOrderStatus(order.id, "completed")}
                    className="text-xs px-2 py-0.5 rounded font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Complete
                  </button>
                )}
              </div>
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

function InlineCartView({ onGoToCustomer, onGoToKitchen }: { onGoToCustomer: () => void; onGoToKitchen: () => void }) {
  const { items, updateQuantity, removeItem, clearCart, total, customerInfo, setCustomerInfo } = useCart();
  const { settings, addDemoOrder } = useDemo();
  const [step, setStep] = useState<"cart" | "checkout" | "confirmation">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [localName, setLocalName] = useState(customerInfo.name);
  const [localPhone, setLocalPhone] = useState(customerInfo.phone);
  const [localEmail, setLocalEmail] = useState(customerInfo.email);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = () => {
    const errs: { name?: string; phone?: string } = {};
    if (!localName.trim()) errs.name = "Name is required";
    if (!localPhone.trim()) errs.phone = "Phone number is required";
    return errs;
  };

  const handlePlaceOrder = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setCustomerInfo({ name: localName.trim(), phone: localPhone.trim(), email: localEmail.trim() });
    await new Promise((r) => setTimeout(r, 600));
    addDemoOrder({
      customerName: localName.trim(),
      customerPhone: localPhone.trim(),
      items: items.map((i) => ({ name: i.menuItem.name, qty: i.quantity, price: Number(i.menuItem.price) })),
      total,
    });
    clearCart();
    setStep("confirmation");
    setSubmitting(false);
  };

  if (step === "confirmation") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-6 py-8">
        {settings?.logo_url ? (
          <img src={settings.logo_url} alt={settings.business_name || "Logo"} className="h-12 max-w-[160px] object-contain" />
        ) : (
          <span className="font-serif text-xl font-semibold text-gold">{settings?.business_name || "Restaurant"}</span>
        )}
        <CheckCircle2 className="w-14 h-14 text-gold" />
        <h3 className="text-xl font-serif font-bold text-foreground">Order Placed!</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your demo order is now in the Kitchen queue. Switch to the Kitchen tab to see it!
        </p>
        <button
          onClick={onGoToKitchen}
          className="mt-2 text-xs px-4 py-2 rounded-full gradient-gold text-primary-foreground font-semibold"
        >
          View Kitchen Queue
        </button>
        <button
          onClick={() => { setStep("cart"); onGoToCustomer(); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-3 pt-3 pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Details</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Name <span className="text-destructive">*</span></label>
              <input
                value={localName}
                onChange={(e) => { setLocalName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Your full name"
                className={`w-full bg-secondary border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-gold/50 ${errors.name ? "border-destructive" : "border-border"}`}
                autoFocus
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Phone <span className="text-destructive">*</span></label>
              <input
                value={localPhone}
                onChange={(e) => { setLocalPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
                placeholder="(555) 123-4567"
                type="tel"
                className={`w-full bg-secondary border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-gold/50 ${errors.phone ? "border-destructive" : "border-border"}`}
              />
              {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Email <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-gold/50"
              />
            </div>
          </div>
        </div>

        <div className="px-3 pt-3 border-t border-border mt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</p>
          {items.map((ci) => (
            <div key={ci.menuItem.id} className="flex justify-between text-xs py-1">
              <span className="text-foreground"><span className="text-gold font-semibold">{ci.quantity}×</span> {ci.menuItem.name}</span>
              <span className="text-muted-foreground">${(Number(ci.menuItem.price) * ci.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold pt-2 mt-1 border-t border-border">
            <span className="text-foreground">Total</span>
            <span className="text-gold">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="px-3 pb-4 mt-4 space-y-2">
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="w-full gradient-gold text-primary-foreground font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60"
          >
            {submitting ? "Placing Order..." : "Place Order (Demo)"}
          </button>
          <button onClick={() => setStep("cart")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <p className="text-sm font-serif font-bold text-gold flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4" /> Your Order
        </p>
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground">{items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 px-4 text-center">
          <ShoppingBag className="w-10 h-10 opacity-25" />
          <p className="text-sm">Your cart is empty</p>
          <button onClick={onGoToCustomer} className="text-xs text-gold hover:text-gold/80 transition-colors underline underline-offset-2">
            Browse the menu
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-3 space-y-2 py-2">
            {items.map((ci) => (
              <div key={ci.menuItem.id} className="bg-secondary rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  {ci.menuItem.image_url && (
                    <img src={ci.menuItem.image_url} alt={ci.menuItem.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-xs truncate">{ci.menuItem.name}</p>
                    <p className="text-gold text-xs">${Number(ci.menuItem.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(ci.menuItem.id, ci.quantity - 1)} className="w-6 h-6 rounded bg-card flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-medium text-foreground">{ci.quantity}</span>
                    <button onClick={() => updateQuantity(ci.menuItem.id, ci.quantity + 1)} className="w-6 h-6 rounded bg-card flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeItem(ci.menuItem.id)} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive ml-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {ci.specialInstructions && (
                  <div className="flex items-start gap-1 pl-1">
                    <MessageSquare className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground italic">{ci.specialInstructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-3 pb-4 pt-3 border-t border-border space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-gold">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setStep("checkout")}
              className="w-full gradient-gold text-primary-foreground font-semibold py-2.5 rounded-lg text-sm"
            >
              Checkout
            </button>
            <button onClick={onGoToCustomer} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
              Continue Browsing
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MobileFrame() {
  const { menuItems, phoneHighlight, markStepComplete } = useDemo();
  const { cartTabRequested, setCartTabRequested } = useCart();
  const [phoneView, setPhoneView] = useState<PhoneView>("admin");

  useEffect(() => {
    if (cartTabRequested) {
      setPhoneView("cart");
      setCartTabRequested(false);
    }
  }, [cartTabRequested, setCartTabRequested]);

  const handleCustomerClick = () => {
    setPhoneView("customer");
    markStepComplete("ordering");
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-500 ${
      phoneHighlight ? "brightness-110" : ""
    }`}>
      <div className="flex items-center gap-0.5 px-2 py-2 border-b border-border bg-card/90 flex-shrink-0">
        <button
          onClick={() => setPhoneView("admin")}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all flex-1 justify-center ${
            phoneView === "admin"
              ? "bg-gold/20 text-gold border-gold/40 font-semibold"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          <Settings className="w-3 h-3" /> Admin
        </button>
        <button
          onClick={handleCustomerClick}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all flex-1 justify-center ${
            phoneView === "customer"
              ? "bg-gold/20 text-gold border-gold/40 font-semibold"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          <Users className="w-3 h-3" /> Customer
        </button>
        <button
          onClick={() => setPhoneView("cart")}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all flex-1 justify-center ${
            phoneView === "cart"
              ? "bg-gold/20 text-gold border-gold/40 font-semibold"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          <ShoppingBag className="w-3 h-3" /> Cart
        </button>
        <button
          onClick={() => setPhoneView("kitchen")}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all flex-1 justify-center ${
            phoneView === "kitchen"
              ? "bg-gold/20 text-gold border-gold/40 font-semibold"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          <UtensilsCrossed className="w-3 h-3" /> Kitchen
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        {phoneView === "admin" && (
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
        )}
        {phoneView === "customer" && (
          <>
            <DemoHeroSection />
            <div className="px-3">
              <DemoMenuGrid forceCustomer />
            </div>
            {menuItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground px-4">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No menu items yet.</p>
                <p className="text-xs mt-1">Use "Load Sample Menu" in the Menu tab.</p>
              </div>
            )}
          </>
        )}
        {phoneView === "cart" && <InlineCartView onGoToCustomer={() => setPhoneView("customer")} onGoToKitchen={() => setPhoneView("kitchen")} />}
        {phoneView === "kitchen" && <KitchenView />}
      </div>

      {phoneView === "customer" && <CartFAB />}
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

  useEffect(() => {
    applyBgStyle(getBgStyleById((settings.bg_style as any) ?? "forest-dark"));
    applyTheme(getThemeById((settings.theme as any) ?? "sunwashed-citrus"));
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

      <DemoOrderCustomizationModal />
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
