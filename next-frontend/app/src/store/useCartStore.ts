// app/src/store/useCartStore.ts
import { create } from "zustand";
import type { AddToCartInput, CartItem } from "@/types/product";

interface CartStore {
  cart: CartItem[];
  isPaymentOpen: boolean;
  // id ของแถวที่เพิ่งถูกเพิ่ม/บวกจำนวนล่าสุด — ใช้ trigger highlight animation
  // ใน POSBody แล้ว component เป็นคน clear เองหลัง animation จบ (ดู POSBody.tsx)
  lastAddedId: string | null;

  addToCart: (product: AddToCartInput) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setIsPaymentOpen: (isOpen: boolean) => void;
  clearLastAdded: () => void;

  // S2.3 — สลับหน่วยขายจาก chip ในแถวตะกร้า
  switchUnit: (id: string, productUnitId: string) => void;
  // S2.3 — แก้ราคาขายเฉพาะครั้งนี้ (ราคาพิเศษ), ไม่กระทบราคาตั้งต้นของสินค้า
  setSpecialPrice: (id: string, newPrice: number) => void;
  clearSpecialPrice: (id: string) => void;

  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  // ตะกร้าต้องเริ่มว่างเปล่าเสมอ — ห้าม seed ข้อมูลจำลองไว้ล่วงหน้า เพราะจะบัง
  // ไม่ให้เจอ empty state จริง (ข้อความ "แตะสินค้าขายด่วน หรือค้นหาเพื่อเริ่มขาย")
  // และบังบั๊กที่ปุ่ม "รับเงิน" หายไปตอนตะกร้าว่างจริง (ดู POSBottomBar.tsx)
  cart: [],
  isPaymentOpen: false,
  lastAddedId: null,

  addToCart: (product) => {
    const unit =
      product.units.find((u) => u.id === product.preferredUnitId) ??
      product.units[0];

    if (!unit) {
      console.error(
        `[useCartStore] สินค้า "${product.name}" ไม่มีหน่วยขายเลย ข้ามการเพิ่มลงตะกร้า`,
      );
      return;
    }

    set((state) => {
      const existing = state.cart.find(
        (item) => item.id === product.id && item.productUnitId === unit.id,
      );

      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id && item.productUnitId === unit.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
          lastAddedId: product.id,
        };
      }

      const newItem: CartItem = {
        id: product.id,
        productUnitId: unit.id,
        name: product.name,
        unit: unit.unitName,
        price: unit.price,
        originalPrice: unit.price,
        quantity: 1,
        stock: product.stock,
        availableUnits: product.units,
      };

      return {
        cart: [...state.cart, newItem],
        lastAddedId: newItem.id,
      };
    });
  },

  updateQuantity: (id, delta) => {
    set((state) => ({
      cart: state.cart
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter((item): item is CartItem => item !== null),
    }));
  },

  removeFromCart: (id) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    }));
  },

  clearCart: () => set({ cart: [], lastAddedId: null }),
  setIsPaymentOpen: (isOpen) => set({ isPaymentOpen: isOpen }),
  clearLastAdded: () => set({ lastAddedId: null }),

  switchUnit: (id, productUnitId) => {
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.id !== id) return item;
        const newUnit = item.availableUnits.find((u) => u.id === productUnitId);
        if (!newUnit) return item;
        return {
          ...item,
          productUnitId: newUnit.id,
          unit: newUnit.unitName,
          price: newUnit.price,
          originalPrice: newUnit.price,
        };
      }),
    }));
  },

  setSpecialPrice: (id, newPrice) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, price: newPrice } : item,
      ),
    }));
  },

  clearSpecialPrice: (id) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, price: item.originalPrice } : item,
      ),
    }));
  },

  getTotalPrice: () =>
    get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  getTotalItems: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
}));
