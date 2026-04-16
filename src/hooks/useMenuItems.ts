import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MealPeriod = "breakfast" | "lunch" | "dinner" | "all-day";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sort_order: number;
  is_placeholder: boolean;
  category: string;
  meal_period: MealPeriod;
  is_available: boolean;
  daily_stock: number | null;
};

export const SERVICE_PERIOD_CATEGORIES = ["Breakfast", "Lunch", "Dinner"] as const;
export const PERMANENT_CATEGORIES = ["Sides", "Drinks", "Specials", "Desserts"] as const;
export const CATEGORIES = [...SERVICE_PERIOD_CATEGORIES, ...PERMANENT_CATEGORIES] as const;

export const ADMIN_ONLY_CATEGORIES: string[] = ["Specials", "Desserts"];

export const MEAL_PERIODS: { value: MealPeriod; label: string; hours: string }[] = [
  { value: "breakfast", label: "Breakfast", hours: "6am – 11am" },
  { value: "lunch", label: "Lunch", hours: "11am – 4pm" },
  { value: "dinner", label: "Dinner", hours: "4pm – Close" },
  { value: "all-day", label: "All Day", hours: "Always available" },
];

export function getCurrentMealPeriod(): MealPeriod {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16) return "dinner";
  return "dinner";
}

export function isMealPeriodActive(period: MealPeriod): boolean {
  if (period === "all-day") return true;
  return period === getCurrentMealPeriod();
}

export function getMealPeriodStartTime(period: MealPeriod): string {
  switch (period) {
    case "breakfast": return "6:00 AM";
    case "lunch": return "11:00 AM";
    case "dinner": return "4:00 PM";
    default: return "";
  }
}

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as MenuItem[];
    },
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      name: string;
      description: string;
      price: number;
      image_url: string | null;
      category: string;
      meal_period?: MealPeriod;
      is_available?: boolean;
      daily_stock?: number | null;
    }) => {
      const { error } = await supabase.from("menu_items").insert({
        ...item,
        meal_period: item.meal_period ?? "all-day",
        is_available: item.is_available ?? true,
        daily_stock: item.daily_stock ?? null,
        is_placeholder: false,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useUpsertMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<MenuItem> & { id: string }) => {
      const { id, ...rest } = item;
      const { error } = await supabase
        .from("menu_items")
        .update({ ...rest, is_placeholder: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useDecrementStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; quantity: number }[]) => {
      for (const { id, quantity } of items) {
        const { data } = await supabase
          .from("menu_items")
          .select("daily_stock")
          .eq("id", id)
          .maybeSingle();
        if (data?.daily_stock != null) {
          const newStock = Math.max(0, data.daily_stock - quantity);
          await supabase
            .from("menu_items")
            .update({ daily_stock: newStock })
            .eq("id", id);
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}
