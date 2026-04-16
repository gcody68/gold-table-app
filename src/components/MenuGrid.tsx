import {
  useMenuItems,
  CATEGORIES,
  ADMIN_ONLY_CATEGORIES,
  type MenuItem,
  type MealPeriod,
} from "@/hooks/useMenuItems";
import { useMealPeriodConfig } from "@/hooks/useMealPeriodConfig";
import { useAdmin } from "@/contexts/AdminContext";
import { useCart } from "@/contexts/CartContext";
import { Plus, UtensilsCrossed, ShoppingBag, Clock, ToggleLeft } from "lucide-react";
import { useState, useMemo } from "react";
import MenuItemModal from "./MenuItemModal";
import OrderCustomizationModal from "./OrderCustomizationModal";

const MEAL_PERIOD_LABELS: Record<MealPeriod, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  "all-day": "All Day",
};

function isSoldOut(item: MenuItem): boolean {
  return !item.is_available || (item.daily_stock != null && item.daily_stock <= 0);
}

function CountdownBadge({ minutesLeft, periodLabel }: { minutesLeft: number; periodLabel: string }) {
  if (minutesLeft > 15) return null;
  const label =
    minutesLeft <= 1
      ? `${periodLabel} ends in less than a minute`
      : `${periodLabel} ends in ${minutesLeft} min`;
  return (
    <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
}

function AddToOrderButton({
  item,
  periodLabel,
  periodActive,
  periodStartLabel,
  minutesUntilEnd,
  onAdd,
}: {
  item: MenuItem;
  periodLabel: string;
  periodActive: boolean;
  periodStartLabel: string;
  minutesUntilEnd: number | null;
  onAdd: (e: React.MouseEvent) => void;
}) {
  const soldOut = isSoldOut(item);

  if (soldOut) {
    return (
      <button
        disabled
        className="w-full bg-secondary text-muted-foreground font-semibold py-2.5 text-sm flex items-center justify-center gap-2 cursor-not-allowed rounded opacity-70"
      >
        Sold Out
      </button>
    );
  }

  if (!periodActive) {
    return (
      <button
        disabled
        className="w-full bg-secondary text-muted-foreground font-medium py-2.5 text-xs flex items-center justify-center gap-2 cursor-not-allowed rounded opacity-70"
      >
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        Available during {periodLabel} from {periodStartLabel}
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      {minutesUntilEnd != null && minutesUntilEnd <= 15 && (
        <CountdownBadge minutesLeft={minutesUntilEnd} periodLabel={periodLabel} />
      )}
      <button
        onClick={onAdd}
        className="w-full gradient-gold text-primary-foreground font-semibold py-2.5 text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity rounded"
      >
        <ShoppingBag className="w-4 h-4" /> Add to Order
      </button>
    </div>
  );
}

export default function MenuGrid() {
  const { data: items, isLoading } = useMenuItems();
  const { isAdmin } = useAdmin();
  const { setPendingItem, pendingItem } = useCart();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [creatingCategory, setCreatingCategory] = useState<string | null>(null);

  const { currentPeriod, unavailableDisplay, getPeriodStatus, isPeriodActive } = useMealPeriodConfig();

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    setPendingItem(item);
  };

  const grouped = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const allCatItems = (items || []).filter((i) => i.category === cat);

      let displayItems: MenuItem[];
      if (isAdmin) {
        displayItems = allCatItems;
      } else if (unavailableDisplay === "hide") {
        displayItems = allCatItems.filter(
          (i) => !isSoldOut(i) && isPeriodActive(i.meal_period)
        );
      } else {
        displayItems = allCatItems;
      }

      return {
        category: cat,
        items: displayItems,
        isAdminOnly: ADMIN_ONLY_CATEGORIES.includes(cat),
      };
    }).filter(({ items: catItems, isAdminOnly }) => {
      if (catItems.length > 0) return true;
      if (isAdminOnly) return isAdmin;
      return false;
    });
  }, [items, isAdmin, unavailableDisplay, isPeriodActive]);

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

  const currentStatus = getPeriodStatus(currentPeriod);
  const currentPeriodLabel = MEAL_PERIOD_LABELS[currentPeriod];

  return (
    <section className="container py-12 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-gold">
          Our Menu
        </h2>
        {!isAdmin && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-muted-foreground">
              Now serving: <span className="text-gold font-medium">{currentPeriodLabel}</span>
              {currentStatus.enabled && (
                <span className="text-muted-foreground"> · until {currentStatus.endLabel}</span>
              )}
            </p>
            {currentStatus.minutesUntilEnd != null && currentStatus.minutesUntilEnd <= 15 && (
              <CountdownBadge
                minutesLeft={currentStatus.minutesUntilEnd}
                periodLabel={currentPeriodLabel}
              />
            )}
          </div>
        )}
      </div>

      {grouped.map(({ category, items: catItems, isAdminOnly }) => (
        <div key={category} id={`category-${category}`}>
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-2">
            <h3 className="text-2xl font-serif font-semibold text-gold/80">
              {category}
            </h3>
            {isAdminOnly && catItems.length === 0 && (
              <span className="text-xs font-medium bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 rounded-full">
                Admin only · not visible to customers
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catItems.map((item, i) => {
              const soldOut = isSoldOut(item);
              const periodStatus = getPeriodStatus(item.meal_period);
              const periodActive = isPeriodActive(item.meal_period);
              const unavailable = !isAdmin && (soldOut || !periodActive);
              const shouldDim = !isAdmin && unavailableDisplay === "gray" && unavailable;

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-lg overflow-hidden bg-card border border-border hover:border-gold/30 transition-all duration-300 animate-fade-in cursor-default ${shouldDim ? "opacity-50" : ""}`}
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

                  {isAdmin && (
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-3rem)]">
                      {!item.is_available && (
                        <span className="bg-destructive/90 text-destructive-foreground text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <ToggleLeft className="w-3 h-3" /> Off
                        </span>
                      )}
                      {item.daily_stock != null && item.daily_stock <= 0 && (
                        <span className="bg-orange-600/90 text-white text-xs px-2 py-0.5 rounded font-medium">
                          Out of stock
                        </span>
                      )}
                      {item.meal_period !== "all-day" && (
                        <span className="bg-card/90 text-muted-foreground text-xs px-2 py-0.5 rounded">
                          {MEAL_PERIOD_LABELS[item.meal_period as MealPeriod]}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <div className="flex flex-col items-end gap-0.5 ml-3">
                        <span className="text-gold font-semibold whitespace-nowrap">
                          ${Number(item.price).toFixed(2)}
                        </span>
                        {isAdmin && item.daily_stock != null && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {item.daily_stock} left
                          </span>
                        )}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {!isAdmin && (
                      <AddToOrderButton
                        item={item}
                        periodLabel={MEAL_PERIOD_LABELS[item.meal_period as MealPeriod]}
                        periodActive={periodActive}
                        periodStartLabel={periodStatus.startLabel}
                        minutesUntilEnd={periodStatus.minutesUntilEnd}
                        onAdd={(e) => handleAddToCart(e, item)}
                      />
                    )}
                  </div>

                  {isAdmin && (
                    <div className="absolute top-2 right-2 bg-gold/90 text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit
                    </div>
                  )}
                </div>
              );
            })}

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
      {pendingItem && (
        <OrderCustomizationModal item={pendingItem} onClose={() => setPendingItem(null)} />
      )}
    </section>
  );
}
