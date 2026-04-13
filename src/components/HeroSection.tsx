import heroDefault from "@/assets/hero-restaurant.jpg";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { MapPin, Phone } from "lucide-react";

export default function HeroSection() {
  const { data: settings } = useRestaurantSettings();
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
      </div>
    </section>
  );
}
