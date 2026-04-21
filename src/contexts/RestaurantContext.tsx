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
  if (hostname.endsWith(`.${SUBDOMAIN_HOST}`)) {
    return hostname.slice(0, -(SUBDOMAIN_HOST.length + 1));
  }
  return null;
}

// ?test_res_id=UUID — injected by the Admin "Open My Shop" button for test mode
function resolveTestParamId(): string | null {
  try {
    return new URLSearchParams(window.location.search).get("test_res_id");
  } catch {
    return null;
  }
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
  const testParamId = resolveTestParamId();

  const { data: resolution, isLoading } = useQuery({
    queryKey: ["restaurant-resolution", slug, testParamId],
    queryFn: async (): Promise<RestaurantResolution> => {
      // 1. ?test_res_id param — highest priority, set by Admin "Open My Shop" button
      if (testParamId) {
        return { status: "found", restaurantId: testParamId };
      }

      // 2. Subdomain routing (production)
      if (slug !== null) {
        const isLikelySubdomain = !slug.includes(".");
        const col = isLikelySubdomain ? "subdomain" : "custom_domain";
        const { data, error } = await supabase
          .from("restaurant_settings")
          .select("id")
          .eq(col, slug)
          .maybeSingle();
        if (error || !data) return { status: "not-found" };
        return { status: "found", restaurantId: data.id };
      }

      // 3. Env var override (Bolt/Vercel static previews with VITE_RESTAURANT_ID set)
      const fallbackId = import.meta.env.VITE_RESTAURANT_ID;
      if (fallbackId) return { status: "found", restaurantId: fallbackId };

      // 4. Session-first: resolve via the logged-in user's own restaurant so that
      //    testing on a bare domain (localhost, preview URL) always routes to the
      //    correct kitchen without needing a subdomain or env var.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const isSuperAdmin = session.user.app_metadata?.super_admin === true;
        if (!isSuperAdmin) {
          const { data } = await supabase
            .from("restaurant_settings")
            .select("id")
            .eq("owner_id", session.user.id)
            .maybeSingle();
          if (data?.id) return { status: "found", restaurantId: data.id };
        }
      }

      // 5. Last resort: first restaurant (unauthenticated local dev / single-tenant)
      const { data } = await supabase
        .from("restaurant_settings")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data?.id) return { status: "found", restaurantId: data.id };

      return { status: "root" };
    },
    staleTime: 5 * 60 * 1000,
  });

  const res: RestaurantResolution = isLoading
    ? { status: "loading" }
    : (resolution ?? { status: "root" });

  const restaurantId = res.status === "found" ? res.restaurantId : null;

  return (
    <RestaurantContext.Provider value={{ resolution: res, restaurantId }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  return useContext(RestaurantContext);
}
