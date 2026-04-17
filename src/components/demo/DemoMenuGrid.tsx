import { useState, useMemo } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { useCart } from "@/contexts/CartContext";
import {
  CATEGORIES,
  ADMIN_ONLY_CATEGORIES,
  SERVICE_PERIOD_CATEGORIES,
  type MenuItem,
  type MealPeriod,
} from "@/hooks/useMenuItems";
import { useMealPeriodConfig } from "@/hooks/useMealPeriodConfig";
import { Plus, UtensilsCrossed, ShoppingBag, Clock, ToggleLeft, Zap } from "lucide-react";
import DemoMenuItemModal from "./DemoMenuItemModal";

const CATEGORY_TO_PERIOD: Record<string, MealPeriod> = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
};

const MEAL_PERIOD_LABELS: Record<MealPeriod, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  "all-day": "All Day",
};

function isSoldOut(item: MenuItem): boolean {
  return !item.is_available || (item.daily_stock != null && item.daily_stock <= 0);
}

function AddToOrderButton({
  item,
  periodLabel,
  periodActive,
  periodStartLabel,
  onAdd,
}: {
  item: MenuItem;
  periodLabel: string;
  periodActive: boolean;
  periodStartLabel: string;
  onAdd: (e: React.MouseEvent) => void;
}) {
  const soldOut = isSoldOut(item);

  if (soldOut) {
    return (
      <button disabled className="w-full bg-secondary text-muted-foreground font-semibold py-2.5 text-sm flex items-center justify-center gap-2 cursor-not-allowed rounded opacity-70">
        Sold Out
      </button>
    );
  }

  if (!periodActive) {
    return (
      <button disabled className="w-full bg-secondary text-muted-foreground font-medium py-2.5 text-xs flex items-center justify-center gap-2 cursor-not-allowed rounded opacity-70">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        Available during {periodLabel} from {periodStartLabel}
      </button>
    );
  }

  return (
    <button onClick={onAdd} className="w-full gradient-gold text-primary-foreground font-semibold py-2.5 text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity rounded">
      <ShoppingBag className="w-4 h-4" /> Add to Order
    </button>
  );
}

