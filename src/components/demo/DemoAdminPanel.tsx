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
import { Settings, Clock, FileSpreadsheet, Save } from "lucide-react";
import ServiceHoursTab from "@/components/ServiceHoursTab";
import { type ServiceHours, DEFAULT_SERVICE_HOURS } from "@/hooks/useRestaurantSettings";
import ExcelImporter from "@/components/ExcelImporter";
import DemoExcelImporter from "./DemoExcelImporter";

export default function DemoAdminPanel() {
  const { settings, updateSettings } = useDemo();

  const [name, setName] = useState(settings.business_name);
  const [address, setAddress] = useState(settings.business_address ?? "");
  const [phone, setPhone] = useState(settings.business_phone ?? "");
  const [theme, setTheme] = useState<ThemeId>((settings.theme as ThemeId) ?? "midnight-gold");
  const [bgStyle, setBgStyle] = useState<BgStyleId>((settings.bg_style as BgStyleId) ?? "deep-charcoal");
  const [showGallery, setShowGallery] = useState(settings.show_gallery ?? false);
  const [serviceHours, setServiceHours] = useState<ServiceHours>(settings.service_hours ?? DEFAULT_SERVICE_HOURS);
  const [unavailableDisplay, setUnavailableDisplay] = useState<"hide" | "gray">(settings.unavailable_display ?? "hide");
  const [showImporter, setShowImporter] = useState(false);

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
      theme,
      bg_style: bgStyle,
      show_gallery: showGallery,
      service_hours: serviceHours,
      unavailable_display: unavailableDisplay,
    });
    toast.success("Settings saved in demo!");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-serif font-bold text-gold">Admin Dashboard</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full border border-border">
          Demo Mode
        </span>
      </div>

      <Tabs defaultValue="branding">
        <TabsList className="w-full mb-5 bg-secondary grid grid-cols-3">
          <TabsTrigger value="branding" className="gap-1.5 text-xs">
            <Settings className="w-3.5 h-3.5" /> Branding
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5" /> Hours
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-1.5 text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-5">
          <div>
            <Label className="text-muted-foreground text-xs">Restaurant Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border mt-1" />
          </div>

          <div className="flex items-center justify-between py-2 border border-border rounded-lg px-4">
            <div>
              <p className="text-sm font-medium text-foreground">Show Gallery</p>
              <p className="text-xs text-muted-foreground">Display photo gallery</p>
            </div>
            <Switch checked={showGallery} onCheckedChange={setShowGallery} />
          </div>

          <div className="flex items-center justify-between py-2 border border-border rounded-lg px-4">
            <div>
              <p className="text-sm font-medium text-foreground">Unavailable Items</p>
              <p className="text-xs text-muted-foreground">Hide or grey them out</p>
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

          <Button onClick={handleSave} className="w-full gradient-gold text-primary-foreground font-semibold gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </TabsContent>

        <TabsContent value="hours">
          <ServiceHoursTab
            serviceHours={serviceHours}
            unavailableDisplay={unavailableDisplay}
            onChange={(hours) => setServiceHours(hours)}
            onDisplayChange={(v) => setUnavailableDisplay(v)}
          />
          <Button onClick={handleSave} className="w-full gradient-gold text-primary-foreground font-semibold gap-2 mt-4">
            <Save className="w-4 h-4" /> Save Hours
          </Button>
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Import menu items from an Excel file. In the demo, items are saved to your browser — no production database is touched.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2 border-border"
              onClick={() => setShowImporter(true)}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Import from Excel (Demo)
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {showImporter && <DemoExcelImporter open={showImporter} onClose={() => setShowImporter(false)} />}
    </div>
  );
}
