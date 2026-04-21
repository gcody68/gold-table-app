import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import AdminLoginModal from "@/components/AdminLoginModal";
import KitchenAnalyticsBar from "@/components/KitchenAnalyticsBar";
import { useRestaurantSettings, getBusinessDayWindow } from "@/hooks/useRestaurantSettings";
import { Check, Clock, Phone, User, ChefHat, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type OrderItem = {
  id: string;
  menu_item_name: string;
  quantity: number;
  price: number;
  special_instructions?: string | null;
};

type OrderWithItems = {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

const DEMO_ORDERS_KEY = "gilded_demo_orders";

const SEED_ORDERS: DemoOrder[] = [
  {
    id: "SEED-042",
    customerName: "James Holloway",
    customerPhone: "(808) 555-0142",
    items: [
      { name: "Wagyu Burger", qty: 1, price: 28 },
      { name: "Garlic Fries", qty: 1, price: 9 },
      { name: "Iced Latte", qty: 2, price: 6 },
    ],
    total: 49,
    status: "new",
    time: "2 min ago",
    createdAt: Date.now() - 2 * 60 * 1000,
  },
  {
    id: "SEED-041",
    customerName: "Sofia Reyes",
    customerPhone: "(808) 555-0198",
    items: [
      { name: "Grilled Salmon", qty: 1, price: 34 },
      { name: "Caesar Salad", qty: 1, price: 14 },
    ],
    total: 48,
    status: "in-progress",
    time: "7 min ago",
    createdAt: Date.now() - 7 * 60 * 1000,
  },
];

function readOrdersFromStorage(): DemoOrder[] {
  try {
    const raw = localStorage.getItem(DEMO_ORDERS_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as DemoOrder[];
      // Keep seed order status changes; prepend real orders placed this session
      const realOrders = stored.filter((o) => !o.id.startsWith("SEED-"));
      const seedStatuses = Object.fromEntries(stored.filter((o) => o.id.startsWith("SEED-")).map((o) => [o.id, o.status]));
      const seeds = SEED_ORDERS.map((s) => seedStatuses[s.id] ? { ...s, status: seedStatuses[s.id] as DemoOrder["status"] } : s);
      return [...realOrders, ...seeds];
    }
  } catch {}
  return [...SEED_ORDERS];
}

type DemoOrder = import("@/contexts/DemoContext").DemoOrder;

// ---------------------------------------------------------------------------
// Demo kitchen board — reads orders directly from localStorage, no auth required
// ---------------------------------------------------------------------------
function DemoKitchenBoard() {
  const [orders, setOrders] = useState<DemoOrder[]>(() => readOrdersFromStorage());

  // Poll localStorage every 3s and listen for cross-tab storage events
  useEffect(() => {
    const sync = () => setOrders(readOrdersFromStorage());
    const interval = setInterval(sync, 3000);
    window.addEventListener("storage", sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const markReady = (id: string) => {
    const updated = orders.map((o) => o.id === id ? { ...o, status: "completed" as const } : o);
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(updated));
    setOrders(updated);
    toast.success("Order marked as ready!");
  };

  const pending = orders.filter((o) => o.status === "new" || o.status === "in-progress");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg font-semibold text-gold">Kitchen Display</span>
            <span className="text-xs text-amber-300/80 bg-amber-950/60 border border-amber-700/40 px-2 py-0.5 rounded-full font-medium ml-1">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{pending.length} pending</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </header>

      <KitchenAnalyticsBar businessHours={null} demoOrders={orders} />
      <div className="bg-amber-950/30 border-b border-amber-800/20 px-4 py-1.5 text-center">
        <p className="text-xs text-amber-400/60">Demo — stats reflect sample orders only. Live sales analytics available after sign-up.</p>
      </div>

      <div className="container py-6">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <ChefHat className="w-16 h-16 opacity-20" />
            <p className="text-lg">All orders fulfilled</p>
            <p className="text-sm">New orders from the demo menu appear here in real time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pending.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
                <div className="bg-secondary px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <span className="text-gold font-bold text-sm">${Number(order.total).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="font-bold text-foreground text-base leading-tight">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="font-bold text-foreground text-base tracking-wide">{order.customerPhone}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <span className="text-foreground font-semibold text-sm">
                        <span className="text-gold font-bold text-base mr-1.5">{item.qty}×</span>
                        {item.name}
                      </span>
                      <span className="text-muted-foreground text-xs">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="px-4 pb-4 pt-1 border-t border-border">
                  <Button
                    onClick={() => markReady(order.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm h-10"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark as Ready
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Real kitchen board — requires Supabase auth
// ---------------------------------------------------------------------------
function KitchenBoard() {
  const { isAdmin, session } = useAdmin();
  const [loginOpen, setLoginOpen] = useState(!isAdmin);
  const qc = useQueryClient();

  // 1. URL-based restaurant: mirrors RestaurantContext resolution priority
  //    ?test_res_id > subdomain > VITE_RESTAURANT_ID env > (no fallback — let adminRestaurant win)
  const { data: urlRestaurant, isLoading: urlLoading } = useQuery({
    queryKey: ["kitchen-url-restaurant"],
    queryFn: async () => {
      // ?test_res_id takes highest priority (set by Admin "Open My Shop" button)
      const testParamId = new URLSearchParams(window.location.search).get("test_res_id");
      if (testParamId) {
        const { data } = await supabase
          .from("restaurant_settings")
          .select("id, business_name")
          .eq("id", testParamId)
          .maybeSingle();
        return data ?? null;
      }

      const hostname = window.location.hostname;
      const SUBDOMAIN_HOST = "gildedtable.com";
      let slug: string | null = null;
      if (hostname.endsWith(`.${SUBDOMAIN_HOST}`)) {
        slug = hostname.slice(0, -(SUBDOMAIN_HOST.length + 1));
      }

      if (slug) {
        const isLikelySubdomain = !slug.includes(".");
        const col = isLikelySubdomain ? "subdomain" : "custom_domain";
        const { data } = await supabase
          .from("restaurant_settings")
          .select("id, business_name")
          .eq(col, slug)
          .maybeSingle();
        return data ?? null;
      }

      const fallbackId = import.meta.env.VITE_RESTAURANT_ID;
      if (fallbackId) {
        const { data } = await supabase
          .from("restaurant_settings")
          .select("id, business_name")
          .eq("id", fallbackId)
          .maybeSingle();
        return data ?? null;
      }

      // No URL signal — return null so adminRestaurant is used exclusively
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Admin-owned restaurant: resolve from logged-in user's owner_id
  const { data: adminRestaurant, isLoading: adminLoading } = useQuery({
    queryKey: ["kitchen-admin-restaurant", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const isSuperAdmin = session.user.app_metadata?.super_admin === true;
      if (isSuperAdmin) return null; // super admin can see any restaurant
      const { data } = await supabase
        .from("restaurant_settings")
        .select("id, business_name, business_hours")
        .eq("owner_id", session.user.id)
        .maybeSingle();
      return data ?? null;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isSuperAdmin = session?.user?.app_metadata?.super_admin === true;

  // 3. Security check: URL restaurant must match admin's restaurant (unless super admin)
  const urlId = urlRestaurant?.id ?? null;
  const adminId = adminRestaurant?.id ?? null;
  const isLoading = urlLoading || adminLoading;

  // Verified ID: the one we'll actually query with
  const verifiedId = isSuperAdmin
    ? urlId  // super admin uses URL to choose which kitchen to view
    : (adminId && urlId && adminId === urlId) ? adminId
    : (adminId && !urlId) ? adminId  // no subdomain context — trust admin's own restaurant
    : null;

  const isAuthorized = isSuperAdmin || !adminId || !urlId || adminId === urlId;

  const businessHours = (adminRestaurant?.business_hours ?? null) as import("@/hooks/useRestaurantSettings").BusinessHours | null;
  const restaurantName = (isSuperAdmin ? urlRestaurant?.business_name : adminRestaurant?.business_name) ?? null;

  // 4. Orders fetch — uses verifiedId only
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["kitchen-orders", verifiedId, businessHours],
    queryFn: async () => {
      if (!verifiedId) return [];
      const { start } = getBusinessDayWindow(businessHours);
      console.log("[Kitchen] fetching orders for restaurant_id:", verifiedId, "since:", start.toISOString());
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", verifiedId)
        .eq("status", "pending")
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: true });
      if (error) {
        console.error("[Kitchen] orders fetch error:", error);
        throw error;
      }
      console.log("[Kitchen] fetched", data?.length ?? 0, "orders");
      return data as OrderWithItems[];
    },
    refetchInterval: 10000,
    enabled: isAdmin && !!verifiedId && isAuthorized,
  });

  // 5. Realtime subscription — filtered by verifiedId
  useEffect(() => {
    if (!verifiedId || !isAuthorized) return;

    const channel = supabase
      .channel(`kitchen-orders-${verifiedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${verifiedId}`,
        },
        (payload) => {
          console.log("[Kitchen] realtime new order:", payload.new);
          qc.invalidateQueries({ queryKey: ["kitchen-orders", verifiedId] });
          toast("New order received!", { description: `From ${(payload.new as { customer_name?: string }).customer_name ?? "customer"}` });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${verifiedId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["kitchen-orders", verifiedId] });
        }
      )
      .subscribe((status) => {
        console.log("[Kitchen] realtime channel status:", status);
      });

    return () => { supabase.removeChannel(channel); };
  }, [verifiedId, isAuthorized, qc]);

  const markReady = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-orders", verifiedId] });
      toast.success("Order marked as ready!");
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        <div className="text-center space-y-4">
          <ChefHat className="w-16 h-16 text-gold mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-foreground">Kitchen Display</h1>
          <p className="text-muted-foreground">Admin access required</p>
          <Button onClick={() => setLoginOpen(true)} className="gradient-gold text-primary-foreground font-semibold">
            Login
          </Button>
        </div>
      </div>
    );
  }

  // Unauthorized: URL restaurant exists but doesn't match the logged-in admin
  if (!isLoading && !isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
        <ChefHat className="w-14 h-14 text-destructive mx-auto" />
        <h1 className="text-2xl font-serif font-bold text-foreground">Unauthorized Access</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          You are logged in as the admin of <span className="text-foreground font-semibold">{adminRestaurant?.business_name}</span>, but this URL belongs to a different restaurant.
        </p>
        <div className="text-xs text-muted-foreground bg-secondary rounded-lg px-4 py-3 font-mono space-y-1 text-left">
          <div>URL Restaurant: <span className="text-destructive">{urlId ?? "none"}</span></div>
          <div>Your Restaurant: <span className="text-gold">{adminId ?? "none"}</span></div>
        </div>
      </div>
    );
  }

  const allLoading = isLoading || ordersLoading;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg font-semibold text-gold">Kitchen Display</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {orders?.length || 0} pending
            </span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Debug identity bar */}
      <div className="border-b border-border bg-secondary/60 px-4 py-2 font-mono text-xs">
        <div className="container flex flex-wrap gap-x-6 gap-y-1">
          <span className="text-muted-foreground">
            URL Restaurant: <span className={urlId ? "text-foreground" : "text-amber-400"}>{isLoading ? "…" : (urlId ?? "none")}</span>
          </span>
          <span className="text-muted-foreground">
            Logged-in Restaurant: <span className={adminId ? "text-foreground" : "text-amber-400"}>{isLoading ? "…" : (adminId ?? "none")}</span>
          </span>
          <span className="text-muted-foreground">
            Connection: {isLoading ? <span className="text-muted-foreground">…</span> : isAuthorized && verifiedId ? <span className="text-green-400 font-semibold">Connected — {restaurantName}</span> : <span className="text-red-400 font-semibold">Mismatched</span>}
          </span>
        </div>
      </div>

      <KitchenAnalyticsBar businessHours={businessHours} />

      <div className="container py-6">
        {allLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <ChefHat className="w-16 h-16 opacity-20" />
            <p className="text-lg">No pending orders</p>
            <p className="text-sm">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders?.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in"
              >
                <div className="bg-secondary px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <span className="text-gold font-bold text-sm">${Number(order.total).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="font-bold text-foreground text-base leading-tight">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="font-bold text-foreground text-base tracking-wide">{order.customer_phone}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.order_items.map((oi) => (
                    <div key={oi.id} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-foreground font-semibold text-sm">
                          <span className="text-gold font-bold text-base mr-1.5">{oi.quantity}×</span>
                          {oi.menu_item_name}
                        </span>
                        <span className="text-muted-foreground text-xs">${(oi.price * oi.quantity).toFixed(2)}</span>
                      </div>
                      {oi.special_instructions && (
                        <div className="flex items-start gap-1.5 ml-5 bg-gold/10 border border-gold/20 rounded-md px-2 py-1">
                          <MessageSquare className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-semibold text-foreground leading-relaxed">{oi.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="px-4 pb-4 pt-1 border-t border-border">
                  <Button
                    onClick={() => markReady.mutate(order.id)}
                    disabled={markReady.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm h-10"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark as Ready
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";

  if (isDemo) {
    return <DemoKitchenBoard />;
  }

  return (
    <AdminProvider>
      <KitchenBoard />
    </AdminProvider>
  );
}
