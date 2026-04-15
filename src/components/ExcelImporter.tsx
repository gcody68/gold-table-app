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
import { FileSpreadsheet, Upload, FlaskConical, Loader as Loader2, TriangleAlert } from "lucide-react";
import { CATEGORIES } from "@/hooks/useMenuItems";
import {
  MOCK_MENU_ITEMS,
  MOCK_GALLERY_ITEMS,
  MOCK_RESTAURANT_INFO,
} from "@/lib/mockImportData";

const KNOWN_MENU_CATEGORIES = [...CATEGORIES];
const RESTAURANT_INFO_SHEET = "Restaurant_Info";
const GALLERY_SHEET = "Gallery";

type ParsedData = {
  menuItems: { name: string; description: string; price: number; category: string; image_url: string }[];
  galleryItems: { image_url: string; caption: string }[];
  restaurantInfo: { business_name?: string; business_address?: string; business_phone?: string } | null;
  newCategories: string[];
};

function parseSheet(wb: XLSX.WorkBook, sheetName: string): Record<string, string>[] {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
}

function parseExcel(buffer: ArrayBuffer): ParsedData {
  const wb = XLSX.read(buffer, { type: "array" });
  const result: ParsedData = {
    menuItems: [],
    galleryItems: [],
    restaurantInfo: null,
    newCategories: [],
  };

  for (const sheetName of wb.SheetNames) {
    if (sheetName === RESTAURANT_INFO_SHEET) {
      const rows = parseSheet(wb, sheetName);
      if (rows.length > 0) {
        const row = rows[0];
        result.restaurantInfo = {
          business_name: String(row["Name"] || row["business_name"] || "").trim() || undefined,
          business_address: String(row["Address"] || row["business_address"] || "").trim() || undefined,
          business_phone: String(row["Phone"] || row["business_phone"] || "").trim() || undefined,
        };
      }
      continue;
    }

    if (sheetName === GALLERY_SHEET) {
      const rows = parseSheet(wb, sheetName);
      for (const row of rows) {
        const url = String(row["image_url"] || row["URL"] || row["url"] || "").trim();
        if (url) {
          result.galleryItems.push({
            image_url: url,
            caption: String(row["caption"] || row["Caption"] || "").trim(),
          });
        }
      }
      continue;
    }

    const category = sheetName.trim();
    const isNew = !KNOWN_MENU_CATEGORIES.includes(category as never);
    if (isNew && !result.newCategories.includes(category)) {
      result.newCategories.push(category);
    }

    const rows = parseSheet(wb, sheetName);
    for (const row of rows) {
      const name = String(row["name"] || row["Name"] || "").trim();
      if (!name) continue;
      result.menuItems.push({
        name,
        description: String(row["description"] || row["Description"] || "").trim(),
        price: parseFloat(String(row["price"] || row["Price"] || "0")) || 0,
        category,
        image_url: String(row["image_url"] || row["Image"] || "").trim(),
      });
    }
  }

  return result;
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
    newCategories: [],
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
      const data = parseExcel(buffer);
      const count = await importData(data, qc);

      const parts: string[] = [];
      if (data.menuItems.length) parts.push(`${data.menuItems.length} menu items`);
      if (data.galleryItems.length) parts.push(`${data.galleryItems.length} gallery photos`);
      if (data.restaurantInfo) parts.push("restaurant info");
      if (data.newCategories.length) parts.push(`new categories: ${data.newCategories.join(", ")}`);

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
              Upload an .xlsx file. Each sheet name becomes a menu category. Special sheets:
              <strong className="text-foreground"> Restaurant_Info</strong> and <strong className="text-foreground">Gallery</strong>.
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
                    <p className="text-xs text-muted-foreground mt-1">Sheets: Mains · Sides · Drinks · Desserts · Specials · Gallery · Restaurant_Info</p>
                  </div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileSelect} />

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
              Load Mock Data (Ribeye, Salmon, Margaritas + Gallery)
            </Button>

            <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground text-xs">Excel Column Format (per sheet):</p>
              <p>Menu sheets: <code className="bg-secondary px-1 rounded">name · description · price · image_url</code></p>
              <p>Gallery sheet: <code className="bg-secondary px-1 rounded">image_url · caption</code></p>
              <p>Restaurant_Info: <code className="bg-secondary px-1 rounded">Name · Address · Phone</code></p>
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
                  This will overwrite your current menu. To avoid errors, ensure you are using the{" "}
                  <strong className="text-foreground">official Gilded Table Template</strong>.
                </p>
                <p>
                  First time? We recommend doing a <strong className="text-foreground">manual upload</strong> for single items.
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
