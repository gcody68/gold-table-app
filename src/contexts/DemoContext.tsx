import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { MenuItem, MealPeriod } from "@/hooks/useMenuItems";
import type { RestaurantSettings } from "@/hooks/useRestaurantSettings";
import { DEFAULT_SERVICE_HOURS } from "@/hooks/useRestaurantSettings";
import { MOCK_MENU_ITEMS } from "@/lib/mockImportData";

const DEMO_GUEST_ID_KEY = "gilded_demo_guest_id";
const DEMO_MENU_KEY = "gilded_demo_menu";
const DEMO_SETTINGS_KEY = "gilded_demo_settings";

function generateGuestId(): string {
  return `guest_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function getOrCreateGuestId(): string {
  const existing = localStorage.getItem(DEMO_GUEST_ID_KEY);
  if (existing) return existing;
  const id = generateGuestId();
  localStorage.setItem(DEMO_GUEST_ID_KEY, id);
  return id;
}

const DEFAULT_DEMO_SETTINGS: RestaurantSettings = {
  id: "demo",
  business_name: "The Golden Fork",
  business_address: "88 Ocean Drive, Honolulu, HI 96815",
  business_phone: "(808) 555-0188",
  header_image_url: null,
  logo_url: null,
  theme: "midnight-gold",
  bg_style: "deep-charcoal",
  payment_enabled: false,
  stripe_public_key: null,
  stripe_secret_key: null,
  kitchen_view_enabled: true,
  show_gallery: false,
  service_hours: DEFAULT_SERVICE_HOURS,
  unavailable_display: "hide",
};

function buildDefaultMenuItems(): MenuItem[] {
  return MOCK_MENU_ITEMS.map((item, i) => ({
    id: `demo-item-${i}`,
    name: item.name,
    description: item.description,
    price: item.price,
    image_url: item.image_url,
    sort_order: item.sort_order ?? i * 10,
    is_placeholder: false,
    category: item.category,
    meal_period: item.meal_period,
    is_available: true,
    daily_stock: null,
  }));
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

type DemoContextType = {
  guestId: string;
  menuItems: MenuItem[];
  settings: RestaurantSettings;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  updateSettings: (updates: Partial<RestaurantSettings>) => void;
  createMenuItem: (item: Omit<MenuItem, "id" | "sort_order" | "is_placeholder">) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  resetDemo: () => void;
};

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const guestId = getOrCreateGuestId();

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    loadFromStorage<MenuItem[]>(DEMO_MENU_KEY, buildDefaultMenuItems())
  );
  const [settings, setSettings] = useState<RestaurantSettings>(() =>
    loadFromStorage<RestaurantSettings>(DEMO_SETTINGS_KEY, DEFAULT_DEMO_SETTINGS)
  );
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    saveToStorage(DEMO_MENU_KEY, menuItems);
  }, [menuItems]);

  useEffect(() => {
    saveToStorage(DEMO_SETTINGS_KEY, settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const createMenuItem = useCallback((item: Omit<MenuItem, "id" | "sort_order" | "is_placeholder">) => {
    const newItem: MenuItem = {
      ...item,
      id: `demo-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sort_order: Date.now(),
      is_placeholder: false,
    };
    setMenuItems((prev) => [...prev, newItem]);
  }, []);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const resetDemo = useCallback(() => {
    const freshItems = buildDefaultMenuItems();
    setMenuItems(freshItems);
    setSettings(DEFAULT_DEMO_SETTINGS);
    localStorage.removeItem(DEMO_MENU_KEY);
    localStorage.removeItem(DEMO_SETTINGS_KEY);
    localStorage.removeItem(DEMO_GUEST_ID_KEY);
  }, []);

  return (
    <DemoContext.Provider value={{
      guestId,
      menuItems,
      settings,
      isAdmin,
      setIsAdmin,
      updateSettings,
      createMenuItem,
      updateMenuItem,
      deleteMenuItem,
      resetDemo,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
