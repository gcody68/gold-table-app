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
import { resolveImageUrl } from "@/lib/utils";

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
  if (!raw) return "Sides";
  const trimmed = raw.trim().toLowerCase();
  const match = [...CATEGORIES].find((c) => c.toLowerCase() === trimmed);
  if (match) return match;
  for (const cat of CATEGORIES) {
    if (trimmed.includes(cat.toLowerCase()) || cat.toLowerCase().includes(trimmed)) return cat;
  }
  return "Sides";
}

function normalizePeriod(raw: string, category?: string): MealPeriod {
  const lower = (raw || "").trim().toLowerCase();
  if (lower.includes("breakfast") || lower === "am") return "breakfast";
  if (lower.includes("lunch") || lower === "midday") return "lunch";
  if (lower.includes("dinner") || lower === "pm" || lower === "evening") return "dinner";
  if (lower.includes("all") || lower === "always" || lower === "anytime") return "all-day";
  if (category) {
    const catLower = category.toLowerCase();
    if (catLower === "breakfast") return "breakfast";
    if (catLower === "lunch") return "lunch";
    if (catLower === "dinner") return "dinner";
  }
  return "all-day";
}

function findColumn(headers: string[], candidates: string[]): string | null {
  const normalized = headers.map((h) => (h || "").toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const candidate of candidates) {
    const needle = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    const idx = normalized.findIndex((h) => h === needle);
    if (idx !== -1) return headers[idx];
  }
  for (const candidate of candidates) {
    const needle = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    const idx = normalized.findIndex((h) => h.includes(needle) || needle.includes(h));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function getVal(row: Record<string, unknown>, col: string | null): string {
  if (!col) return "";
  const val = row[col];
  if (val == null) return "";
  return String(val).trim();
}

function isMenuSheet(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("menu") || lower.includes("item") || lower.includes("food");
}

function isGallerySheet(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("gallery") || lower.includes("photo") || lower.includes("image");
}

function isInfoSheet(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("info") || lower.includes("restaurant") || lower.includes("business") || lower.includes("about");
}

function parseMenuSheet(buffer: ArrayBuffer): ParsedData {
  const wb = XLSX.read(buffer, { type: "array" });

  const result: ParsedData = {
    menuItems: [],
    galleryItems: [],
    restaurantInfo: null,
  };

  const menuSheetName =
    wb.SheetNames.find(isMenuSheet) ??
    wb.SheetNames[0];

  const gallerySheetName =
    wb.SheetNames.find(isGallerySheet) ??
    wb.SheetNames.find((n) => n !== menuSheetName && !isInfoSheet(n));

  const infoSheetName =
    wb.SheetNames.find(isInfoSheet) ??
    wb.SheetNames.find((n) => n !== menuSheetName && n !== gallerySheetName);

  if (menuSheetName) {
    const ws = wb.Sheets[menuSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);

      const nameCol = findColumn(headers, ["name", "item", "item name", "dish", "dish name", "product", "menu item"]);
      const descCol = findColumn(headers, ["description", "desc", "details", "info", "about"]);
      const priceCol = findColumn(headers, ["price", "cost", "amount", "rate", "charge"]);
      const imageCol = findColumn(headers, ["image_url", "image url", "image", "photo", "photo url", "photo_url", "img", "img_url", "picture", "url", "link", "google drive", "drive link"]);
      const categoryCol = findColumn(headers, ["category", "cat", "section", "type", "group", "course"]);
      const periodCol = findColumn(headers, ["service_period", "service period", "period", "meal", "meal period", "time", "availability", "when", "service"]);

      for (const row of rows) {
        const name = getVal(row, nameCol);
        if (!name) continue;
        const rawCat = getVal(row, categoryCol);
        const rawPeriod = getVal(row, periodCol);
        const category = normalizeCategory(rawCat);
        const meal_period = normalizePeriod(rawPeriod, category);
        const rawPrice = getVal(row, priceCol).replace(/[^0-9.]/g, "");
        const rawImage = getVal(row, imageCol);
        const resolvedImage = resolveImageUrl(rawImage) || rawImage;

        result.menuItems.push({
          name,
          description: getVal(row, descCol),
          price: parseFloat(rawPrice) || 0,
          image_url: resolvedImage,
          category,
          meal_period,
        });
      }
    }
  }

  if (gallerySheetName && gallerySheetName !== menuSheetName) {
    const ws = wb.Sheets[gallerySheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      const urlCol = findColumn(headers, ["image_url", "image url", "url", "image", "photo", "photo url", "photo_url", "link", "drive", "src"]);
      const captionCol = findColumn(headers, ["caption", "title", "label", "description", "desc", "name", "alt"]);

      for (const row of rows) {
        const rawUrl = getVal(row, urlCol);
        if (!rawUrl) continue;
        const resolvedUrl = resolveImageUrl(rawUrl) || rawUrl;
        result.galleryItems.push({
          image_url: resolvedUrl,
          caption: getVal(row, captionCol),
        });
      }
    }
  }

  if (infoSheetName && infoSheetName !== menuSheetName && infoSheetName !== gallerySheetName) {
    const ws = wb.Sheets[infoSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      const nameCol = findColumn(headers, ["name", "restaurant", "business name", "business_name", "restaurant name"]);
      const addrCol = findColumn(headers, ["address", "location", "business address", "business_address", "addr"]);
      const phoneCol = findColumn(headers, ["phone", "telephone", "tel", "contact", "business phone", "business_phone", "number"]);

      const row = rows[0];
      result.restaurantInfo = {
        business_name: getVal(row, nameCol) || undefined,
        business_address: getVal(row, addrCol) || undefined,
        business_phone: getVal(row, phoneCol) || undefined,
      };
    }
  }

  return result;
}

function generateTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new();

  const menuRows = [
    ["Name", "Description", "Price", "Image_URL", "Category", "Service_Period"],
    ["Eggs Benedict", "Poached eggs on English muffin with hollandaise", "14.00", "https://drive.google.com/file/d/YOUR_FILE_ID/view", "Breakfast", "Breakfast"],
    ["Caesar Salad", "Romaine, parmesan, croutons, house Caesar dressing", "13.00", "https://drive.google.com/file/d/YOUR_FILE_ID/view", "Lunch", "Lunch"],
    ["Ribeye Steak", "12oz ribeye with truffle butter and garlic mash", "54.00", "https://drive.google.com/file/d/YOUR_FILE_ID/view", "Dinner", "Dinner"],
    ["Garlic Fries", "Crispy fries tossed in garlic and parsley", "8.00", "https://drive.google.com/file/d/YOUR_FILE_ID/view", "Sides", "All Day"],
    ["Lemonade", "Fresh-squeezed with a hint of mint", "5.00", "https://drive.google.com/file/d/YOUR_FILE_ID/view", "Drinks", "All Day"],
  ];
  const menuWs = XLSX.utils.aoa_to_sheet(menuRows);
  menuWs["!cols"] = [{ wch: 24 }, { wch: 48 }, { wch: 10 }, { wch: 60 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, menuWs, "Menu");

  const galleryRows = [
    ["Image_URL", "Caption"],
    ["https://drive.google.com/file/d/YOUR_FILE_ID/view", "Our stunning dining room"],
    ["https://drive.google.com/file/d/YOUR_FILE_ID/view", "A special evening"],
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
  const [preview, setPreview] = useState<{ sheets: string[]; menuCount: number; galleryCount: number; hasInfo: boolean } | null>(null);
  const qc = useQueryClient();

  const triggerCaution = (target: "file" | "mock") => {
    setCautionTarget(target);
    setShowCaution(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    if (fileRef.current) fileRef.current.value = "";

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const data = parseMenuSheet(buffer);
      setPreview({
        sheets: wb.SheetNames,
        menuCount: data.menuItems.length,
        galleryCount: data.galleryItems.length,
        hasInfo: !!data.restaurantInfo?.business_name,
      });
    } catch {
      setPreview(null);
    }

    triggerCaution("file");
  };

  const handleCautionConfirm = async () => {
    setShowCaution(false);
    if (cautionTarget === "file" && pendingFile) {
      await executeFileImport(pendingFile);
      setPendingFile(null);
      setPreview(null);
    } else if (cautionTarget === "mock") {
      await executeMockImport();
    }
    setCautionTarget(null);
  };

  const handleCautionCancel = () => {
    setShowCaution(false);
    setPendingFile(null);
    setPreview(null);
    setCautionTarget(null);
  };

  const executeFileImport = async (file: File) => {
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const data = parseMenuSheet(buffer);

      if (data.menuItems.length === 0 && data.galleryItems.length === 0 && !data.restaurantInfo) {
        toast.error("No data found. Check that your file has the right columns — see the template for reference.");
        return;
      }

      const count = await importData(data, qc);
      const parts: string[] = [];
      if (data.menuItems.length) parts.push(`${data.menuItems.length} menu items`);
      if (data.galleryItems.length) parts.push(`${data.galleryItems.length} gallery photos`);
      if (data.restaurantInfo?.business_name) parts.push("restaurant info");

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
              Upload your .xlsx file. Column names are detected automatically — Google Drive image links are supported.
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
                    <p className="text-xs text-muted-foreground mt-1">Column names detected automatically</p>
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
              Load Sample Data (Mock menu + Gallery)
            </Button>

            <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground text-xs">Sheet detection (any of these names work):</p>
              <p><strong className="text-foreground">Menu sheet:</strong> "Menu", "Items", "Food"</p>
              <p><strong className="text-foreground">Gallery sheet:</strong> "Gallery", "Photos", "Images"</p>
              <p><strong className="text-foreground">Info sheet:</strong> "Restaurant_Info", "Info", "About"</p>
              <p className="pt-1 border-t border-border"><strong className="text-foreground">Image URLs:</strong> Google Drive shareable links are auto-converted. Set sharing to "Anyone with the link — Viewer".</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCaution} onOpenChange={setShowCaution}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <TriangleAlert className="w-5 h-5 text-amber-500" />
              Confirm Import
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                {preview && (
                  <div className="bg-secondary/60 rounded-lg p-3 space-y-1 text-xs">
                    <p className="font-semibold text-foreground">Detected in your file:</p>
                    <p>Sheets: <span className="text-foreground">{preview.sheets.join(", ")}</span></p>
                    {preview.menuCount > 0 && <p className="text-green-400">{preview.menuCount} menu items ready to import</p>}
                    {preview.galleryCount > 0 && <p className="text-green-400">{preview.galleryCount} gallery photos ready to import</p>}
                    {preview.hasInfo && <p className="text-green-400">Restaurant info detected</p>}
                    {preview.menuCount === 0 && preview.galleryCount === 0 && (
                      <p className="text-amber-400">No data detected — check your column names match the template.</p>
                    )}
                  </div>
                )}
                <p>
                  This will <strong className="text-foreground">add</strong> items to your existing menu. Items already on the menu will not be replaced.
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
              Import Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
