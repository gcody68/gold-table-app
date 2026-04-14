import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus, Trash2, ShoppingBag, Loader as Loader2, CircleCheck as CheckCircle2, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

type Step = "cart" | "checkout" | "payment" | "confirmation";

export default function CartSidebar() {
  const { items, updateQuantity, removeItem, clearCart, total, isOpen, setIsOpen } = useCart();
  const { data: settings } = useRestaurantSettings();
  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const paymentEnabled = settings?.payment_enabled ?? false;

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    if (paymentEnabled) {
      setStep("payment");
      return;
    }
    await submitOrder();
  };

  const handlePayAndOrder = async () => {
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      toast.error("Please fill in all card details");
      return;
    }
    await submitOrder();
  };

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({ customer_name: name.trim(), customer_phone: phone.trim(), total, status: "pending" })
        .select("id")
        .single();
      if (orderErr) throw orderErr;

      const orderItems = items.map((i) => ({
        order_id: order.id,
        menu_item_id: i.menuItem.id,
        menu_item_name: i.menuItem.name,
        price: Number(i.menuItem.price),
        quantity: i.quantity,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      setStep("confirmation");
      clearCart();
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep("cart");
      setName("");
      setPhone("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
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
            <CheckCircle2 className="w-16 h-16 text-gold" />
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
          <div className="flex-1 flex flex-col gap-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Your Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-secondary border-border"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Cell Phone Number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="bg-secondary border-border"
                  type="tel"
                />
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
                    <div key={ci.menuItem.id} className="flex items-center gap-3 bg-secondary rounded-lg p-3">
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
                  ))}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-3 pb-4">
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
