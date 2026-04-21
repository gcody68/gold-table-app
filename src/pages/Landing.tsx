import { useState, useEffect } from "react";
import heroPhoneImg from "@/assets/image.png";
import { Link, Navigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { Zap, Sparkles, Palette, Monitor, ChartBar as BarChart2, Smartphone, Search, Shield, Store, ShoppingBag, Truck, ArrowRight, ChevronDown, Menu, X, ExternalLink, Calendar, Send, UtensilsCrossed, Star, Check, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const GOLD = "#c9a84c";
const DARK_CARD = "#131e30";
const PAGE_BG = "#0d1010";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Demo", href: "#demo" },
  { label: "Contact", href: "#contact" },
];

const FEATURES = [
  { icon: Zap, title: "0% Commissions", desc: "Keep every dollar you earn. No hidden fees, no revenue sharing, no surprises. Your profits stay yours.", span: "md:col-span-2", iconColor: "#ef4444", iconBg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.15)" },
  { icon: Sparkles, title: "AI-Powered Discovery", desc: "Get found by hungry customers through smart recommendations and local search optimization.", span: "", iconColor: GOLD, iconBg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.1)" },
  { icon: Palette, title: "Custom Branding", desc: "Your restaurant, your brand. Fully customizable apps that match your identity perfectly.", span: "", iconColor: "#2dd4bf", iconBg: "rgba(45,212,191,0.12)", border: "rgba(45,212,191,0.1)" },
  { icon: Zap, title: "Instant Setup", desc: "Go live in minutes, not months. Import your menu, customize your app, and start taking orders today.", span: "", iconColor: "#f59e0b", iconBg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.1)" },
  { icon: Monitor, title: "Kitchen Display System", desc: "Real-time order management built for the pace of a kitchen. Bump, track, and complete orders without chaos.", span: "md:col-span-2", iconColor: "#fb923c", iconBg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.1)" },
  { icon: BarChart2, title: "Real-Time Analytics", desc: "Know your best sellers, peak hours, and top customers. Data that actually helps you make decisions.", span: "", iconColor: "#38bdf8", iconBg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.1)" },
  { icon: Smartphone, title: "Branded Mobile App", desc: "Your customers order directly from your branded app — no third-party marketplace cuts involved.", span: "", iconColor: GOLD, iconBg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.1)" },
  { icon: Search, title: "Local SEO Boost", desc: "Rank higher in local searches. Get discovered by nearby customers looking for exactly what you serve.", span: "", iconColor: "#34d399", iconBg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.1)" },
  { icon: Shield, title: "Secure Payments", desc: "PCI-compliant payment processing with Stripe integration. Every transaction is protected.", span: "", iconColor: "#94a3b8", iconBg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.1)" },
];

const PLANS = [
  {
    name: "Boutique",
    tagline: "Perfect for small restaurants getting started with online ordering.",
    price: 49,
    features: ["Commission-free ordering", "Real-time menu updates", "Basic analytics", "Standard support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    tagline: "For restaurants ready to scale with powerful integrations.",
    price: 99,
    features: ["Everything in Boutique", "Online Payment Integration (Stripe)", "Branded Mobile Experience", "Priority Support"],
    cta: "Get Started",
    highlighted: true,
    badge: "Most Popular",
  },
];

const COMPARISON = [
  { feature: "Setup Fee", bigGuys: "$199 – $499", uxxx: "$0", shield: "$0" },
  { feature: "Monthly Subscription", bigGuys: "$149 – $199+", uxxx: "$0 (They take %)", shield: "$49 – $79 Flat Fee · Cancel Anytime" },
  { feature: "Transaction Fee", bigGuys: "2.95% + $0.29", uxxx: "15% – 30% Commission", shield: "Standard Stripe Fees only" },
  { feature: "Data Ownership", bigGuys: "They own the Marketplace", uxxx: "They own the customer", shield: "YOU own the data" },
  { feature: "Required Hardware", bigGuys: "$250 – $420 Printer", uxxx: "Specific Tablet / Printer", shield: "No Printer Needed" },
  { feature: "App Store Fees", bigGuys: "$99/year (Apple Tax)", uxxx: "N/A", shield: "$0 (PWA Technology)" },
  { feature: "Menu Management", bigGuys: "Complex Multi-Channel", uxxx: "Locked in their App", shield: "Simple Excel / CSV or Single Entry" },
  { feature: "Service Periods", bigGuys: "Manual Overrides", uxxx: "Rigid Settings", shield: "Adaptive (Auto-shifts Breakfast / Lunch)" },
  { feature: "Sales Tracking", bigGuys: "Complex Back-end", uxxx: "Delayed Weekly Reports", shield: "Real-Time Kitchen Scoreboard" },
  { feature: "Daily Analytics", bigGuys: "Buried in Portals", uxxx: "Limited to App Orders", shield: "Live Totals + Top Sellers" },
  { feature: "Privacy Mode", bigGuys: "Not Available", uxxx: "Not Available", shield: "Eye Toggle (Hide Revenue from staff)" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = scrolled ? "#555" : "rgba(255,255,255,0.8)";
  const textHover = scrolled ? "#111" : "#fff";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={scrolled
        ? { background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }
        : { background: "transparent" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105" style={{ background: GOLD }}>
              <UtensilsCrossed className="w-4 h-4 text-neutral-900" />
            </div>
            <span className="font-bold text-xl tracking-tight transition-colors duration-300" style={{ color: scrolled ? "#111" : "#fff" }}>
              Gilded Table
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: textColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin ? (
              <Link
                to="/dashboard"
                className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
                style={{ color: textColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
                style={{ color: textColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
              >
                Log In
              </Link>
            )}
            <Link
              to="/login#signup"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: GOLD, color: "#111", boxShadow: "0 2px 8px rgba(201,168,76,0.3)" }}
              onClick={() => {
                // Signal to login page to open signup tab
                sessionStorage.setItem("loginMode", "signup");
              }}
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: scrolled ? "#111" : "#fff" }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden shadow-lg" style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t border-neutral-100 mt-2 flex flex-col gap-2">
              {isAdmin ? (
                <Link
                  to="/dashboard"
                  className="block text-center text-sm font-medium py-2.5 px-4 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="block text-center text-sm font-medium py-2.5 px-4 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Log In
                </Link>
              )}
              <Link
                to="/login"
                className="block text-center text-sm font-semibold px-5 py-3 rounded-xl"
                style={{ background: GOLD, color: "#111" }}
                onClick={() => { sessionStorage.setItem("loginMode", "signup"); setOpen(false); }}
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: PAGE_BG }}
    >
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1a1208, #0a0d10, #0d1010)" }} />
      <div
        className="absolute inset-0 opacity-50"
        style={{ backgroundImage: `radial-gradient(ellipse at 30% 0%, rgba(201,168,76,0.18) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(201,168,76,0.06) 0%, transparent 40%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)", backgroundSize: "72px 72px" }}
      />

      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 flex flex-col items-start text-left">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GOLD }} />
            <span className="text-sm font-medium" style={{ color: GOLD }}>Now serving restaurants everywhere</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Stop Paying{" "}
            <span className="line-through opacity-80" style={{ background: "linear-gradient(to right, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>30%</span>{" "}
            <span style={{ background: `linear-gradient(to right, ${GOLD}, #efb430)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Commissions.
            </span>
          </h1>

          <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl" style={{ color: "#9ca3af" }}>
            The all-in-one platform for local restaurants, boutiques, and food trucks to reclaim their profits. Custom apps, kitchen management, and real-time analytics — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
              style={{ background: GOLD, color: "#111", boxShadow: "0 0 0 0 rgba(201,168,76,0)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(201,168,76,0.25)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 rgba(201,168,76,0)")}
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(201,168,76,0.25)" }}
            >
              Explore Features
            </a>
          </div>

          <div className="flex flex-col items-start gap-4">
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.4)" }}>
              Trusted by restaurant owners who refuse to give away their profits
            </p>
            <div className="flex flex-wrap items-center gap-6">
              {[{ icon: Store, label: "Local Restaurants" }, { icon: ShoppingBag, label: "Boutique Shops" }, { icon: Truck, label: "Food Trucks" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2" style={{ color: "rgba(201,168,76,0.6)" }}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div className="flex-shrink-0 flex items-center justify-center lg:justify-end">
          <img
            src={heroPhoneImg}
            alt="Gilded Table Admin Dashboard"
            className="rounded-2xl shadow-2xl max-w-full"
            style={{ maxHeight: 580, boxShadow: "0 0 60px rgba(201,168,76,0.12), 0 40px 80px rgba(0,0,0,0.6)" }}
          />
        </div>
      </div>

      <a href="#demo" className="relative z-10 mb-10 flex flex-col items-center gap-2 transition-opacity hover:opacity-80" style={{ color: "rgba(201,168,76,0.4)" }}>
        <span className="text-xs font-medium">See the Platform</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </a>
    </section>
  );
}

function Features() {
  return (
    <section
      id="features"
      className="py-20 px-4 md:px-8 lg:px-16"
      style={{ background: "linear-gradient(180deg, #0d1010 0%, #0a0d10 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span className="text-sm font-medium" style={{ color: "#ef4444" }}>Everything You Need to Win</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Built by restaurant owners,<br />for restaurant owners.</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6b7280" }}>Every feature is designed to maximize your profits and minimize your headaches.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${f.span}`}
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${f.border}` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: f.iconBg }}>
                <f.icon className="w-5 h-5" style={{ color: f.iconColor }} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ADMIN_FEATURES = [
  { title: "Visual Style Themes", desc: "Choose from Midnight Gold, Ocean Breeze, Matcha Garden, and more. Your brand, your look." },
  { title: "Menu Manager", desc: "Add, edit, and organize menu items in seconds. Import demo data or build from scratch." },
  { title: "Background & Accent Control", desc: "Swap color palettes live. Customers see your changes the moment you save." },
  { title: "Instant Preview", desc: "See exactly how your storefront looks before going live — no guessing required." },
];

function AdminSuite() {
  return (
    <section
      className="py-20 px-4 md:px-8 lg:px-16"
      style={{ background: "linear-gradient(180deg, #0a0d10 0%, #0d1010 100%)" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <span className="text-sm font-medium" style={{ color: GOLD }}>Admin Suite</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Design & Manage in{" "}
            <span style={{ background: `linear-gradient(to right, ${GOLD}, #efb430)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Minutes
            </span>
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: "#6b7280" }}>
            Your business, your brand. Take full control of your digital presence with our intuitive admin suite. Update menus, change themes, and track orders without ever writing a line of code.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ADMIN_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(201,168,76,0.12)" }}>
                  <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{f.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: browser/dashboard mockup */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(201,168,76,0.2)" }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#0d1525" }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
              </div>
              <div className="flex-1 rounded-md px-3 py-1 text-xs text-center" style={{ background: "rgba(255,255,255,0.06)", color: "#6b7280" }}>
                Admin Dashboard
              </div>
              <div className="flex gap-2">
                {["Branding", "Payment"].map((t, i) => (
                  <div key={t} className="px-3 py-1 rounded-md text-xs font-medium" style={{ background: i === 0 ? `rgba(201,168,76,0.15)` : "rgba(255,255,255,0.05)", color: i === 0 ? GOLD : "#6b7280" }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard content */}
            <div className="grid grid-cols-5" style={{ background: "#0a1020", minHeight: 380 }}>
              {/* Left panel */}
              <div className="col-span-3 p-5 space-y-4 border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {[
                  { label: "Business Name", value: "The Golden Fork" },
                  { label: "Address", value: "123 Main St, Suite 4" },
                  { label: "Phone", value: "(808) 555-0123" },
                ].map((field) => (
                  <div key={field.label}>
                    <div className="text-xs mb-1.5" style={{ color: "#6b7280" }}>{field.label}</div>
                    <div className="px-3 py-2 rounded-lg text-sm text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}>
                      {field.value}
                    </div>
                  </div>
                ))}
                {/* Theme swatches */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "#6b7280" }}>Visual Style</div>
                  <div className="flex gap-2 flex-wrap">
                    {[GOLD, "#3b82f6", "#22c55e", "#f97316", "#ec4899", "#8b5cf6"].map((c, i) => (
                      <div key={c} className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110" style={{ background: c, boxShadow: i === 0 ? `0 0 0 2px #0a1020, 0 0 0 4px ${GOLD}` : "none" }} />
                    ))}
                  </div>
                </div>
                {/* Background swatches */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "#6b7280" }}>Background Style</div>
                  <div className="flex gap-2">
                    {["#000", "#1a1a2e", "#0d1b2a", "#1a1208", "#1a0a0a"].map((c, i) => (
                      <div key={c} className="w-8 h-6 rounded-md cursor-pointer" style={{ background: c, boxShadow: i === 0 ? `0 0 0 2px #0a1020, 0 0 0 3px ${GOLD}` : "1px solid rgba(255,255,255,0.08)" }} />
                    ))}
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors" style={{ border: `1px solid rgba(201,168,76,0.4)`, color: GOLD, background: "transparent" }}>Import Menu</button>
                  <button className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: GOLD, color: "#111" }}>Load Demo Items</button>
                </div>
              </div>

              {/* Right panel: menu categories */}
              <div className="col-span-2 p-4 space-y-2">
                {[
                  { cat: "Drinks", admin: false },
                  { cat: "Specials", admin: true },
                  { cat: "Desserts", admin: true },
                ].map(({ cat, admin }) => (
                  <div key={cat} className="rounded-xl p-3" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-xs font-semibold">{cat}</span>
                      {admin && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>Admin only</span>
                      )}
                    </div>
                    <button className="w-full py-3 rounded-lg flex items-center justify-center gap-2 text-xs" style={{ border: "1px dashed rgba(255,255,255,0.1)", color: "#6b7280" }}>
                      <span className="text-base leading-none">+</span> Add {cat} Item
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex" style={{ background: "#0d1525", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {["Mains", "Sides", "Drinks", "Specials", "Desserts"].map((t, i) => (
                <div
                  key={t}
                  className="flex-1 py-3 text-center text-xs font-medium"
                  style={{ color: i === 0 ? GOLD : "#4b5563", borderBottom: i === 0 ? `2px solid ${GOLD}` : "2px solid transparent" }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="py-20 px-4 md:px-8 lg:px-16" style={{ background: "linear-gradient(160deg, #1a1208 0%, #0a0d10 45%, #0d1010 100%)" }}>
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
          <span className="text-sm font-medium" style={{ color: GOLD }}>See the Platform in Action</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">One platform. Three powerful views.</h2>
        <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: "#6b7280" }}>
          Your customer app, admin dashboard, and kitchen display all work together in perfect sync.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Customer Menu", desc: "Beautiful, branded menu your guests browse and order from directly.", icon: Smartphone, color: GOLD },
            { title: "Admin Dashboard", desc: "Manage items, themes, hours, and branding from one clean interface.", icon: Monitor, color: "#38bdf8" },
            { title: "Kitchen Display", desc: "Live order board — bump orders, track tickets, zero paper waste.", icon: Zap, color: "#fb923c" },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl p-8 text-left" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${v.color}18` }}>
                <v.icon className="w-6 h-6" style={{ color: v.color }} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#6b7280" }}>{v.desc}</p>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: v.color }}
              >
                Try it live <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <Link
          to="/demo"
          className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: GOLD, color: "#111" }}
        >
          Open Demo Mode <ExternalLink className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 md:px-8 lg:px-16" style={{ background: PAGE_BG }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
            <span className="text-sm font-medium" style={{ color: GOLD }}>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">No hidden fees. No commissions.</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#6b7280" }}>Just tools that pay for themselves — from the very first week.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-8 flex flex-col"
              style={plan.highlighted
                ? { background: DARK_CARD, border: `1px solid rgba(201,168,76,0.3)`, boxShadow: "0 0 40px rgba(201,168,76,0.08)" }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {plan.badge && (
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-4 self-start" style={{ background: "rgba(201,168,76,0.15)", color: GOLD, border: `1px solid rgba(201,168,76,0.3)` }}>
                  <Star className="w-3 h-3" fill="currentColor" />
                  {plan.badge}
                </div>
              )}
              <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
              <p className="text-sm mb-6" style={{ color: "#6b7280" }}>{plan.tagline}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-sm mb-1.5" style={{ color: "#6b7280" }}>/mo</span>
              </div>
              <a
                href="#contact"
                className="block text-center font-semibold py-3 rounded-xl mb-6 transition-all duration-200 hover:-translate-y-0.5"
                style={plan.highlighted
                  ? { background: GOLD, color: "#111" }
                  : { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {plan.cta}
              </a>
              <div className="border-t mb-6" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "#d1d5db" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(201,168,76,0.15)" }}>
                      <Check className="w-3 h-3" style={{ color: GOLD }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-4 gap-0">
            {["Feature / Cost", "Big POS Platforms", "Third-Party Delivery", "Gilded Table"].map((h, i) => (
              <div
                key={h}
                className="px-4 py-3 text-xs font-semibold"
                style={{
                  background: i === 3 ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.04)",
                  color: i === 3 ? GOLD : "#9ca3af",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {h}
              </div>
            ))}
          </div>
          {COMPARISON.map((row, ri) => (
            <div key={row.feature} className="grid grid-cols-4 gap-0" style={{ background: ri % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}>
              <div className="px-4 py-3 text-xs font-medium text-white border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>{row.feature}</div>
              <div className="px-4 py-3 text-xs border-b" style={{ color: "#6b7280", borderColor: "rgba(255,255,255,0.04)" }}>{row.bigGuys}</div>
              <div className="px-4 py-3 text-xs border-b" style={{ color: "#6b7280", borderColor: "rgba(255,255,255,0.04)" }}>{row.uxxx}</div>
              <div className="px-4 py-3 text-xs font-medium border-b" style={{ color: "#d1d5db", background: "rgba(201,168,76,0.04)", borderColor: "rgba(255,255,255,0.04)" }}>{row.shield}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-6" style={{ color: "rgba(201,168,76,0.5)" }}>14-day free trial on all plans.</p>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="py-20 px-4 md:px-8 lg:px-16" style={{ background: "#fff" }}>
      <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden p-12 md:p-16 text-center relative" style={{ background: "linear-gradient(160deg, #1a1208 0%, #0d1010 60%, #1a1208 100%)" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)", backgroundSize: "52px 52px", pointerEvents: "none" }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GOLD }} />
            <span className="text-sm font-medium" style={{ color: GOLD }}>14-day free trial</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Your restaurant. Your profits.<br />Your rules.
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "#6b7280" }}>
            Join restaurants who stopped paying commissions and started keeping what they earn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: GOLD, color: "#111" }}
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(201,168,76,0.3)" }}
            >
              Demo the Dashboard <ExternalLink className="w-5 h-5" style={{ color: GOLD }} />
            </Link>
            <a
              href="mailto:hello@gildedtable.com"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Book a Demo <Calendar className="w-5 h-5" />
            </a>
          </div>

          <p className="mt-8 text-xs font-medium" style={{ color: "rgba(201,168,76,0.4)" }}>
            For restaurants, food trucks, and boutiques of all sizes.
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactFooter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <footer style={{ background: "#030303", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GOLD }}>
                <UtensilsCrossed className="w-4 h-4 text-neutral-900" />
              </div>
              <span className="font-bold text-xl text-white">Gilded Table</span>
            </div>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "#4b5563" }}>
              Helping restaurants, boutiques, and food trucks keep 100% of their profits.
            </p>

            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.15)" }}>
              <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
              {sent ? (
                <div className="rounded-xl p-4 text-sm font-medium" style={{ background: "rgba(201,168,76,0.1)", color: GOLD, border: "1px solid rgba(201,168,76,0.25)" }}>
                  Message sent! We'll be in touch soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-neutral-600 outline-none transition-colors" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-neutral-600 outline-none transition-colors" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-neutral-600 outline-none transition-colors" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
                  <button type="submit" className="w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg text-sm transition-all hover:-translate-y-0.5" style={{ background: GOLD, color: "#111" }}>
                    Contact Us <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-3 gap-8">
            {[
              { heading: "Product", links: ["Features", "Pricing", "Demo", "Changelog"] },
              { heading: "Solutions", links: ["Restaurants", "Food Trucks", "Boutiques", "Cafes"] },
              { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
            ].map((col) => (
              <div key={col.heading}>
                <h5 className="text-white font-semibold text-sm mb-4">{col.heading}</h5>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm transition-colors" style={{ color: "#4b5563" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#9ca3af")} onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs" style={{ color: "#374151" }}>&copy; {new Date().getFullYear()} Gilded Table. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399" }} />
              <span className="text-xs font-medium" style={{ color: "#34d399" }}>All systems operational</span>
            </div>
            <span className="text-xs" style={{ color: "#1f2937" }}>PCI Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LandingInner() {
  const { isAdmin, session } = useAdmin();

  // Logged-in users should go straight to the dashboard
  if (isAdmin && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen" style={{ background: PAGE_BG }}>
      <Navbar />
      <Hero />
      <Features />
      <AdminSuite />
      <DemoSection />
      <Pricing />
      <CTASection />
      <ContactFooter />
    </div>
  );
}

export default function Landing() {
  return (
    <AdminProvider>
      <LandingInner />
    </AdminProvider>
  );
}
