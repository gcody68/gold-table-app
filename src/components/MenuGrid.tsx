import { useMenuItems, CATEGORIES, type MenuItem } from "@/hooks/useMenuItems";
import { useAdmin } from "@/contexts/AdminContext";
import { useCart } from "@/contexts/CartContext";
import { Plus, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { useState } from "react";
import MenuItemModal from "./MenuItemModal";
import { toast } from "sonner";

export default function MenuGrid() {
  const { data: items, isLoading } = useMenuItems();
  const { isAdmin } = useAdmin();
  const { addItem } = useCart();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [creatingCategory, setCreatingCategory] = useState<string | null>(null);

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    addItem(item);
    toast.success(`${item.name} added to order`);
  };

  if (isLoading) {
    return (
      <section className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: (items || []).filter((i) => i.category === cat),
  })).filter(({ items: catItems }) => isAdmin || catItems.length > 0);

  return (
    <section className="container py-12 space-y-12">
      <h2 className="text-3xl font-serif font-bold text-gold mb-8 text-center">
        Our Menu
      </h2>

      {grouped.map(({ category, items: catItems }) => (
        <div key={category} id={`category-${category}`}>
          <h3 className="text-2xl font-serif font-semibold text-gold/80 mb-6 border-b border-border pb-2">
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catItems.map((item, i) => (
              <div
                key={item.id}
                className="group relative rounded-lg overflow-hidden bg-card border border-border hover:border-gold/30 transition-all duration-300 animate-fade-in cursor-default"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => isAdmin && setEditingItem(item)}
              >
                {item.image_url ? (
                  <div className="w-full aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-secondary flex items-center justify-center">
                    <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {item.name}
                    </h3>
                    <span className="text-gold font-semibold whitespace-nowrap ml-3">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {!isAdmin && (
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      className="w-full gradient-gold text-primary-foreground font-semibold py-2.5 text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Order
                    </button>
                  )}
                </div>
                {isAdmin && (
                  <div className="absolute top-2 right-2 bg-gold/90 text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </div>
                )}
              </div>
            ))}

            {isAdmin && (
              <div className="rounded-lg overflow-hidden bg-card border border-dashed border-border hover:border-gold/30 transition-all duration-300">
                <button
                  onClick={() => setCreatingCategory(category)}
                  className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Plus className="w-10 h-10" />
                  <span className="text-sm font-medium">Add {category} Item</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {editingItem && (
        <MenuItemModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
      {creatingCategory && (
        <MenuItemModal
          category={creatingCategory}
          onClose={() => setCreatingCategory(null)}
        />
      )}
    </section>
  );
}
