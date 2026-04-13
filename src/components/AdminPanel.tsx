import { useState, useRef } from "react";
import { useRestaurantSettings, useUpdateSettings } from "@/hooks/useRestaurantSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/hooks/useImageUpload";
import { toast } from "sonner";
import { Save, ImagePlus, Loader2, X, Trash2 } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import ThemeSelector from "@/components/ThemeSelector";
import BackgroundStyleSelector, { type BgStyleId, applyBgStyle, getBgStyleById } from "@/components/BackgroundStyleSelector";
import { type ThemeId, applyTheme, getThemeById } from "@/lib/themes";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { STARTER_ITEMS } from "@/components/StarterContent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminPanel() {
  const { data: settings } = useRestaurantSettings();
  const update = useUpdateSettings();
  const { logout } = useAdmin();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [headerUrl, setHeaderUrl] = useState("");
  const [theme, setTheme] = useState<ThemeId>("midnight-gold");
  const [bgStyle, setBgStyle] = useState<BgStyleId>("deep-charcoal");
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (settings && !initialized) {
    setName(settings.business_name);
    setAddress(settings.business_address || "");
    setPhone(settings.business_phone || "");
    setHeaderUrl(settings.header_image_url || "");
    setTheme((settings.theme as ThemeId) || "midnight-gold");
    setInitialized(true);
  }

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    applyTheme(getThemeById(id));
  };

  const handleBgStyleChange = (id: BgStyleId) => {
    setBgStyle(id);
    applyBgStyle(getBgStyleById(id));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "headers");
      setHeaderUrl(url);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      await update.mutateAsync({
        id: settings.id,
        business_name: name,
        business_address: address,
        business_phone: phone,
        header_image_url: headerUrl || null,
        theme,
      });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleClearDemo = async () => {
    setClearing(true);
    try {
      await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Demo data cleared! Start adding your own items.");
    } catch {
      toast.error("Failed to clear data");
    } finally {
      setClearing(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const items = STARTER_ITEMS.map((item) => ({
        ...item,
        is_placeholder: false,
      }));
      await supabase.from("menu_items").insert(items);
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Demo items added!");
    } catch {
      toast.error("Failed to seed demo data");
    }
  };

  return (
    <div className="container py-6">
      <div className="bg-card border border-border rounded-lg p-6 max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-gold">Admin Dashboard</h2>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>

        <div className="border-b border-border pb-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Branding</h3>
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Business Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" />
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-border" />
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border" />
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Header Image</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className="mt-1 h-32 rounded-lg bg-secondary border-2 border-dashed border-border hover:border-primary/40 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : headerUrl ? (
              <img src={headerUrl} alt="Header" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs">Upload</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        <div className="border-b border-border pb-2" />
        <ThemeSelector value={theme} onChange={handleThemeChange} />

        <div className="border-b border-border pb-2" />
        <BackgroundStyleSelector value={bgStyle} onChange={handleBgStyleChange} />

        <Button
          onClick={handleSave}
          disabled={update.isPending}
          className="w-full gradient-gold text-primary-foreground font-semibold"
        >
          {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>

        <div className="border-b border-border pb-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Demo Data</h3>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleSeedDemo} className="flex-1">
            Load Demo Items
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex-1" disabled={clearing}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear Demo Data & Start Customizing
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Clear All Menu Items?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all placeholder items and let you build your own menu from scratch. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearDemo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, Clear & Start Fresh
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Tip: In admin mode, click any menu placeholder to add a dish.
        </p>
      </div>
    </div>
  );
}
