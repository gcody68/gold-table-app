import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SUBDOMAIN_HOST = "gildedtable.com";

export type RestaurantResolution =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "found"; restaurantId: string }
  | { status: "root" }; // bare domain with no subdomain — show landing

function resolveHostnameSlug(): string | null {
  const hostname = window.location.hostname;

  // subdomain.gildedtable.com → extract subdomain slug
  if (hostname.endsWith(`.${SUBDOMAIN_HOST}`)) {
    return hostname.slice(0, -(SUBDOMAIN_HOST.length + 1));
  }

  // Any other hostname (localhost, vercel.app, bolt previews, custom domains
  // not yet configured) → show root landing page.
  // Custom domains that ARE configured get looked up via the subdomain path above
  // once DNS is pointed to gildedtable.com, or can be added here explicitly.
  return null;
}

type RestaurantContextType = {
  resolution: RestaurantResolution;
  restaurantId: string | null;
};

const RestaurantContext = createContext<RestaurantContextType>({
  resolution: { status: "root" },
  restaurantId: null,
});

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const slug = resolveHostnameSlug();

  const { data: resolution, isLoading } = useQuery({
    queryKey: ["restaurant-resolution", slug],
    queryFn: async (): Promise<RestaurantResolution> => {
      if (slug === null) return { status: "root" };

      // Try subdomain first, then custom_domain fallback
      const isLikelySubdomain = !slug.includes(".");
      let query = supabase.from("restaurant_settings").select("id");

      if (isLikelySubdomain) {
        query = query.eq("subdomain", slug);
      } else {
        query = query.eq("custom_domain", slug);
      }

      const { data, error } = await query.maybeSingle();
      if (error || !data) return { status: "not-found" };
      return { status: "found", restaurantId: data.id };
    },
    staleTime: 5 * 60 * 1000,
  });

  const res: RestaurantResolution = isLoading
    ? { status: "loading" }
    : (resolution ?? { status: "root" });

  const restaurantId =
    res.status === "found" ? res.restaurantId : null;

  return (
    <RestaurantContext.Provider value={{ resolution: res, restaurantId }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  return useContext(RestaurantContext);
}