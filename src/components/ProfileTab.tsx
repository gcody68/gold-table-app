import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Loader as Loader2, ImagePlus, Globe, Copy, CheckCheck, CircleAlert as AlertCircle, ExternalLink } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useRestaurantSettings, useUpdateSettings } from "@/hooks/useRestaurantSettings";
import { uploadImage } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import ThemeSelector from "@/components/ThemeSelector";
import { type ThemeId, applyTheme, getThemeById } from "@/lib/themes";

const SUBDOMAIN_HOST = "gildedtable.com";

function slugify(val: string) {
  return val.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors flex-shrink-0"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ProfileTab({ restaurantId }: { restaurantId?: string | null }) {
  const { session } = useAdmin();
  const { data: settings } = useRestaurantSettings(restaurantId);
  const update = useUpdateSettings();
  const qc = useQueryClient();
  const logoRef = useRef<HTMLInputElement>(null);

  // User identity
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Restaurant identity
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Brand identity
  const [logoUrl, setLogoUrl] = useState("");
  const [theme, setTheme] = useState<ThemeId>("midnight-gold");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // URL settings
  const [subdomain, setSubdomain] = useState("");
  const [subdomainError, setSubdomainError] = useState("");

  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user && !initialized) {
      setEmail(session.user.email ?? "");
      setFullName(session.user.user_metadata?.full_name ?? "");
    }
  }, [session, initialized]);

  useEffect(() => {
    if (settings && !initialized) {
      setBusinessName(settings.business_name ?? "");
      setPhone(settings.business_phone ?? "");
      setAddress(settings.business_address ?? "");
      setLogoUrl(settings.logo_url ?? "");
      setTheme((settings.theme as ThemeId) ?? "midnight-gold");
      setSubdomain(settings.subdomain ?? "");
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, "headers");
      setLogoUrl(url);
      toast.success("Logo uploaded — click Save to apply.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Logo upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  };

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    applyTheme(getThemeById(id));
  };

  const handleSubdomainChange = (val: string) => {
    setSubdomain(slugify(val));
    setSubdomainError("");
  };

  const handleSave = async () => {
    if (!settings) { toast.error("Settings not loaded yet. Please wait and try again."); return; }

    if (subdomain && subdomain.length < 3) {
      setSubdomainError("Subdomain must be at least 3 characters");
      return;
    }

    setSaving(true);
    try {
      // Update Supabase auth user metadata
      if (fullName !== (session?.user?.user_metadata?.full_name ?? "")) {
        const { error: authErr } = await supabase.auth.updateUser({ data: { full_name: fullName } });
        if (authErr) throw new Error(`Could not update name: ${authErr.message}`);
      }

      // Update restaurant settings
      await update.mutateAsync({
        id: settings.id,
        business_name: businessName,
        business_phone: phone || null,
        business_address: address || null,
        logo_url: logoUrl || null,
        theme,
        subdomain: subdomain.trim() || null,
      });

      // Subdomain update is handled inside update.mutateAsync above,
      // but conflicts need special handling
      qc.invalidateQueries({ queryKey: ["restaurant-settings"] });
      toast.success("Profile saved successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      if (msg.toLowerCase().includes("subdomain")) {
        setSubdomainError("This subdomain is already taken — please choose another.");
        toast.error("Subdomain is already taken.");
      } else {
        toast.error(`Save failed: ${msg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = subdomain ? `https://${subdomain}.${SUBDOMAIN_HOST}` : null;

  return (
    <div className="space-y-8">
      {/* User Identity */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Your Account</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email Address</Label>
            <Input
              value={email}
              disabled
              className="bg-secondary border-border opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
        </div>
      </section>

      {/* Restaurant Identity */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Restaurant Identity</h3>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Restaurant Name</Label>
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="The Golden Fork"
            className="bg-secondary border-border"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Physical Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State"
              className="bg-secondary border-border"
            />
          </div>
        </div>
      </section>

      {/* Brand Identity */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Brand Identity</h3>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Business Logo</Label>
          <p className="text-xs text-muted-foreground">Shown in the navbar and order confirmation pages.</p>
          <div className="flex items-center gap-4 mt-1">
            <div
              onClick={() => logoRef.current?.click()}
              className="w-20 h-20 rounded-lg bg-secondary border-2 border-dashed border-border hover:border-primary/40 cursor-pointer flex items-center justify-center overflow-hidden transition-colors flex-shrink-0"
            >
              {uploadingLogo ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-xs">Logo</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="text-xs text-gold hover:text-gold/80 underline underline-offset-2 transition-colors text-left"
              >
                Upload Logo
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Menu Theme Color</Label>
          <p className="text-xs text-muted-foreground">Applies to your public menu page in real-time.</p>
          <div className="mt-2">
            <ThemeSelector value={theme} onChange={handleThemeChange} />
          </div>
        </div>
      </section>

      {/* URL Settings */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Public URL</h3>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Subdomain <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Your restaurant's free hosted address. Only lowercase letters, numbers, and hyphens.
          </p>
          <div className={`flex items-center rounded-md border overflow-hidden transition-colors ${subdomainError ? "border-destructive" : "border-border focus-within:border-gold/60"}`}>
            <span className="bg-muted/60 px-3 py-2 text-xs text-muted-foreground border-r border-border whitespace-nowrap font-mono select-none">
              https://
            </span>
            <Input
              value={subdomain}
              onChange={(e) => handleSubdomainChange(e.target.value)}
              placeholder="your-restaurant"
              className="rounded-none border-0 bg-secondary focus-visible:ring-0 font-mono text-sm flex-1 min-w-0 placeholder:text-muted-foreground/40"
            />
            <span className="bg-muted/60 px-3 py-2 text-xs text-muted-foreground border-l border-border whitespace-nowrap font-mono select-none">
              .{SUBDOMAIN_HOST}
            </span>
          </div>
          {subdomainError && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {subdomainError}
            </p>
          )}
          {previewUrl && !subdomainError && (
            <div className="flex items-center gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> {previewUrl}
              </a>
              <CopyButton value={previewUrl} />
            </div>
          )}
        </div>
      </section>

      <Button
        onClick={handleSave}
        disabled={saving || update.isPending}
        className="w-full gradient-gold text-primary-foreground font-semibold"
      >
        {saving || update.isPending
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <><Save className="w-4 h-4 mr-2" /> Save Profile</>
        }
      </Button>
    </div>
  );
}
