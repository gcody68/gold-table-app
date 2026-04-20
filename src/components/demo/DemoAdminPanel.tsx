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
import { Settings, Clock, FileSpreadsheet, Save, Sparkles, Lock } from "lucide-react";
import ServiceHoursTab from "@/components/ServiceHoursTab";
import { type ServiceHours, type BusinessHours, DEFAULT_SERVICE_HOURS, DEFAULT_BUSINESS_HOURS } from "@/hooks/useRestaurantSettings";

export default function DemoAdminPanel() {
  const { settings, updateSettings, loadSampleMenu, menuItems } = useDemo();

  const [name, setName] = useState(settings.business_name);
  const [address, setAddress] = useState(settings.business_address ?? "");
  const [phone, setPhone] = useState(settings.business_phone ?? "");
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
    <div className="bg-card border border-border rounded-xl p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-serif font-bold text-gold">Admin Dashboard</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
          Demo
        </span>
      </div>

      <Tabs defaultValue="branding">
        <TabsList className="w-full mb-4 bg-secondary grid grid-cols-3">
          <TabsTrigger value="branding" className="gap-1 text-xs py-1.5">
            <Settings className="w-3 h-3" /> Branding
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-1 text-xs py-1.5">
            <Clock className="w-3 h-3" /> Hours
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-1 text-xs py-1.5">
            <FileSpreadsheet className="w-3 h-3" /> Menu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs">Restaurant Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-border mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border mt-1 h-8 text-sm" />
          </div>

          <div className="flex items-center justify-between py-2 border border-border rounded-lg px-3">
            <div>
              <p className="text-xs font-medium text-foreground">Show Gallery</p>
              <p className="text-xs text-muted-foreground">Photo gallery section</p>
            </div>
            <Switch checked={showGallery} onCheckedChange={setShowGallery} />
          </div>

          <div className="flex items-center justify-between py-2 border border-border rounded-lg px-3">
            <div>
              <p className="text-xs font-medium text-foreground">Unavailable Items</p>
              <p className="text-xs text-muted-foreground">Grey out vs. hide</p>
            </div>
            <Switch
              checked={unavailableDisplay === "gray"}
              onCheckedChange={(v) => setUnavailableDisplay(v ? "gray" : "hide")}
            />
          </div>

          <div className="border-b border-border" />
          <ThemeSelector value={theme} onChange={handleThemeChange} />
          <div className="border-b border-border" />
          <BackgroundStyleSelector value={bgStyle} onChange={handleBgStyleChange} />

          <Button onClick={handleSave} size="sm" className="w-full gradient-gold text-primary-foreground font-semibold gap-1.5 h-8 text-xs">
            <Save className="w-3.5 h-3.5" /> Save Settings
          </Button>
        </TabsContent>

        <TabsContent value="hours">
          <ServiceHoursTab
            serviceHours={serviceHours}
            onChange={(hours) => setServiceHours(hours)}
            businessHours={businessHours}
            onBusinessHoursChange={(hours) => setBusinessHours(hours)}
            unavailableDisplay={unavailableDisplay}
            onDisplayChange={(v) => setUnavailableDisplay(v)}
          />
          <Button onClick={handleSave} size="sm" className="w-full gradient-gold text-primary-foreground font-semibold gap-1.5 h-8 text-xs mt-4">
            <Save className="w-3.5 h-3.5" /> Save Hours
          </Button>
        </TabsContent>

        <TabsContent value="import" className="space-y-3">
          <div className="rounded-lg border border-gold/25 bg-gold/5 p-3">
            <p className="text-xs font-semibold text-gold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Quick Start
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Instantly populate 14 sample items across Breakfast, Lunch, Dinner, Sides, and Drinks categories.
            </p>
            <Button
              onClick={handleLoadSampleMenu}
              disabled={loadingMenu}
              className="w-full gradient-gold text-primary-foreground font-semibold text-xs h-8 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loadingMenu ? "Loading..." : "Load Sample Menu"}
            </Button>
            {menuItems.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {menuItems.length} item{menuItems.length !== 1 ? "s" : ""} currently in demo
              </p>
            )}
          </div>

          <div className="border-b border-border" />

          <div className="rounded-lg border border-border bg-secondary/40 p-3 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">Import from Excel</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unavailable in Demo. Use <span className="text-gold font-medium">Load Sample Menu</span> above, or start a free account to import your own spreadsheet.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
