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
  const { data: settings, isLoading: settingsLoading } = useRestaurantSettings();
  const businessHours = settings?.business_hours ?? null;
  const restaurantId = settings?.id ?? null;
  const restaurantName = settings?.business_name ?? null;

  // Debug: log the restaurant context so we can diagnose blank kitchen views
  useEffect(() => {
    console.log("[Kitchen] session uid:", session?.user?.id ?? "none");
    console.log("[Kitchen] restaurant_id:", restaurantId ?? "not resolved yet");
    console.log("[Kitchen] restaurant_name:", restaurantName ?? "not resolved yet");
  }, [session?.user?.id, restaurantId, restaurantName]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["kitchen-orders", restaurantId, businessHours],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { start } = getBusinessDayWindow(businessHours);
      console.log("[Kitchen] fetching orders for restaurant_id:", restaurantId, "since:", start.toISOString());
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", restaurantId)
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
    enabled: isAdmin && !!restaurantId,
  });

  // Realtime subscription — filtered by restaurant_id
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel(`kitchen-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log("[Kitchen] realtime new order:", payload.new);
          qc.invalidateQueries({ queryKey: ["kitchen-orders", restaurantId] });
          toast("New order received!", { description: `From ${(payload.new as { customer_name?: string }).customer_name ?? "customer"}` });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["kitchen-orders", restaurantId] });
        }
      )
      .subscribe((status) => {
        console.log("[Kitchen] realtime channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, qc]);

  const markReady = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-orders", restaurantId] });
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

  const isLoading = settingsLoading || ordersLoading;

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

      {/* Diagnostic identity bar */}
      <div className={`border-b px-4 py-2 text-center text-xs ${restaurantName ? "bg-green-950/40 border-green-800/30 text-green-400" : "bg-amber-950/40 border-amber-800/30 text-amber-400"}`}>
        {settingsLoading
          ? "Resolving restaurant identity…"
          : restaurantName
            ? <>Live orders for: <span className="font-semibold">{restaurantName}</span> <span className="opacity-50">(id: {restaurantId})</span></>
            : "Restaurant not identified — check that your account has a restaurant linked"
        }
      </div>

      <KitchenAnalyticsBar businessHours={businessHours} />

      <div className="container py-6">
        {isLoading ? (
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
