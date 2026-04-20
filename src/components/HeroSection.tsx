import heroDefault from "@/assets/hero-restaurant.jpg";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { MapPin, Phone, CirclePlay as PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";

export default function HeroSection({ restaurantId }: { restaurantId?: string | null }) {
  const { data: settings } = useRestaurantSettings(restaurantId);
  const { isAdmin } = useAdmin();
  const heroImage = settings?.header_image_url || heroDefault;

  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
      <img
        src={heroImage}
        alt="Restaurant hero"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
      <div className="relative z-10 container pb-8 space-y-3">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gradient-gold leading-tight">
          {settings?.business_name || "Your Restaurant"}
        </h1>
        {settings?.business_address && (
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 text-gold" />
            {settings.business_address}
          </p>
        )}
        {settings?.business_phone && (
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <Phone className="w-4 h-4 text-gold" />
            {settings.business_phone}
          </p>
        )}
        {!isAdmin && (
          <div className="pt-2">
            <Link to="/demo">
              <button className="inline-flex items-center gap-2 bg-gold/15 hover:bg-gold/25 border border-gold/40 hover:border-gold/60 text-gold font-semibold text-sm px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm">
                <PlayCircle className="w-4 h-4" />
                Try Interactive Demo
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
