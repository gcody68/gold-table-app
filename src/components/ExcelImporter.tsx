import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileSpreadsheet, Upload, FlaskConical, Loader as Loader2, TriangleAlert, Download } from "lucide-react";
import { CATEGORIES, type MealPeriod } from "@/hooks/useMenuItems";
import {
  MOCK_MENU_ITEMS,
  MOCK_GALLERY_ITEMS,
  MOCK_RESTAURANT_INFO,
} from "@/lib/mockImportData";

const VALID_CATEGORIES = [...CATEGORIES].map((c) => c.toLowerCase());
const VALID_PERIODS = ["breakfast", "lunch", "dinner", "all day", "all-day"];

type ParsedMenuItem = {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  meal_period: MealPeriod;
};

type ParsedData = {
  menuItems: ParsedMenuItem[];
  galleryItems: { image_url: string; caption: string }[];
  restaurantInfo: { business_name?: string; business_address?: string; business_phone?: string } | null;
};

function normalizeCategory(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  const match = [...CATEGORIES].find((c) => c.toLowerCase() === lower);
  return match ?? "Breakfast";
}

function normalizePeriod(raw: string): MealPeriod {
  const lower = raw.trim().toLowerCase();
  if (lower === "breakfast") return "breakfast";
  if (lower === "lunch") return "lunch";
  if (lower === "dinner") return "dinner";
  if (lower === "all day" || lower === "all-day") return "all-day";
  return "all-day";
}

function parseMenuSheet(buffer: ArrayBuffer): ParsedData {
  const wb = XLSX.read(buffer, { type: "array" });

  const result: ParsedData = {
    menuItems: [],
    galleryItems: [],
    restaurantInfo: null,
  };

  const MENU_SHEET = wb.SheetNames.find((n) => n.toLowerCase() === "menu") ?? wb.SheetNames[0];
  const GALLERY_SHEET = wb.SheetNames.find((n) => n.toLowerCase() === "gallery");
  const INFO_SHEET = wb.SheetNames.find((n) => n.toLowerCase() === "restaurant_info");

  if (MENU_SHEET) {
    const ws = wb.Sheets[MENU_SHEET];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
    for (const row of rows) {
      const name = String(row["Name"] || row["name"] || "").trim();
      if (!name) continue;
      const rawCategory = String(row["Category"] || row["category"] || "").trim();
      const rawPeriod = String(row["Service_Period"] || row["service_period"] || row["Period"] || "").trim();
      result.menuItems.push({
        name,
        description: String(row["Description"] || row["description"] || "").trim(),
        price: parseFloat(String(row["Price"] || row["price"] || "0").replace(/[^0-9.]/g, "")) || 0,
        image_url: String(row["Image_URL"] || row["image_url"] || row["Image"] || "").trim(),
        category: normalizeCategory(rawCategory || "Breakfast"),
        meal_period: normalizePeriod(rawPeriod || "all-day"),
      });
    }
  }

  if (GALLERY_SHEET) {
    const ws = wb.Sheets[GALLERY_SHEET];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
    for (const row of rows) {
      const url = String(row["image_url"] || row["URL"] || row["url"] || "").trim();
      if (url) {
        result.galleryItems.push({
          image_url: url,
          caption: String(row["caption"] || row["Caption"] || "").trim(),
        });
      }
    }
  }

  if (INFO_SHEET) {
    const ws = wb.Sheets[INFO_SHEET];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
    if (rows.length > 0) {
      const row = rows[0];
      result.restaurantInfo = {
        business_name: String(row["Name"] || row["business_name"] || "").trim() || undefined,
        business_address: String(row["Address"] || row["business_address"] || "").trim() || undefined,
        business_phone: String(row["Phone"] || row["business_phone"] || "").trim() || undefined,
      };
    }
  }

  return result;
}

function generateTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new();

  const menuRows = [
    ["Name", "Description", "Price", "Image_URL", "Category", "Service_Period"],
    ["Eggs Benedict", "Poached eggs on English muffin with hollandaise", "14.00", "", "Breakfast", "Breakfast"],
    ["Avocado Toast", "Smashed avo on sourdough with chili flakes", "12.00", "", "Breakfast", "Breakfast"],
    ["Caesar Salad", "Romaine, parmesan, croutons, house Caesar dressing", "13.00", "", "Lunch", "Lunch"],
    ["Club Sandwich", "Turkey, bacon, lettuce, tomato on toasted brioche", "15.00", "", "Lunch", "Lunch"],
    ["Ribeye Steak", "12oz ribeye with truffle butter and garlic mash", "54.00", "", "Dinner", "Dinner"],
    ["Grilled Salmon", "Atlantic salmon with lemon-herb butter", "38.00", "", "Dinner", "Dinner"],
    ["Garlic Fries", "Crispy fries tossed in garlic and parsley", "8.00", "", "Sides", "All Day"],
    ["Lemonade", "Fresh-squeezed with a hint of mint", "5.00", "", "Drinks", "All Day"],
  ];
  const menuWs = XLSX.utils.aoa_to_sheet(menuRows);
  menuWs["!cols"] = [{ wch: 24 }, { wch: 48 }, { wch: 10 }, { wch: 40 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, menuWs, "Menu");

  const galleryRows = [
    ["image_url", "caption"],
    ["https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg", "Our stunning dining room"],
  ];
  const galleryWs = XLSX.utils.aoa_to_sheet(galleryRows);
  galleryWs["!cols"] = [{ wch: 60 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, galleryWs, "Gallery");

  const infoRows = [
    ["Name", "Address", "Phone"],
    ["Your Restaurant Name", "123 Main St, City, State 00000", "(555) 000-0000"],
  ];
  const infoWs = XLSX.utils.aoa_to_sheet(infoRows);
  infoWs["!cols"] = [{ wch: 30 }, { wch: 40 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, infoWs, "Restaurant_Info");

  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}

async function importData(data: ParsedData, qc: ReturnType<typeof useQueryClient>) {
  let totalImported = 0;

  if (data.menuItems.length > 0) {
    const items = data.menuItems.map((item, i) => ({
      ...item,
      sort_order: 1000 + i,
      is_placeholder: false,
    }));
    const { error } = await supabase.from("menu_items").insert(items);
    if (error) throw new Error(`Menu import failed: ${error.message}`);
    totalImported += items.length;
    qc.invalidateQueries({ queryKey: ["menu-items"] });
  }

  if (data.galleryItems.length > 0) {
    const galleryRows = data.galleryItems.map((g, i) => ({ ...g, sort_order: 1000 + i }));
    const { error } = await supabase.from("gallery_items").insert(galleryRows);
    if (error) throw new Error(`Gallery import failed: ${error.message}`);
    totalImported += galleryRows.length;
    qc.invalidateQueries({ queryKey: ["gallery-items"] });
  }

  if (data.restaurantInfo) {
    const { data: settings } = await supabase.from("restaurant_settings").select("id").limit(1).maybeSingle();
    if (settings) {
      const updates: Record<string, string> = {};
      if (data.restaurantInfo.business_name) updates.business_name = data.restaurantInfo.business_name;
      if (data.restaurantInfo.business_address) updates.business_address = data.restaurantInfo.business_address;
      if (data.restaurantInfo.business_phone) updates.business_phone = data.restaurantInfo.business_phone;
      if (Object.keys(updates).length > 0) {
        await supabase.from("restaurant_settings").update(updates).eq("id", settings.id);
        qc.invalidateQueries({ queryKey: ["restaurant-settings"] });
      }
    }
  }

  return totalImported;
}

async function runMockImport(qc: ReturnType<typeof useQueryClient>) {
  const mockData: ParsedData = {
    menuItems: MOCK_MENU_ITEMS,
    galleryItems: MOCK_GALLERY_ITEMS,
    restaurantInfo: MOCK_RESTAURANT_INFO,
  };
  return importData(mockData, qc);
}

type Props = { open: boolean; onClose: () => void };

export default function ExcelImporter({ open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showCaution, setShowCaution] = useState(false);
  const [cautionTarget, setCautionTarget] = useState<"file" | "mock" | null>(null);
  const qc = useQueryClient();

  const triggerCaution = (target: "file" | "mock") => {
    setCautionTarget(target);
    setShowCaution(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    if (fileRef.current) fileRef.current.value = "";
    triggerCaution("file");
  };

  const handleCautionConfirm = async () => {
    setShowCaution(false);
    if (cautionTarget === "file" && pendingFile) {
      await executeFileImport(pendingFile);
      setPendingFile(null);
    } else if (cautionTarget === "mock") {
      await executeMockImport();
    }
    setCautionTarget(null);
  };

  const handleCautionCancel = () => {
    setShowCaution(false);
    setPendingFile(null);
    setCautionTarget(null);
  };

  const executeFileImport = async (file: File) => {
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const data = parseMenuSheet(buffer);

      if (data.menuItems.length === 0 && data.galleryItems.length === 0 && !data.restaurantInfo) {
        toast.error("No data found. Make sure your file has a 'Menu' sheet with the correct columns.");
        return;
      }

      const count = await importData(data, qc);
      const parts: string[] = [];
      if (data.menuItems.length) parts.push(`${data.menuItems.length} menu items`);
      if (data.galleryItems.length) parts.push(`${data.galleryItems.length} gallery photos`);
      if (data.restaurantInfo) parts.push("restaurant info");

      toast.success(`Imported ${count} records — ${parts.join(", ")}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const executeMockImport = async () => {
    setLoading(true);
    try {
      const count = await runMockImport(qc);
      toast.success(`Mock data loaded — ${count} records imported`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mock import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const buffer = generateTemplate();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu-import-template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-gold flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Import Menu from Excel
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Upload a single .xlsx file. Use the <strong className="text-foreground">Menu</strong> sheet with the columns below.
              Optional sheets: <strong className="text-foreground">Gallery</strong> and <strong className="text-foreground">Restaurant_Info</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div
              onClick={() => !loading && fileRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/40 rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors group"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Click to upload .xlsx file</p>
                    <p className="text-xs text-muted-foreground mt-1">Single sheet format — see template below</p>
                  </div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileSelect} />

            <Button
              variant="outline"
              className="w-full gap-2 border-border hover:border-gold/40 hover:text-gold"
              onClick={handleDownloadTemplate}
              disabled={loading}
            >
              <Download className="w-4 h-4" />
              Download Template (.xlsx)
            </Button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="px-3 text-xs text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 border-border hover:border-primary/40"
              onClick={() => triggerCaution("mock")}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
              Load Mock Data (Sample menu + Gallery)
            </Button>

            <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground text-xs">Menu Sheet Columns (A–F):</p>
              <p><code className="bg-secondary px-1 rounded">Name · Description · Price · Image_URL · Category · Service_Period</code></p>
              <p className="pt-1">Valid <strong className="text-foreground">Category</strong> values: Breakfast, Lunch, Dinner, Sides, Drinks, Specials, Desserts</p>
              <p>Valid <strong className="text-foreground">Service_Period</strong> values: Breakfast, Lunch, Dinner, All Day</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCaution} onOpenChange={setShowCaution}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <TriangleAlert className="w-5 h-5 text-amber-500" />
              CAUTION: Bulk Menu Update
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This will <strong className="text-foreground">add</strong> items to your existing menu. To avoid duplicates, make sure the items in your file are not already on the menu.
                </p>
                <p>
                  Use the official <strong className="text-foreground">Download Template</strong> to ensure your file matches the required format.
                </p>
                <p>
                  Need help? Bulk imports are best handled by your{" "}
                  <strong className="text-foreground">IT Support partner</strong> to ensure zero downtime.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCautionCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCautionConfirm}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              I Understand, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
