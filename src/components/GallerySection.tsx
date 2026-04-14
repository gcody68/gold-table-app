import { useGalleryItems } from "@/hooks/useGallery";
import { useAdmin } from "@/contexts/AdminContext";
import GalleryAdminControls from "./GalleryAdminControls";

export default function GallerySection() {
  const { data: items, isLoading } = useGalleryItems();
  const { isAdmin } = useAdmin();

  if (!isAdmin && (!items || items.length === 0)) return null;

  return (
    <section id="gallery-section" className="container py-12">
      <h2 className="text-3xl font-serif font-bold text-gold mb-8 text-center">
        Gallery
      </h2>

      {isAdmin && <GalleryAdminControls />}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid group relative rounded-lg overflow-hidden">
              <img
                src={item.image_url}
                alt={item.caption || "Gallery image"}
                className="w-full object-cover rounded-lg"
                loading="lazy"
              />
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        isAdmin && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No gallery images yet. Use the controls above to add images.
          </p>
        )
      )}
    </section>
  );
}
