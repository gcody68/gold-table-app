import { useMenuItems, type MenuItem } from "@/hooks/useMenuItems";
import { useAdmin } from "@/contexts/AdminContext";
import { Plus, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import MenuItemModal from "./MenuItemModal";

export default function MenuGrid() {
  const { data: items, isLoading } = useMenuItems();
  const { isAdmin } = useAdmin();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

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

  return (
    <section className="container py-12">
      <h2 className="text-3xl font-serif font-bold text-gold mb-8 text-center">
        Our Menu
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((item, i) => (
          <div
            key={item.id}
            className="group relative rounded-lg overflow-hidden bg-card border border-border hover:border-gold/30 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {item.is_placeholder ? (isAdmin ? (
              <button
                onClick={() => setEditingItem(item)}
                className="w-full h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-gold transition-colors"
              >
                <Plus className="w-10 h-10" />
                <span className="text-sm font-medium">Add Menu Item</span>
              </button>
            ) : item.is_placeholder ? null : (
              <div
                className="cursor-default"
                onClick={() => isAdmin && setEditingItem(item)}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-secondary flex items-center justify-center">
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
                </div>
                {isAdmin && (
                  <div className="absolute top-2 right-2 bg-gold/90 text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {editingItem && (
        <MenuItemModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </section>
  );
}
