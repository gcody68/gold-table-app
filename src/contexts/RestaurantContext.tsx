import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SUBDOMAIN_HOST = "gildedtable.com";

export type RestaurantResolution =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "found"; restaurantId: string }
  | { status: "root" }; // bare domain with no subdomain — show landing

type HostResolution =
  | { type: "subdomain"; slug: string }
  | { type: "custom_domain"; hostname: string }
  | { type: "none" };

function resolveHost(): HostResolution {
  const hostname = window.location.hostname;

  // Our own subdomain: *.gildedtable.com
  if (hostname.endsWith(`.${SUBDOMAIN_HOST}`)) {
    const slug = hostname.slice(0, -(SUBDOMAIN_HOST.length + 1));
    return { type: "subdomain", slug };
  }

  // Root domain — show landing
  if (hostname === SUBDOMAIN_HOST) {
    return { type: "none" };
  }

  // Non-production hosts: localhost, *.vercel.app, *.bolt.new, *.lovable.app, etc.
  // These are dev/preview environments — don't attempt custom domain lookup.
  const devPatterns = ["localhost", "127.0.0.1", ".vercel.app", ".bolt.new", ".lovable.app", ".lovableproject.com"];
  const isDevHost = devPatterns.some((p) => hostname === p || hostname.endsWith(p));
  if (isDevHost) {
    return { type: "none" };
  }

  // Anything else is treated as a customer's custom domain (e.g. menu.joesdiner.com)
  return { type: "custom_domain", hostname };
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
  const hostResolution = resolveHost();
  const testParamId = resolveTestParamId();

  const queryKey =
    hostResolution.type === "subdomain"
      ? ["restaurant-resolution", "subdomain", hostResolution.slug]
      : hostResolution.type === "custom_domain"
        ? ["restaurant-resolution", "custom_domain", hostResolution.hostname]
        : ["restaurant-resolution", "none", testParamId ?? ""];

  const { data: resolution, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<RestaurantResolution> => {
      // 1. ?test_res_id param — highest priority
      if (testParamId) {
        return { status: "found", restaurantId: testParamId };
      }

      // 2a. Subdomain routing — *.gildedtable.com
      if (hostResolution.type === "subdomain") {
        const { data, error } = await supabase
          .from("restaurant_settings")
          .select("id")
          .eq("subdomain", hostResolution.slug)
          .maybeSingle();
        if (error || !data) return { status: "not-found" };
        return { status: "found", restaurantId: data.id };
      }

      // 2b. Custom domain routing — any other hostname
      if (hostResolution.type === "custom_domain") {
        const { data, error } = await supabase
          .from("restaurant_settings")
          .select("id")
          .eq("custom_domain", hostResolution.hostname)
          .maybeSingle();
        if (error || !data) return { status: "not-found" };
        return { status: "found", restaurantId: data.id };
      }

      // 3. Env var override (Vercel static preview with VITE_RESTAURANT_ID set)
      const fallbackId = import.meta.env.VITE_RESTAURANT_ID;
      if (fallbackId) return { status: "found", restaurantId: fallbackId };

      // 4. Session-first: logged-in owner's own restaurant
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