export default function DemoMenuGrid({ forceCustomer = false }: { forceCustomer?: boolean }) {
  const { menuItems, isAdmin: contextIsAdmin } = useDemo();
  const isAdmin = forceCustomer ? false : contextIsAdmin;
  const { setPendingItem } = useCart();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [creatingCategory, setCreatingCategory] = useState<string | null>(null);

  const { currentPeriod, unavailableDisplay, getPeriodStatus, isPeriodActive } = useMealPeriodConfig();

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    setPendingItem(item);
  };

  const grouped = useMemo(() => {
    const groups = CATEGORIES.map((cat) => {
      const allCatItems = menuItems.filter((i) => i.category === cat);
      const catPeriod: MealPeriod | null = CATEGORY_TO_PERIOD[cat] ?? null;

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

      const isCatActive = catPeriod ? isPeriodActive(catPeriod) : true;
      const periodStatus = catPeriod ? getPeriodStatus(catPeriod) : null;

      return {
        category: cat,
        items: displayItems,
        isAdminOnly: ADMIN_ONLY_CATEGORIES.includes(cat),
        isActive: isCatActive,
        categoryPeriod: catPeriod,
        startsAt: periodStatus?.startLabel ?? "",
      };
    }).filter(({ items: catItems, isAdminOnly }) => {
      if (catItems.length > 0) return true;
      if (isAdminOnly) return isAdmin;
      return false;
    });

    if (isAdmin) return groups;

    const servicePeriodOrder: MealPeriod[] = ["breakfast", "lunch", "dinner"];
    const currentIdx = servicePeriodOrder.indexOf(currentPeriod);
    const serviceGroups = groups.filter((g) => g.categoryPeriod !== null);
    const permanentGroups = groups.filter((g) => g.categoryPeriod === null);

    const activeService = serviceGroups.filter((g) => g.isActive);
    const upcomingService = serviceGroups
      .filter((g) => !g.isActive && servicePeriodOrder.indexOf(g.categoryPeriod!) > currentIdx)
      .sort((a, b) => servicePeriodOrder.indexOf(a.categoryPeriod!) - servicePeriodOrder.indexOf(b.categoryPeriod!));
    const pastService = serviceGroups
      .filter((g) => !g.isActive && servicePeriodOrder.indexOf(g.categoryPeriod!) < currentIdx)
      .sort((a, b) => servicePeriodOrder.indexOf(a.categoryPeriod!) - servicePeriodOrder.indexOf(b.categoryPeriod!));

    const sortedPermanent = permanentGroups.map((g) => ({
      ...g,
      isActive: g.items.some((i) => isPeriodActive(i.meal_period)),
    }));

    return [
      ...activeService,
      ...sortedPermanent.filter((g) => g.isActive),
      ...upcomingService,
      ...sortedPermanent.filter((g) => !g.isActive),
      ...pastService,
    ];
  }, [menuItems, isAdmin, unavailableDisplay, isPeriodActive, currentPeriod, getPeriodStatus]);

  const currentPeriodLabel = MEAL_PERIOD_LABELS[currentPeriod];
  const currentStatus = getPeriodStatus(currentPeriod);

  return (
    <section className="py-8 space-y-10">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-serif font-bold text-gold">Our Menu</h2>
        {!isAdmin && (
          <p className="text-xs text-muted-foreground">
            Now serving: <span className="text-gold font-medium">{currentPeriodLabel}</span>
            {currentStatus.enabled && (
              <span className="text-muted-foreground"> · until {currentStatus.endLabel}</span>
            )}
          </p>
        )}
      </div>

      {grouped.map(({ category, items: catItems, isAdminOnly, isActive, categoryPeriod, startsAt }) => {
        const sortedCatItems = isAdmin || !categoryPeriod
          ? catItems
          : [...catItems].sort((a, b) => {
              const aActive = isPeriodActive(a.meal_period) ? 0 : 1;
              const bActive = isPeriodActive(b.meal_period) ? 0 : 1;
              return aActive - bActive;
            });

        return (
          <div key={category} id={`demo-category-${category}`}>
            <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-border pb-2">
              <h3 className="text-xl font-serif font-semibold text-gold/80">{category}</h3>
              {!isAdmin && isActive && categoryPeriod && (
                <span className="inline-flex items-center gap-1 bg-gold/15 text-gold border border-gold/30 text-xs px-2 py-0.5 rounded-full font-semibold">
                  <Zap className="w-3 h-3" /> Serving Now
                </span>
              )}
              {!isAdmin && !isActive && categoryPeriod && startsAt && (
                <span className="inline-flex items-center gap-1 text-muted-foreground text-xs px-2 py-0.5 rounded-full border border-border">
                  <Clock className="w-3 h-3" /> Starts at {startsAt}
                </span>
              )}
              {isAdminOnly && catItems.length === 0 && (
                <span className="text-xs font-medium bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 rounded-full">
                  Admin only
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {sortedCatItems.map((item, i) => {
                const soldOut = isSoldOut(item);
                const periodStatus = getPeriodStatus(item.meal_period);
                const periodActive = isPeriodActive(item.meal_period);
                const unavailable = !isAdmin && (soldOut || !periodActive);
                const shouldDim = !isAdmin && unavailableDisplay === "gray" && unavailable;

                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-lg overflow-hidden bg-card border border-border hover:border-gold/30 transition-all duration-300 cursor-default ${shouldDim ? "opacity-50" : ""}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => isAdmin && setEditingItem(item)}
                  >
                    <div className="flex gap-3 p-3">
                      {item.image_url ? (
                        <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 rounded-md bg-secondary flex items-center justify-center">
                          <UtensilsCrossed className="w-7 h-7 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif font-semibold text-foreground text-sm leading-tight">{item.name}</h4>
                          <span className="text-gold font-semibold text-sm whitespace-nowrap">${Number(item.price).toFixed(2)}</span>
                        </div>
                        {item.description && (
                          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{item.description}</p>
                        )}
                        {isAdmin && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {!item.is_available && (
                              <span className="bg-destructive/90 text-destructive-foreground text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                <ToggleLeft className="w-3 h-3" /> Off
                              </span>
                            )}
                            {item.daily_stock != null && item.daily_stock <= 0 && (
                              <span className="bg-orange-600/90 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                Out of stock
                              </span>
                            )}
                            {item.meal_period !== "all-day" && !SERVICE_PERIOD_CATEGORIES.includes(item.category as typeof SERVICE_PERIOD_CATEGORIES[number]) && (
                              <span className="bg-card/90 text-muted-foreground text-xs px-1.5 py-0.5 rounded border border-border">
                                {MEAL_PERIOD_LABELS[item.meal_period as MealPeriod]}
                              </span>
                            )}
                          </div>
                        )}
                        {!isAdmin && (
                          <div className="pt-1">
                            <AddToOrderButton
                              item={item}
                              periodLabel={MEAL_PERIOD_LABELS[item.meal_period as MealPeriod]}
                              periodActive={periodActive}
                              periodStartLabel={periodStatus.startLabel}
                              onAdd={(e) => handleAddToCart(e, item)}
                            />
                          </div>
                        )}
                      </div>
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
                <button
                  onClick={() => setCreatingCategory(category)}
                  className="w-full rounded-lg border border-dashed border-border hover:border-gold/30 py-5 flex items-center justify-center gap-2 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">Add {category} Item</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {editingItem && (
        <DemoMenuItemModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
      {creatingCategory && (
        <DemoMenuItemModal category={creatingCategory} onClose={() => setCreatingCategory(null)} />
      )}
    </section>
  );
}
