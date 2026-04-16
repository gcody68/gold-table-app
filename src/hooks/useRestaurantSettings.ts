import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RestaurantSettings = {
  id: string;
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
};

export function useRestaurantSettings() {
  return useQuery({
    queryKey: ["restaurant-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as RestaurantSettings;
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
