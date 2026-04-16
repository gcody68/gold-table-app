import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useUpsertMenuItem,
  useDeleteMenuItem,
  useCreateMenuItem,
  CATEGORIES,
  MEAL_PERIODS,
  type MenuItem,
  type MealPeriod,
} from "@/hooks/useMenuItems";
import { uploadImage } from "@/hooks/useImageUpload";
import { ImagePlus, Trash2, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props =
  | { item: MenuItem; category?: never; onClose: () => void }
  | { item?: never; category: string; onClose: () => void };

export default function MenuItemModal(props: Props) {
  const { onClose } = props;
  const isNew = !props.item;
  const item = props.item;

  const [name, setName] = useState(item ? item.name : "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [imageUrl, setImageUrl] = useState(item?.image_url || "");
  const [category, setCategory] = useState(item?.category || props.category || "Breakfast");
  const [mealPeriod, setMealPeriod] = useState<MealPeriod>(item?.meal_period ?? "all-day");
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true);
  const [dailyStock, setDailyStock] = useState(item?.daily_stock != null ? String(item.daily_stock) : "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upsert = useUpsertMenuItem();
  const create = useCreateMenuItem();
  const del = useDeleteMenuItem();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "menu");
      setImageUrl(url);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const parsedStock = dailyStock.trim() !== "" ? parseInt(dailyStock, 10) : null;
    try {
      if (isNew) {
        await create.mutateAsync({
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price) || 0,
          image_url: imageUrl || null,
          category,
          meal_period: mealPeriod,
          is_available: isAvailable,
          daily_stock: parsedStock,
        });
      } else {
        await upsert.mutateAsync({
          id: item.id,
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price) || 0,
          image_url: imageUrl || null,
          category,
          meal_period: mealPeriod,
          is_available: isAvailable,
          daily_stock: parsedStock,
        });
      }
      toast.success("Menu item saved!");
      onClose();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await del.mutateAsync(item.id);
      toast.success("Item deleted");
      onClose();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const isPending = upsert.isPending || create.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-gold">
            {isNew ? "Add Menu Item" : "Edit Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[4/3] rounded-lg bg-secondary border-2 border-dashed border-border hover:border-gold/40 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            ) : imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="w-8 h-8" />
                <span className="text-xs">Upload Photo</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Meal Period</Label>
              <Select value={mealPeriod} onValueChange={(v) => setMealPeriod(v as MealPeriod)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} · {p.hours}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dish name" className="bg-secondary border-border" />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description..." className="bg-secondary border-border resize-none" rows={3} />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Price ($)</Label>
            <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="bg-secondary border-border" />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Daily Stock (leave blank for unlimited)</Label>
            <Input
              type="number"
              min="0"
              value={dailyStock}
              onChange={(e) => setDailyStock(e.target.value)}
              placeholder="Unlimited"
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Available</p>
              <p className="text-xs text-muted-foreground">Quickly disable this item without deleting it</p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={isPending} className="flex-1 gradient-gold text-primary-foreground font-semibold">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
            {!isNew && (
              <Button variant="destructive" size="icon" onClick={handleDelete} disabled={del.isPending}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
