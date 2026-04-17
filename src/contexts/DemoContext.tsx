import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
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

export type DemoStep = "branding" | "menu" | "ordering";

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
  loadSampleMenu: () => void;
  completedSteps: Set<DemoStep>;
  markStepComplete: (step: DemoStep) => void;
  syncPulse: boolean;
  phoneHighlight: boolean;
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
  const [completedSteps, setCompletedSteps] = useState<Set<DemoStep>>(new Set());
  const [syncPulse, setSyncPulse] = useState(false);
  const [phoneHighlight, setPhoneHighlight] = useState(false);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveToStorage(DEMO_MENU_KEY, menuItems);
  }, [menuItems]);

  useEffect(() => {
    saveToStorage(DEMO_SETTINGS_KEY, settings);
  }, [settings]);

  const triggerSync = useCallback(() => {
    setSyncPulse(true);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => setSyncPulse(false), 1200);
  }, []);

  const triggerHighlight = useCallback(() => {
    setPhoneHighlight(true);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setPhoneHighlight(false), 1000);
  }, []);

  const updateSettings = useCallback((updates: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    triggerSync();
    if (updates.theme || updates.bg_style) {
      triggerHighlight();
    }
    if (updates.business_name || updates.header_image_url) {
      setCompletedSteps((prev) => new Set([...prev, "branding" as DemoStep]));
    }
  }, [triggerSync, triggerHighlight]);

  const createMenuItem = useCallback((item: Omit<MenuItem, "id" | "sort_order" | "is_placeholder">) => {
    const newItem: MenuItem = {
      ...item,
      id: `demo-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sort_order: Date.now(),
      is_placeholder: false,
    };
    setMenuItems((prev) => [...prev, newItem]);
    triggerSync();
    setCompletedSteps((prev) => new Set([...prev, "menu" as DemoStep]));
  }, [triggerSync]);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    triggerSync();
  }, [triggerSync]);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    triggerSync();
  }, [triggerSync]);

  const loadSampleMenu = useCallback(() => {
    const fresh = buildDefaultMenuItems();
    setMenuItems(fresh);
    triggerSync();
    triggerHighlight();
    setCompletedSteps((prev) => new Set([...prev, "menu" as DemoStep]));
  }, [triggerSync, triggerHighlight]);

  const markStepComplete = useCallback((step: DemoStep) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }, []);

  const resetDemo = useCallback(() => {
    const freshItems = buildDefaultMenuItems();
    setMenuItems(freshItems);
    setSettings(DEFAULT_DEMO_SETTINGS);
    setCompletedSteps(new Set());
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
      loadSampleMenu,
      completedSteps,
      markStepComplete,
      syncPulse,
      phoneHighlight,
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
