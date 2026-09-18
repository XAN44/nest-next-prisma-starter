// app/components/quick-sell/POSBottomBar.tsx
"use client";

import { useCartStore } from "@/app/src/store/useCartStore";
import { Wallet } from "lucide-react";

export function POSBottomBar() {
  const { cart, getTotalPrice, getTotalItems, setIsPaymentOpen } =
    useCartStore();

  const isEmpty = cart.length === 0;

  // [ไม่ LOCKED แต่ระบุชัดในสเปก S2] ปุ่ม "รับเงิน" ห้ามหายไปแม้ตะกร้าว่าง
  // ต้อง disabled + บอกเหตุผลแทน ไม่ใช่ return null เหมือนเดิม
  return (
    <div className="fixed bottom-14 left-0 right-0 z-30 border-t border-amber-900/10 bg-[#f8f5ee]/95 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="mx-auto max-w-lg">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-semibold text-amber-900/70">
            ยอดรวม ({getTotalItems()} ชิ้น)
          </span>
          <span className="text-2xl font-black text-slate-900">
            ฿{getTotalPrice().toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => !isEmpty && setIsPaymentOpen(true)}
          disabled={isEmpty}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] ${
            isEmpty
              ? "cursor-not-allowed bg-slate-300 text-slate-500"
              : "bg-[#1d6342] text-white hover:bg-[#164e33]"
          }`}
        >
          <Wallet className="h-5 w-5" />
          <span>{isEmpty ? "ยังไม่มีสินค้าในตะกร้า" : "รับเงิน (F12)"}</span>
        </button>
      </div>
    </div>
  );
}
