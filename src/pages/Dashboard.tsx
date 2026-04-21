import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { CartProvider } from "@/contexts/CartContext";
import { useRestaurantSettings, useUpdateSettings, DEFAULT_SERVICE_HOURS, DEFAULT_BUSINESS_HOURS, type ServiceHours, type BusinessHours } from "@/hooks/useRestaurantSettings";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/hooks/useImageUpload";
import ThemeSelector from "@/components/ThemeSelector";
import BackgroundStyleSelector, { type BgStyleId, applyBgStyle as applyBgStyleFn, getBgStyleById as getBgStyleByIdFn } from "@/components/BackgroundStyleSelector";
import { type ThemeId, applyTheme as applyThemeFn, getThemeById as getThemeByIdFn } from "@/lib/themes";
import ServiceHoursTab from "@/components/ServiceHoursTab";
import SiteSettingsTab from "@/components/SiteSettingsTab";
import ProfileTab from "@/components/ProfileTab";
import ExcelImporter from "@/components/ExcelImporter";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import AdminLoginModal from "@/components/AdminLoginModal";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UtensilsCrossed, Settings, Clock, CreditCard, Monitor, Globe, User,
  Save, ImagePlus, Loader as Loader2, X, Trash2, FileSpreadsheet, KeyRound,
  ExternalLink, Download, LogOut, ChefHat,
} from "lucide-react";
import { STARTER_ITEMS } from "@/components/StarterContent";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------
async function exportData(restaurantId: string): Promise<void> {
  const [menuRes, ordersRes] = await Promise.all([
    supabase.from("menu_items").select("*").eq("restaurant_id", restaurantId).order("category"),
    supabase.from("orders").select("*, order_items(*)").eq("restaurant_id", restaurantId).order("created_at", { ascending: false }),
  ]);

  if (menuRes.error) throw new Error(`Menu export failed: ${menuRes.error.message}`);
  if (ordersRes.error) throw new Error(`Orders export failed: ${ordersRes.error.message}`);

  const wb = XLSX.utils.book_new();

  // Menu sheet
  const menuRows = (menuRes.data ?? []).map((item) => ({
    Name: item.name,
    Description: item.description ?? "",
    Price: item.price,
    Category: item.category ?? "",
    "Meal Period": item.meal_period ?? "",
    Available: item.is_available ? "Yes" : "No",
    "Daily Stock": item.daily_stock ?? "",
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(menuRows), "Menu Items");

  // Orders sheet
  const orderRows = (ordersRes.data ?? []).flatMap((order: Record<string, unknown>) => {
    const items = (order.order_items as Record<string, unknown>[] | undefined) ?? [];
    if (items.length === 0) {
      return [{
        "Order ID": order.id,
        Date: new Date(order.created_at as string).toLocaleString(),
        Customer: order.customer_name ?? "",
        Phone: order.customer_phone ?? "",
        Email: order.customer_email ?? "",
        "Item Name": "",
        Quantity: "",
        "Item Price": "",
        "Order Total": order.total,
        Status: order.status,
        Notes: order.special_instructions ?? "",
      }];
    }
    return items.map((item, idx) => ({
      "Order ID": idx === 0 ? order.id : "",
      Date: idx === 0 ? new Date(order.created_at as string).toLocaleString() : "",
      Customer: idx === 0 ? (order.customer_name ?? "") : "",
      Phone: idx === 0 ? (order.customer_phone ?? "") : "",
      Email: idx === 0 ? (order.customer_email ?? "") : "",
      "Item Name": item.name ?? "",
      Quantity: item.quantity ?? 1,
      "Item Price": item.price ?? "",
      "Order Total": idx === 0 ? order.total : "",
      Status: idx === 0 ? order.status : "",
      Notes: idx === 0 ? (order.special_instructions ?? "") : "",
    }));
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orderRows), "Order History");

  XLSX.writeFile(wb, `restaurant-data-${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ---------------------------------------------------------------------------
// Inner dashboard (requires auth)
// ---------------------------------------------------------------------------
function DashboardContent() {
  const { isAdmin, session, logout } = useAdmin();
  const { restaurantId } = useRestaurant();
  const { data: settings } = useRestaurantSettings(restaurantId);
  const update = useUpdateSettings();
  const qc = useQueryClient();

  const [loginOpen, setLoginOpen] = useState(!isAdmin);
  const [activeTab, setActiveTab] = useState("branding");

  // Branding state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [headerUrl, setHeaderUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [theme, setTheme] = useState<ThemeId>("midnight-gold");
  const [bgStyle, setBgStyle] = useState<BgStyleId>("deep-charcoal");
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [kitchenViewEnabled, setKitchenViewEnabled] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [serviceHours, setServiceHours] = useState<ServiceHours>(DEFAULT_SERVICE_HOURS);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  const [unavailableDisplay, setUnavailableDisplay] = useState<"hide" | "gray">("hide");

  useEffect(() => {
    if (settings && !initialized) {
      setName(settings.business_name);
      setAddress(settings.business_address || "");
      setPhone(settings.business_phone || "");
      setHeaderUrl(settings.header_image_url || "");
      setLogoUrl(settings.logo_url || "");
      setTheme((settings.theme as ThemeId) || "midnight-gold");
      setBgStyle((settings.bg_style as BgStyleId) || "deep-charcoal");
      setPaymentEnabled(settings.payment_enabled ?? false);
      setStripePublicKey(settings.stripe_public_key || "");
      setStripeSecretKey(settings.stripe_secret_key || "");
      setKitchenViewEnabled(settings.kitchen_view_enabled ?? true);
      setShowGallery(settings.show_gallery ?? false);
      setServiceHours(settings.service_hours ?? DEFAULT_SERVICE_HOURS);
      setBusinessHours(settings.business_hours ?? DEFAULT_BUSINESS_HOURS);
      setUnavailableDisplay(settings.unavailable_display === "gray" ? "gray" : "hide");
      setInitialized(true);

      applyThemeFn(getThemeByIdFn((settings.theme as ThemeId) || "midnight-gold"));
      applyBgStyleFn(getBgStyleByIdFn((settings.bg_style as BgStyleId) || "deep-charcoal"));
    }
  }, [settings, initialized]);

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    applyThemeFn(getThemeByIdFn(id));
    applyBgStyleFn(getBgStyleByIdFn(bgStyle));
  };

  const handleBgStyleChange = (id: BgStyleId) => {
    setBgStyle(id);
    applyBgStyleFn(getBgStyleByIdFn(id));
    applyThemeFn(getThemeByIdFn(theme));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "headers");
      setHeaderUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Header image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, "headers");
      setLogoUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!settings) { toast.error("Settings not loaded — please wait and try again."); return; }
    try {
      await update.mutateAsync({
        id: settings.id,
        business_name: name,
        business_address: address,
        business_phone: phone,
        header_image_url: headerUrl || null,
        logo_url: logoUrl || null,
        theme,
        bg_style: bgStyle,
        payment_enabled: paymentEnabled,
        stripe_public_key: stripePublicKey.trim() || null,
        stripe_secret_key: stripeSecretKey.trim() || null,
        kitchen_view_enabled: kitchenViewEnabled,
        show_gallery: showGallery,
        service_hours: serviceHours,
        business_hours: businessHours,
        unavailable_display: unavailableDisplay,
      });
      toast.success("Settings saved!");
    } catch (err) {
      toast.error(err instanceof Error ? `Save failed: ${err.message}` : "Save failed — please try again.");
    }
  };

  const handleClearDemo = async () => {
    if (!settings?.id) { toast.error("Restaurant not loaded — try again."); return; }
    setClearing(true);
    try {
      const { error: menuErr } = await supabase.from("menu_items").delete().eq("restaurant_id", settings.id);
      if (menuErr) throw new Error(menuErr.message);
      const { error: galleryErr } = await supabase.from("gallery_items").delete().eq("restaurant_id", settings.id);
      if (galleryErr) throw new Error(galleryErr.message);
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      qc.invalidateQueries({ queryKey: ["gallery-items"] });
      toast.success("All data cleared!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear data");
    } finally {
      setClearing(false);
    }
  };

  const handleSeedDemo = async () => {
    if (!settings?.id) return;
    try {
      const items = STARTER_ITEMS.map((item) => ({
        ...item,
        is_placeholder: false,
        restaurant_id: settings.id,
      }));
      const { error } = await supabase.from("menu_items").insert(items);
      if (error) throw new Error(error.message);
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Demo items added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load demo items");
    }
  };

  const handleExport = async () => {
    if (!settings?.id) { toast.error("Restaurant not loaded — try again."); return; }
    setExporting(true);
    try {
      await exportData(settings.id);
      toast.success("Export downloaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed — please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleViewPublicSite = () => {
    const subdomain = settings?.subdomain;
    const url = subdomain
      ? `https://${subdomain}.gildedtable.com`
      : settings?.id
        ? `${window.location.origin}/?test_res_id=${settings.id}`
        : window.location.origin;
    window.open(url, "_blank", "noopener");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        <div className="text-center space-y-4">
          <UtensilsCrossed className="w-16 h-16 text-gold mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Admin access required</p>
          <Button onClick={() => setLoginOpen(true)} className="gradient-gold text-primary-foreground font-semibold">
            Login
          </Button>
        </div>
      </div>
    );
  }

  const NAV_TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "branding", label: "Branding", icon: Settings },
    { id: "hours", label: "Hours", icon: Clock },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "kitchen", label: "Kitchen", icon: Monitor },
    { id: "site", label: "Site", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col">
        {/* Logo / brand */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">Dashboard</p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate max-w-[120px]">
                {settings?.business_name ?? "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-primary/15 text-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <button
            onClick={handleViewPublicSite}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            View My Public Site
          </button>
          <button
            onClick={() => window.open(`${window.location.origin}/kitchen`, "_blank", "noopener")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChefHat className="w-4 h-4 flex-shrink-0" />
            Kitchen Display
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {exporting
              ? <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
              : <Download className="w-4 h-4 flex-shrink-0" />
            }
            Export Data
          </button>
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <KeyRound className="w-4 h-4 flex-shrink-0" />
            Change Password
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {activeTab === "profile" && (
            <>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Profile & Settings</h1>
              <ProfileTab restaurantId={restaurantId} />
            </>
          )}

          {activeTab === "branding" && (
            <>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Branding</h1>
              <div className="space-y-6">
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
                  <Label className="text-muted-foreground text-xs">Business Logo</Label>
                  <p className="text-xs text-muted-foreground mb-1">Displayed in the navbar and order confirmation. If none, business name is shown.</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div
                      onClick={() => document.getElementById("logo-upload-branding")?.click()}
                      className="w-24 h-24 rounded-lg bg-secondary border-2 border-dashed border-border hover:border-primary/40 cursor-pointer flex items-center justify-center overflow-hidden transition-colors flex-shrink-0"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
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
                        onClick={() => document.getElementById("logo-upload-branding")?.click()}
                        className="text-xs text-gold hover:text-gold/80 underline underline-offset-2 transition-colors text-left"
                      >
                        Upload Business Logo
                      </button>
                      {logoUrl && (
                        <button type="button" onClick={() => setLogoUrl("")} className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left">
                          Remove logo
                        </button>
                      )}
                    </div>
                  </div>
                  <input id="logo-upload-branding" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Header Image</Label>
                  <div
                    onClick={() => document.getElementById("header-upload-branding")?.click()}
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
                  <input id="header-upload-branding" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>

                <div className="flex items-center justify-between py-2 border border-border rounded-lg px-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Show Gallery Section</p>
                    <p className="text-xs text-muted-foreground">Display photo gallery on the public menu</p>
                  </div>
                  <Switch checked={showGallery} onCheckedChange={setShowGallery} />
                </div>

                <div className="border-b border-border" />
                <ThemeSelector value={theme} onChange={handleThemeChange} />
                <div className="border-b border-border" />
                <BackgroundStyleSelector value={bgStyle} onChange={handleBgStyleChange} />

                <div className="border-b border-border pb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Import & Demo Data</h3>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => setShowImporter(true)} className="flex-1 gap-2 border-border hover:border-primary/40">
                    <FileSpreadsheet className="w-4 h-4" /> Import Menu
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSeedDemo} className="flex-1">
                    Load Demo Items
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1" disabled={clearing}>
                        <Trash2 className="w-4 h-4 mr-1" /> Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Clear All Menu Items?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all menu items. This action cannot be undone.
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
                <p className="text-xs text-muted-foreground text-center">Tip: In admin mode, click any menu item to edit it.</p>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={update.isPending} className="w-full gradient-gold text-primary-foreground font-semibold">
                    {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === "hours" && (
            <>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Service Hours</h1>
              <ServiceHoursTab
                serviceHours={serviceHours}
                onChange={setServiceHours}
                businessHours={businessHours}
                onBusinessHoursChange={setBusinessHours}
                unavailableDisplay={unavailableDisplay}
                onDisplayChange={setUnavailableDisplay}
              />
              <div className="pt-4 border-t border-border mt-6">
                <Button onClick={handleSave} disabled={update.isPending} className="w-full gradient-gold text-primary-foreground font-semibold">
                  {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
              </div>
            </>
          )}

          {activeTab === "payment" && (
            <>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Payment Settings</h1>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2 border border-border rounded-lg px-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable Online Payments</p>
                    <p className="text-xs text-muted-foreground">Collect card payments at checkout</p>
                  </div>
                  <Switch checked={paymentEnabled} onCheckedChange={setPaymentEnabled} />
                </div>

                {paymentEnabled ? (
                  <div className="space-y-4 border border-border rounded-lg p-4 bg-secondary/30">
                    <p className="text-xs text-muted-foreground">
                      Enter your Stripe or Paystack API keys. Public key is used client-side; secret key is stored securely.
                    </p>
                    <div>
                      <Label className="text-muted-foreground text-xs">Public Key (pk_live_... or pk_test_...)</Label>
                      <Input value={stripePublicKey} onChange={(e) => setStripePublicKey(e.target.value)} placeholder="pk_live_..." className="bg-secondary border-border font-mono text-sm" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Secret Key (sk_live_... or sk_test_...)</Label>
                      <Input type="password" value={stripeSecretKey} onChange={(e) => setStripeSecretKey(e.target.value)} placeholder="sk_live_..." className="bg-secondary border-border font-mono text-sm" />
                    </div>
                    <p className="text-xs text-amber-500/80">Keep your secret key private. It will be masked after saving.</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Toggle on to configure your payment processor.</p>
                    <p className="text-xs mt-1">Customers will see "Pay in Person" when payments are off.</p>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={update.isPending} className="w-full gradient-gold text-primary-foreground font-semibold">
                    {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === "kitchen" && (
            <>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Kitchen Display</h1>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2 border border-border rounded-lg px-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Kitchen Display System</p>
                    <p className="text-xs text-muted-foreground">Enable the /kitchen page for your kitchen staff</p>
                  </div>
                  <Switch checked={kitchenViewEnabled} onCheckedChange={setKitchenViewEnabled} />
                </div>

                {kitchenViewEnabled && (
                  <div className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3">
                    <p className="text-xs text-muted-foreground">Share this link with your kitchen staff. Orders appear in real-time.</p>
                    <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                      <span className="text-xs font-mono text-gold flex-1 truncate">{window.location.origin}/kitchen</span>
                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/kitchen`); toast.success("Link copied!"); }}>
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={update.isPending} className="w-full gradient-gold text-primary-foreground font-semibold">
                    {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === "site" && (
            <>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Site Settings</h1>
              {settings ? (
                <SiteSettingsTab settings={settings} />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading settings...</div>
              )}
            </>
          )}
        </div>
      </main>

      <ExcelImporter open={showImporter} onClose={() => setShowImporter(false)} />
      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <AdminProvider>
      <CartProvider>
        <DashboardContent />
      </CartProvider>
    </AdminProvider>
  );
}
