import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gdMatch) {
    return `https://drive.google.com/uc?export=view&id=${gdMatch[1]}`;
  }
  const gdOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (gdOpen) {
    return `https://drive.google.com/uc?export=view&id=${gdOpen[1]}`;
  }
  return url;
}
