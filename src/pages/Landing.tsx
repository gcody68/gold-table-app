import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Globe, LayoutDashboard, Sparkles, ChefHat, ShoppingBag, Clock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminProvider } from "@/contexts/AdminContext";

const FEATURES = [
  { icon: LayoutDashboard, title: "Admin Dashboard", desc: "Manage your menu, branding, and hours from one place." },
  { icon: Globe, title: "Custom Domain", desc: "Serve your menu at island-cafe.gildedtable.com or your own domain." },
  { icon: ShoppingBag, title: "Online Ordering", desc: "Customers browse and order directly from your menu page." },
  { icon: Clock, title: "Service Hours", desc: "Auto-hide menu sections outside their service window." },
  { icon: ChefHat, title: "Kitchen Display", desc: "Live order board for kitchen staff — no app needed." },
  { icon: Sparkles, title: "Beautiful Themes", desc: "Choose from curated color themes and backgrounds." },
];

function LoginForm() {
  const { login, isAdmin, session } = useAdmin();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        const { error: err } = await login(email, password);
        if (err) setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin && session) {
    const subdomain = null; // will be set once they configure their site
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
          <UtensilsCrossed className="w-6 h-6 text-gold" />
        </div>
        <p className="text-foreground font-semibold">Welcome back, {session.user.email}</p>
        <p className="text-muted-foreground text-sm">
          Visit your restaurant's subdomain to access your admin panel, or go to the demo.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link to="/demo">
            <Button variant="outline" className="w-full border-border hover:border-gold/40">
              Open Demo Mode
            </Button>
          </Link>
        </div>
        <button
          onClick={() => { import("@/integrations/supabase/client").then(({ supabase }) => supabase.auth.signOut()); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => { setTab("login"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "login" ? "bg-gold text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setTab("signup"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "signup" ? "bg-gold text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
        >
          Create Account
        </button>
      </div>

      {tab === "signup" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Restaurant Name</Label>
          <Input
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="The Golden Fork"
            className="bg-secondary border-border"
            required
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@yourrestaurant.com"
          className="bg-secondary border-border"
          required
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-secondary border-border pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && <p className="text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full gradient-gold text-primary-foreground font-semibold h-10"
      >
        {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {tab === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(""); }}
          className="text-gold hover:text-gold/80 transition-colors font-medium"
        >
          {tab === "login" ? "Create one" : "Sign in"}
        </button>
      </p>
    </form>
  );
}

function LandingContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg font-semibold text-gold">Gilded Table</span>
          </div>
          <Link to="/demo">
            <Button variant="outline" size="sm" className="border-border hover:border-gold/40 text-muted-foreground hover:text-foreground text-xs">
              Try Demo
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Hero copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 text-gold text-xs font-medium px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Restaurant Menu Platform
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                Your menu.{" "}
                <span className="text-gradient-gold">Your domain.</span>{" "}
                Your customers.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Give your restaurant a beautiful online menu with ordering, kitchen display, and your own custom address — in minutes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <Link to="/demo">
              <Button size="lg" variant="outline" className="border-border hover:border-gold/40 gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                See a live demo first
              </Button>
            </Link>
          </div>

          {/* Right: Auth card */}
          <div className="lg:max-w-sm lg:ml-auto w-full">
            <div className="bg-card border border-border rounded-xl p-8 shadow-xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold text-foreground">Get started</h2>
                <p className="text-sm text-muted-foreground">Sign in to manage your restaurant, or create a new account.</p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} Gilded Table &middot; Powered by love for great food
        </p>
      </footer>
    </div>
  );
}

export default function Landing() {
  return (
    <AdminProvider>
      <LandingContent />
    </AdminProvider>
  );
}
