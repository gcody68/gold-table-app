import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import AdminLoginModal from "@/components/AdminLoginModal";
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

function KitchenBoard() {
  const { isAdmin } = useAdmin();
  const [loginOpen, setLoginOpen] = useState(!isAdmin);
  const qc = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["kitchen-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as OrderWithItems[];
    },
    refetchInterval: 5000,
    enabled: isAdmin,
  });

  const markReady = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-orders"] });
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
  return (
    <AdminProvider>
      <KitchenBoard />
    </AdminProvider>
  );
}
