import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { MenuItem } from "@/hooks/useMenuItems";

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: MenuItem, specialInstructions?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateSpecialInstructions: (id: string, instructions: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  pendingItem: MenuItem | null;
  setPendingItem: (item: MenuItem | null) => void;
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: "", phone: "", email: "" });

  const addItem = useCallback((menuItem: MenuItem, specialInstructions?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing && !specialInstructions) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem, quantity: 1, specialInstructions }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.menuItem.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItem.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.menuItem.id === id ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const updateSpecialInstructions = useCallback((id: string, instructions: string) => {
    setItems((prev) =>
      prev.map((i) => (i.menuItem.id === id ? { ...i, specialInstructions: instructions } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomerInfo({ name: "", phone: "", email: "" });
  }, []);

  const total = items.reduce((sum, i) => sum + Number(i.menuItem.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, updateSpecialInstructions,
        clearCart, total, itemCount, isOpen, setIsOpen,
        pendingItem, setPendingItem, customerInfo, setCustomerInfo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
