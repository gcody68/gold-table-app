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
  Save, ImagePlus, Settings, Clock, FileSpreadsheet, CreditCard, Monitor, Globe,
  Sparkles, Trash2, Lock,
} from "lucide-react";
import ServiceHoursTab from "@/components/ServiceHoursTab";
import { type ServiceHours, type BusinessHours, DEFAULT_SERVICE_HOURS, DEFAULT_BUSINESS_HOURS } from "@/hooks/useRestaurantSettings";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DemoAdminPanel() {
  const { settings, updateSettings, loadSampleMenu, menuItems, resetDemo } = useDemo();

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
  const [loadingMenu, setLoadingMenu] = useState(false);

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    applyTheme(getThemeById(id));
    applyBgStyle(getBgStyleById(bgStyle));
    updateSettings({ theme: id });
  };

  const handleBgStyleChange = (id: BgStyleId) => {
    setBgStyle(id);
    applyBgStyle(getBgStyleById(id));
    applyTheme(getThemeById(theme));
    updateSettings({ bg_style: id });
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
    });
    toast.success("Settings saved!");
  };

  const handleLoadSampleMenu = () => {
    setLoadingMenu(true);
    setTimeout(() => {
      loadSampleMenu();
      setLoadingMenu(false);
      toast.success("Sample menu loaded — 14 items across Breakfast, Lunch, Dinner, Sides & Drinks!");
    }, 400);
  };

  return (
    <div className="container py-6">
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gold">Admin Dashboard</h2>
          <span className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full font-medium">
            Demo Mode
          </span>
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
            <TabsTrigger value="menu" className="gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Menu
            </TabsTrigger>
          </TabsList>

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

            <div>
              <Label className="text-muted-foreground text-xs">Business Logo URL</Label>
              <p className="text-xs text-muted-foreground mb-1">Displayed in the navbar and order confirmation.</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-24 h-24 rounded-lg bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImagePlus className="w-5 h-5" />
                      <span className="text-xs">Logo</span>
                    </div>
                  )}
                </div>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="bg-secondary border-border text-sm" />
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Header Image URL</Label>
              <div className="mt-1 h-32 rounded-lg bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {headerUrl ? (
                  <img src={headerUrl} alt="Header" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">Enter URL below</span>
                  </div>
                )}
              </div>
              <Input value={headerUrl} onChange={(e) => setHeaderUrl(e.target.value)} placeholder="https://..." className="bg-secondary border-border mt-2 text-sm" />
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
          </TabsContent>

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

          <TabsContent value="payment" className="space-y-6">
            <div className="rounded-lg border border-border bg-secondary/40 p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Payment Configuration</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Payment setup is not available in Demo Mode. Start a free account to configure Stripe and collect real payments.
                </p>
              </div>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Demo orders use "Pay in Person" flow.</p>
            </div>
          </TabsContent>

          <TabsContent value="kitchen" className="space-y-6">
            <div className="rounded-lg border border-border bg-secondary/40 p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Kitchen Display</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The live kitchen display is not available in Demo Mode. In your real account, orders placed by customers appear on the Kitchen screen in real-time.
                </p>
              </div>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Start a free account to enable the Kitchen Display.</p>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <div className="rounded-lg border border-gold/25 bg-gold/5 p-4">
              <p className="text-sm font-semibold text-gold mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Quick Start
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Instantly populate 14 sample items across Breakfast, Lunch, Dinner, Sides, and Drinks categories.
              </p>
              <Button
                onClick={handleLoadSampleMenu}
                disabled={loadingMenu}
                className="w-full gradient-gold text-primary-foreground font-semibold gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loadingMenu ? "Loading..." : "Load Sample Menu"}
              </Button>
              {menuItems.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {menuItems.length} item{menuItems.length !== 1 ? "s" : ""} currently in demo
                </p>
              )}
            </div>

            <div className="border-b border-border" />

            <div className="rounded-lg border border-border bg-secondary/40 p-4 flex items-start gap-3">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Import from Excel</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unavailable in Demo. Use <span className="text-gold font-medium">Load Sample Menu</span> above, or start a free account to import your own spreadsheet.
                </p>
              </div>
            </div>

            <div className="border-b border-border" />

            <div>
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
                Clears localStorage and reloads the Gold Standard sample data.
              </p>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Tip: In admin mode, click any menu item to edit it.
            </p>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={handleSave} className="w-full gradient-gold text-primary-foreground font-semibold">
            <Save className="w-4 h-4 mr-2" /> Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
