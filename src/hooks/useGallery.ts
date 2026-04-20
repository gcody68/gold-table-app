import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GalleryItem = {
  id: string;
  restaurant_id: string | null;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export function useGalleryItems(restaurantId?: string | null) {
  return useQuery({
    queryKey: ["gallery-items", restaurantId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("gallery_items").select("*").order("sort_order");
      if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as GalleryItem[];
    },
  });
}

export function useAddGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { image_url: string; caption?: string; restaurant_id?: string | null }) => {
      let restaurant_id = item.restaurant_id ?? null;
      if (!restaurant_id) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: rs } = await supabase
            .from("restaurant_settings")
            .select("id")
            .eq("owner_id", session.user.id)
            .limit(1)
            .maybeSingle();
          restaurant_id = rs?.id ?? null;
        }
      }
      const { error } = await supabase.from("gallery_items").insert({ ...item, restaurant_id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery-items"] }),
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery-items"] }),
  });
}
