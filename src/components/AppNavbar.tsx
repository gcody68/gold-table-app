import { useAdmin } from "@/contexts/AdminContext";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { Settings, Shield } from "lucide-react";
import { useState } from "react";
import AdminLoginModal from "./AdminLoginModal";

type Props = { showAdmin: boolean; onToggleAdmin: () => void };

export default function AppNavbar({ showAdmin, onToggleAdmin }: Props) {
  const { isAdmin } = useAdmin();
  const { data: settings } = useRestaurantSettings();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <span className="font-serif text-lg font-semibold text-gold truncate">
            {settings?.business_name || "Restaurant"}
          </span>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onToggleAdmin}
                className={`p-2 rounded-md transition-colors ${showAdmin ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-gold"}`}
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
