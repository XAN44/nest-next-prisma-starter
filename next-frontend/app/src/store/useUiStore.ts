// app/src/store/useUIStore.ts
// ─────────────────────────────────────────────────────────────────────────
// สโตร์เล็กๆ สำหรับ toast แทน alert() — สเปก S2.2 ระบุว่าปิดการขายแล้วต้อง
// ขึ้น toast สั้นๆ "บันทึกการขายแล้ว" ไม่ใช่กล่อง alert ของ browser
// ถ้าโปรเจกต์มี toast library อยู่แล้ว (เช่น sonner จาก shadcn) แนะนำให้ย้ายไปใช้
// ของนั้นแทน ไฟล์นี้เป็นแค่ทางออกที่ไม่ต้องพึ่ง dependency เพิ่ม
// ─────────────────────────────────────────────────────────────────────────

import { create } from "zustand";

interface UIStore {
  toastMessage: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toastMessage: null,
  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => {
      set((state) =>
        state.toastMessage === message ? { toastMessage: null } : state,
      );
    }, 2200);
  },
  clearToast: () => set({ toastMessage: null }),
}));
