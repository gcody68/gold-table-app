import { useMenuItems, CATEGORIES, ADMIN_ONLY_CATEGORIES } from "@/hooks/useMenuItems";
import { useCart } from "@/contexts/CartContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { useAdmin } from "@/contexts/AdminContext";
import { ShoppingBag, Images } from "lucide-react";

export default function FloatingNavSelector() {
  const { data: items } = useMenuItems();
  const { items: cartItems, setIsOpen } = useCart();
  const { data: settings } = useRestaurantSettings();
  const { isAdmin } = useAdmin();

  const categoriesWithItems = CATEGORIES.filter((cat) => {
    const hasItems = (items || []).some((i) => i.category === cat);
    if (ADMIN_ONLY_CATEGORIES.includes(cat)) return isAdmin;
    return hasItems;
  });

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (categoriesWithItems.length === 0 && !settings?.show_gallery) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-card/95 backdrop-blur-md border border-border rounded-full px-3 py-2 shadow-2xl">
      {categoriesWithItems.map((cat) => (
        <button
          key={cat}
          onClick={() => scrollTo(`category-${cat}`)}
          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-gold hover:bg-secondary rounded-full transition-all duration-200 whitespace-nowrap"
        >
          {cat}
        </button>
      ))}

      {settings?.show_gallery && (
        <button
          onClick={() => scrollTo("gallery-section")}
          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-gold hover:bg-secondary rounded-full transition-all duration-200 flex items-center gap-1"
        >
          <Images className="w-3 h-3" />
          Gallery
        </button>
      )}

      {cartCount > 0 && (
        <>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-foreground gradient-gold rounded-full transition-all duration-200"
          >
            <ShoppingBag className="w-3 h-3" />
            Cart · {cartCount}
          </button>
        </>
      )}
    </div>
  );
}
