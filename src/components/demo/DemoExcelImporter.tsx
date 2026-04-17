import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileSpreadsheet, Upload, Download, Loader as Loader2 } from "lucide-react";
import { CATEGORIES, type MealPeriod } from "@/hooks/useMenuItems";
import { useDemo } from "@/contexts/DemoContext";

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
  return "all-day";
}

function generateTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const rows = [
    ["Name", "Description", "Price", "Image_URL", "Category", "Service_Period"],
    ["Eggs Benedict", "Poached eggs on English muffin with hollandaise", "14.00", "", "Breakfast", "Breakfast"],
    ["Club Sandwich", "Triple-decker with turkey, bacon, lettuce, tomato", "15.00", "", "Lunch", "Lunch"],
    ["Ribeye Steak", "12oz ribeye with truffle butter and garlic mash", "54.00", "", "Dinner", "Dinner"],
    ["Garlic Fries", "Crispy golden fries tossed in garlic butter", "8.00", "", "Sides", "All Day"],
    ["Lemonade", "Fresh-squeezed with cane sugar and mint", "5.00", "", "Drinks", "All Day"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 24 }, { wch: 48 }, { wch: 10 }, { wch: 40 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, "Menu");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}

type Props = { open: boolean; onClose: () => void };

export default function DemoExcelImporter({ open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { createMenuItem } = useDemo();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = "";
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames.find((n) => n.toLowerCase() === "menu") ?? wb.SheetNames[0];
      if (!sheetName) throw new Error("No sheets found in file");
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[sheetName], { defval: "" });
      let count = 0;
      for (const row of rows) {
        const name = String(row["Name"] || row["name"] || "").trim();
        if (!name) continue;
        createMenuItem({
          name,
          description: String(row["Description"] || row["description"] || "").trim(),
          price: parseFloat(String(row["Price"] || row["price"] || "0").replace(/[^0-9.]/g, "")) || 0,
          image_url: String(row["Image_URL"] || row["image_url"] || "").trim() || null,
          category: normalizeCategory(String(row["Category"] || row["category"] || "Breakfast")),
          meal_period: normalizePeriod(String(row["Service_Period"] || row["service_period"] || "")),
          is_available: true,
          daily_stock: null,
        });
        count++;
      }
      toast.success(`Added ${count} items to demo menu`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-gold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Menu (Demo)
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Items will be added to your demo session only. No database is touched.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div
            onClick={() => !loading && fileRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/40 rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors group"
          >
            {loading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium text-foreground">Click to upload .xlsx file</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileSelect} />

          <Button variant="outline" className="w-full gap-2" onClick={handleDownloadTemplate} disabled={loading}>
            <Download className="w-4 h-4" />
            Download Template (.xlsx)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
