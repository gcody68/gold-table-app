import { useState, useRef } from "react";
import { useRestaurantSettings, useUpdateSettings } from "@/hooks/useRestaurantSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/hooks/useImageUpload";
import { toast } from "sonner";
import { Save, ImagePlus, Loader2, X } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminPanel() {
  const { data: settings } = useRestaurantSettings();
  const update = useUpdateSettings();
  const { logout } = useAdmin();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [headerUrl, setHeaderUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (settings && !initialized) {
    setName(settings.business_name);
    setAddress(settings.business_address || "");
    setPhone(settings.business_phone || "");
    setHeaderUrl(settings.header_image_url || "");
    setInitialized(true);
  }

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
      });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
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
            className="mt-1 h-32 rounded-lg bg-secondary border-2 border-dashed border-border hover:border-gold/40 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
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

        <Button
          onClick={handleSave}
          disabled={update.isPending}
          className="w-full gradient-gold text-primary-foreground font-semibold"
        >
          {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Tip: In admin mode, click any menu placeholder to add a dish.
        </p>
      </div>
    </div>
  );
}
