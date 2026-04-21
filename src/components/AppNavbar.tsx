import { useAdmin } from "@/contexts/AdminContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { useLightMode } from "@/hooks/useLightMode";
import { Settings, Shield, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLoginModal from "./AdminLoginModal";

type Props = { showAdmin?: boolean; onToggleAdmin?: () => void; restaurantId?: string | null };

export default function AppNavbar({ showAdmin, onToggleAdmin, restaurantId }: Props) {
  const { isAdmin } = useAdmin();
  const { data: settings } = useRestaurantSettings(restaurantId);
  const { isLight, toggle: toggleLight } = useLightMode();
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.business_name || "Logo"}
              className="h-8 max-w-[160px] object-contain"
            />
          ) : (
            <span className="font-serif text-lg font-semibold text-gold truncate" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {settings?.business_name || "Restaurant"}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLight}
              className="p-2 rounded-md text-muted-foreground hover:text-gold transition-colors"
              aria-label="Toggle light/dark mode"
            >
              {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-md transition-colors text-muted-foreground hover:text-gold"
                title="Go to Dashboard"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            {!isAdmin && (
              <button
                onClick={() => setLoginOpen(true)}
                className="p-2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
