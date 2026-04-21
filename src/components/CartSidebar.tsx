import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { useDecrementStock } from "@/hooks/useMenuItems";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Minus, Plus, Trash2, ShoppingBag, Loader as Loader2, CircleCheck as CheckCircle2, CreditCard, Lock, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type Step = "cart" | "checkout" | "payment" | "confirmation";

export default function CartSidebar({ restaurantId }: { restaurantId?: string | null }) {
  const { items, updateQuantity, removeItem, clearCart, total, isOpen, setIsOpen, customerInfo, setCustomerInfo } = useCart();
  const { data: settings } = useRestaurantSettings(restaurantId);
  const [step, setStep] = useState<Step>("cart");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const demo = useDemoMode();
  const paymentEnabled = settings?.payment_enabled ?? false;
  const decrementStock = useDecrementStock();

  const validateCheckout = () => {
    let valid = true;
    if (!customerInfo.name.trim()) { setNameError("Name is required"); valid = false; }
    else setNameError("");
    if (!customerInfo.phone.trim()) { setPhoneError("Phone is required"); valid = false; }
    else setPhoneError("");
    return valid;
  };

  const handlePlaceOrder = async () => {
    if (!validateCheckout()) return;
    if (paymentEnabled) { setStep("payment"); return; }
    await submitOrder();
  };

  const handlePayAndOrder = async () => {
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      toast.error("Please fill in all card details");
      return;
    }
    await submitOrder();
  };

  const upsertCustomerLead = async () => {
    if (!customerInfo.phone.trim()) return;
    await supabase.rpc("upsert_customer_lead", {
      p_name: customerInfo.name.trim(),
      p_phone: customerInfo.phone.trim(),
      p_email: customerInfo.email.trim() || null,
    });
  };

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      if (demo) {
        demo.submitOrder({
          customerName: customerInfo.name.trim(),
          customerPhone: customerInfo.phone.trim(),
          items: items.map((i) => ({ name: i.menuItem.name, qty: i.quantity, price: Number(i.menuItem.price) })),
          total,
        });
        setStep("confirmation");
        clearCart();
        return;
      }

      const rid = settings?.id ?? null;
      toast.info(`Debug: restaurant_id=${rid}`);
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: customerInfo.name.trim(),
          customer_phone: customerInfo.phone.trim(),
          customer_email: customerInfo.email.trim() || null,
          total,
          status: "pending",
          restaurant_id: rid,
        })
        .select("id")
        .maybeSingle();
      if (orderErr) throw orderErr;
      if (!order) throw new Error("Order was not created");

      const orderItems = items.map((i) => ({
        order_id: order.id,
        menu_item_id: i.menuItem.id,
        menu_item_name: i.menuItem.name,
        price: Number(i.menuItem.price),
        quantity: i.quantity,
        special_instructions: i.specialInstructions || null,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      await upsertCustomerLead();

      const stockItems = items
        .filter((i) => i.menuItem.daily_stock != null)
        .map((i) => ({ id: i.menuItem.id, quantity: i.quantity }));
      if (stockItems.length > 0) {
        try { await decrementStock.mutateAsync(stockItems); } catch { /* non-critical */ }
      }

      setStep("confirmation");
      clearCart();
    } catch (err) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? String(err);
      console.error("Order submission error:", err);
      toast.error(`Order failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep("cart");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setNameError("");
      setPhoneError("");
    }, 300);
  };

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="bg-card border-border flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-gold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {step === "confirmation" ? "Order Confirmed" : step === "payment" ? "Secure Payment" : "Your Order"}
          </SheetTitle>
        </SheetHeader>

        {step === "confirmation" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.business_name || "Logo"}
                className="h-16 max-w-[200px] object-contain mb-2"
              />
            ) : (
              <span className="font-serif text-2xl font-semibold text-gold" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                {settings?.business_name || "Restaurant"}
              </span>
            )}
            <CheckCircle2 className="w-14 h-14 text-gold" />
            <h3 className="text-2xl font-serif font-bold text-foreground">Order Placed!</h3>
            <p className="text-muted-foreground leading-relaxed">
              {paymentEnabled
                ? "Payment processed. Your order is being prepared."
                : "Please pay when you arrive for pickup."}
            </p>
            <Button onClick={handleClose} className="mt-6 gradient-gold text-primary-foreground font-semibold">
              Done
            </Button>
          </div>

        ) : step === "payment" ? (
          <div className="flex-1 flex flex-col gap-6 pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
              <Lock className="w-3.5 h-3.5 text-gold" />
              Secure encrypted payment
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Card Number</Label>
                <div className="relative">
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className="bg-secondary border-border font-mono pr-10"
                    autoFocus
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Expiry</Label>
                  <Input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="bg-secondary border-border font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">CVC</Label>
                  <Input
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    className="bg-secondary border-border font-mono"
                    type="password"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-gold">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-auto space-y-3 pb-4">
              <Button
                onClick={handlePayAndOrder}
                disabled={submitting}
                className="w-full gradient-gold text-primary-foreground font-semibold h-12 text-base"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay $${total.toFixed(2)}`}
              </Button>
              <Button variant="ghost" onClick={() => setStep("checkout")} className="w-full text-muted-foreground">
                Back
              </Button>
            </div>
          </div>

        ) : step === "checkout" ? (
          <div className="flex-1 flex flex-col gap-6 pt-4 overflow-y-auto">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Details</p>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) => { setCustomerInfo({ ...customerInfo, name: e.target.value }); setNameError(""); }}
                  placeholder="Enter your name"
                  className={`bg-secondary border-border ${nameError ? "border-destructive" : ""}`}
                  autoFocus
                />
                {nameError && <p className="text-destructive text-xs">{nameError}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={customerInfo.phone}
                  onChange={(e) => { setCustomerInfo({ ...customerInfo, phone: e.target.value }); setPhoneError(""); }}
                  placeholder="(555) 123-4567"
                  className={`bg-secondary border-border ${phoneError ? "border-destructive" : ""}`}
                  type="tel"
                />
                {phoneError && <p className="text-destructive text-xs">{phoneError}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Email <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="you@example.com"
                  type="email"
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Summary</p>
              {items.map((ci) => (
                <div key={ci.menuItem.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">
                      <span className="text-gold font-semibold mr-1">{ci.quantity}×</span>
                      {ci.menuItem.name}
                    </span>
                    <span className="text-muted-foreground">${(Number(ci.menuItem.price) * ci.quantity).toFixed(2)}</span>
                  </div>
                  {ci.specialInstructions && (
                    <div className="flex items-start gap-1.5 ml-4">
                      <MessageSquare className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground italic">{ci.specialInstructions}</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-gold">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-auto space-y-3 pb-4">
              <Button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full gradient-gold text-primary-foreground font-semibold h-12 text-base"
              >
                {submitting
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : paymentEnabled
                    ? <><CreditCard className="w-4 h-4 mr-2" />Pay by Card</>
                    : "Place Order (Pay in Person)"
                }
              </Button>
              <Button variant="ghost" onClick={() => setStep("cart")} className="w-full text-muted-foreground">
                Back to Cart
              </Button>
            </div>
          </div>

        ) : (
          <div className="flex-1 flex flex-col">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                <ShoppingBag className="w-12 h-12 opacity-30" />
                <p className="text-sm">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {items.map((ci) => (
                    <div key={ci.menuItem.id} className="bg-secondary rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        {ci.menuItem.image_url && (
                          <img
                            src={ci.menuItem.image_url}
                            alt={ci.menuItem.name}
                            className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{ci.menuItem.name}</p>
                          <p className="text-gold text-sm">${Number(ci.menuItem.price).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(ci.menuItem.id, ci.quantity - 1)}
                            className="w-7 h-7 rounded-md bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-foreground">{ci.quantity}</span>
                          <button
                            onClick={() => updateQuantity(ci.menuItem.id, ci.quantity + 1)}
                            className="w-7 h-7 rounded-md bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItem(ci.menuItem.id)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {ci.specialInstructions && (
                        <div className="flex items-start gap-1.5 pl-1">
                          <MessageSquare className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground italic">{ci.specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-3 pb-4">
                  {customerInfo.name && (
                    <div className="text-xs text-muted-foreground bg-secondary/50 rounded-md px-3 py-2">
                      Ordering as <span className="font-semibold text-foreground">{customerInfo.name}</span>
                      {customerInfo.phone && <> &middot; {customerInfo.phone}</>}
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-gold">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={() => setStep("checkout")}
                    className="w-full gradient-gold text-primary-foreground font-semibold h-12 text-base"
                  >
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
