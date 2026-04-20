import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeSelector from "@/components/ThemeSelector";
import BackgroundStyleSelector, { type BgStyleId, applyBgStyle, getBgStyleById } from "@/components/BackgroundStyleSelector";
import { type ThemeId, applyTheme, getThemeById } from "@/lib/themes";
import { toast } from "sonner";
import {
  Save, Loader as Loader2, Settings, Clock, FileSpreadsheet,
  CreditCard, Monitor, Globe, Trash2, Lock, LogOut, ExternalLink,
} from "lucide-react";
import ServiceHoursTab from "@/components/ServiceHoursTab";
import { type ServiceHours, type BusinessHours, DEFAULT_SERVICE_HOURS, DEFAULT_BUSINESS_HOURS } from "@/hooks/useRestaurantSettings";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { STARTER_ITEMS } from "@/components/StarterContent";
import DemoImagePicker from "./DemoImagePicker";
import DemoExcelImporter from "./DemoExcelImporter";

type Props = { onLogout: () => void };

export default function DemoAdminPanel({ onLogout }: Props) {
  const { settings, updateSettings, menuItems, resetDemo, createMenuItem, clearMenuItems } = useDemo();

  const [name, setName] = useState(settings.business_name);
  const [address, setAddress] = useState(settings.business_address ?? "");
  const [phone, setPhone] = useState(settings.business_phone ?? "");
  const [headerUrl, setHeaderUrl] = useState(settings.header_image_url ?? "");
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [theme, setTheme] = useState<ThemeId>((settings.theme as ThemeId) ?? "sunwashed-citrus");
  const [bgStyle, setBgStyle] = useState<BgStyleId>((settings.bg_style as BgStyleId) ?? "forest-dark");
  const [showGallery, setShowGallery] = useState(settings.show_gallery ?? false);
  const [serviceHours, setServiceHours] = useState<ServiceHours>(settings.service_hours ?? DEFAULT_SERVICE_HOURS);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(settings.business_hours ?? DEFAULT_BUSINESS_HOURS);
  const [unavailableDisplay, setUnavailableDisplay] = useState<"hide" | "gray">(settings.unavailable_display ?? "hide");
  const [paymentEnabled, setPaymentEnabled] = useState(settings.payment_enabled ?? false);
  const [kitchenEnabled, setKitchenEnabled] = useState(settings.kitchen_view_enabled ?? false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (!initialized) {
    setName(settings.business_name);
    setAddress(settings.business_address ?? "");
    setPhone(settings.business_phone ?? "");
    setHeaderUrl(settings.header_image_url ?? "");
    setLogoUrl(settings.logo_url ?? "");
    setTheme((settings.theme as ThemeId) ?? "sunwashed-citrus");
    setBgStyle((settings.bg_style as BgStyleId) ?? "forest-dark");
    setShowGallery(settings.show_gallery ?? false);
    setServiceHours(settings.service_hours ?? DEFAULT_SERVICE_HOURS);
    setBusinessHours(settings.business_hours ?? DEFAULT_BUSINESS_HOURS);
    setUnavailableDisplay(settings.unavailable_display ?? "hide");
    setPaymentEnabled(settings.payment_enabled ?? false);
    setKitchenEnabled(settings.kitchen_view_enabled ?? false);
    setInitialized(true);
  }

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    applyTheme(getThemeById(id));
    applyBgStyle(getBgStyleById(bgStyle));
  };

  const handleBgStyleChange = (id: BgStyleId) => {
    setBgStyle(id);
    applyBgStyle(getBgStyleById(id));
    applyTheme(getThemeById(theme));
  };

  const handleSave = () => {
    updateSettings({
      business_name: name,
      business_address: address,
      business_phone: phone,
      header_image_url: headerUrl || null,
      logo_url: logoUrl || null,
      theme,
      bg_style: bgStyle,
      show_gallery: showGallery,
      service_hours: serviceHours,
      business_hours: businessHours,
      unavailable_display: unavailableDisplay,
      payment_enabled: paymentEnabled,
      kitchen_view_enabled: kitchenEnabled,
    });
    toast.success("Settings saved!");
  };

  const handleSeedDemo = () => {
    setLoadingMenu(true);
    setTimeout(() => {
      const items = STARTER_ITEMS.map((item) => ({
        name: item.name,
        description: item.description ?? "",
        price: item.price,
        image_url: item.image_url ?? null,
        category: item.category,
        meal_period: item.meal_period,
        is_available: true,
        daily_stock: null,
        restaurant_id: null,
      }));
      items.forEach((item) => createMenuItem(item));
      setLoadingMenu(false);
      toast.success("Demo items added!");
    }, 400);
  };

  const handleClearAll = () => {
    clearMenuItems();
    toast.success("All menu items cleared!");
  };

  return (
    <>
      <div className="container py-6">
        <div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-gold">Admin Dashboard</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300/80 bg-amber-950/60 border border-amber-700/40 px-3 py-1 rounded-full font-medium">
                Demo Mode
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </Button>
            </div>
          </div>

          <Tabs defaultValue="branding">
            <TabsList className="w-full mb-6 bg-secondary grid grid-cols-5">
              <TabsTrigger value="branding" className="gap-1.5">
                <Settings className="w-3.5 h-3.5" /> Branding
              </TabsTrigger>
              <TabsTrigger value="hours" className="gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Hours
              </TabsTrigger>
              <TabsTrigger value="payment" className="gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Payment
              </TabsTrigger>
              <TabsTrigger value="kitchen" className="gap-1.5">
                <Monitor className="w-3.5 h-3.5" /> Kitchen
              </TabsTrigger>
              <TabsTrigger value="site" className="gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Site
              </TabsTrigger>
            </TabsList>

            {/* ── BRANDING ── */}
            <TabsContent value="branding" className="space-y-6">
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

              <DemoImagePicker
                value={logoUrl}
                onChange={setLogoUrl}
                aspectClass="aspect-square max-w-[160px]"
                label="Business Logo"
                hint="Displayed in the navbar and order confirmation. If none, business name is shown."
                objectFit="contain"
              />

              <DemoImagePicker
                value={headerUrl}
                onChange={setHeaderUrl}
                aspectClass="h-36"
                label="Header Image"
                objectFit="cover"
              />

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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportModal(true)}
                  className="flex-1 gap-2 border-border hover:border-gold/40"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Import Menu
                </Button>
                <Button variant="outline" size="sm" onClick={handleSeedDemo} disabled={loadingMenu} className="flex-1">
                  {loadingMenu ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load Demo Items"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-1" /> Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Clear All Menu Items?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all menu items. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAll}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Clear & Start Fresh
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Tip: In admin mode, click any menu item to edit it.
              </p>
            </TabsContent>

            {/* ── HOURS ── */}
            <TabsContent value="hours">
              <ServiceHoursTab
                serviceHours={serviceHours}
                onChange={setServiceHours}
                businessHours={businessHours}
                onBusinessHoursChange={setBusinessHours}
                unavailableDisplay={unavailableDisplay}
                onDisplayChange={setUnavailableDisplay}
              />
            </TabsContent>

            {/* ── PAYMENT ── */}
            <TabsContent value="payment" className="space-y-6">
              <div className="flex items-center justify-between py-2 border border-border rounded-lg px-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable Online Payments</p>
                  <p className="text-xs text-muted-foreground">Collect card payments at checkout</p>
                </div>
                <Switch
                  checked={paymentEnabled}
                  onCheckedChange={(v) => {
                    setPaymentEnabled(v);
                    updateSettings({ payment_enabled: v });
                    toast.success(v ? "Online payments enabled" : "Payments disabled — using Pay in Person");
                  }}
                />
              </div>
              {paymentEnabled ? (
                <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Stripe Connected</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    In your live account you would connect your Stripe keys here. In the demo, payments are simulated — customers see the checkout flow but no real charge is made.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Demo orders use "Pay in Person" flow.</p>
                  <p className="text-xs mt-1 opacity-70">Toggle the switch above to preview the payment-enabled experience.</p>
                </div>
              )}
            </TabsContent>

            {/* ── KITCHEN ── */}
            <TabsContent value="kitchen" className="space-y-6">
              <div className="flex items-center justify-between py-2 border border-border rounded-lg px-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Kitchen Display</p>
                  <p className="text-xs text-muted-foreground">Enable the /kitchen page for your kitchen staff</p>
                </div>
                <Switch
                  checked={kitchenEnabled}
                  onCheckedChange={(v) => {
                    setKitchenEnabled(v);
                    updateSettings({ kitchen_view_enabled: v });
                    toast.success(v ? "Kitchen display enabled" : "Kitchen display disabled");
                  }}
                />
              </div>
              {kitchenEnabled ? (
                <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Kitchen Display is Active</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Orders placed by customers appear on the kitchen screen in real-time. Open the kitchen view in a separate tab or device for your kitchen staff.
                  </p>
                  <a
                    href="/kitchen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-gold hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Kitchen Display
                  </a>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Toggle the switch above to enable the Kitchen Display.</p>
                </div>
              )}
            </TabsContent>

            {/* ── SITE ── */}
            <TabsContent value="site" className="space-y-6">
              <div className="rounded-lg border border-border bg-secondary/40 p-4 flex items-start gap-3">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Not Available in Demo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Custom domain and subdomain configuration requires a live account. Start a free trial to publish your menu at your own URL.
                  </p>
                </div>
              </div>
              <div className="text-center py-6 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your live site URL will appear here once you create an account.</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reset Demo</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full gap-2">
                      <Trash2 className="w-4 h-4" /> Reset Demo to Defaults
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Reset Demo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear all your local changes and reload the original sample menu and settings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => { resetDemo(); toast.success("Demo reset to defaults!"); }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Clears browser storage and reloads the sample data.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-border">
            <Button onClick={handleSave} className="w-full gradient-gold text-primary-foreground font-semibold">
              <Save className="w-4 h-4 mr-2" /> Save All Changes
            </Button>
          </div>
        </div>
      </div>

      <DemoExcelImporter open={showImportModal} onClose={() => setShowImportModal(false)} />
    </>
  );
}
