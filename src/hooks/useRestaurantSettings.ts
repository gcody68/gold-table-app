import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ShiftConfig = {
  enabled: boolean;
  start: string;
  end: string;
};

export type ServiceHours = {
  breakfast: ShiftConfig;
  lunch: ShiftConfig;
  dinner: ShiftConfig;
};

export const DEFAULT_SERVICE_HOURS: ServiceHours = {
  breakfast: { enabled: true, start: "06:00", end: "11:00" },
  lunch: { enabled: true, start: "11:00", end: "16:00" },
  dinner: { enabled: true, start: "16:00", end: "23:00" },
};

export type RestaurantSettings = {
  id: string;
  owner_id: string | null;
  business_name: string;
  business_address: string | null;
  business_phone: string | null;
  header_image_url: string | null;
  logo_url: string | null;
  theme: string;
  bg_style: string | null;
  payment_enabled: boolean | null;
  stripe_public_key: string | null;
  stripe_secret_key: string | null;
  kitchen_view_enabled: boolean | null;
  show_gallery: boolean | null;
  service_hours: ServiceHours | null;
  unavailable_display: "hide" | "gray" | null;
  subdomain: string | null;
  custom_domain: string | null;
};

export function useRestaurantSettings() {
  return useQuery({
    queryKey: ["restaurant-settings"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let query = supabase.from("restaurant_settings").select("*");
      if (session?.user?.id) {
        query = query.eq("owner_id", session.user.id);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      return data as RestaurantSettings | null;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<RestaurantSettings> & { id: string }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase
        .from("restaurant_settings")
        .update(rest)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restaurant-settings"] }),
  });
}
