import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpsertMenuItem, useDeleteMenuItem, type MenuItem } from "@/hooks/useMenuItems";
import { uploadImage } from "@/hooks/useImageUpload";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = { item: MenuItem; onClose: () => void };

export default function MenuItemModal({ item, onClose }: Props) {
  const [name, setName] = useState(item.is_placeholder ? "" : item.name);
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.is_placeholder ? "" : String(item.price));
  const [imageUrl, setImageUrl] = useState(item.image_url || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upsert = useUpsertMenuItem();
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
    try {
      await upsert.mutateAsync({
        id: item.id,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        image_url: imageUrl || null,
      });
      toast.success("Menu item saved!");
      onClose();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async () => {
    try {
      await del.mutateAsync(item.id);
      toast.success("Item deleted");
      onClose();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-gold">
            {item.is_placeholder ? "Add Menu Item" : "Edit Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-40 rounded-lg bg-secondary border-2 border-dashed border-border hover:border-gold/40 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
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

          <div>
            <Label className="text-muted-foreground text-xs">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dish name"
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description..."
              className="bg-secondary border-border resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={upsert.isPending}
              className="flex-1 gradient-gold text-primary-foreground font-semibold"
            >
              {upsert.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
            {!item.is_placeholder && (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={del.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
