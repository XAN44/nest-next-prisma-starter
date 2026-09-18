// app/components/quick-sell/headerPos.tsx
"use client";

import { House, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { SearchBarProduct } from "./searchProduct";
import { SearchOverlay } from "./search-overlay";
import { useSession } from "@/lib/session";

export default function HeaderPOS() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // role มาจาก session จริง (mock ไว้ก่อนจนกว่า Phase 1 Auth จะต่อจริง)
  // ห้าม hardcode label ที่ไม่มีอยู่ใน enum Role (OWNER | STAFF) เช่น "CASHIER"
  const { role } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between sm:h-16 sm:px-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-500/30 sm:h-10 sm:w-10">
            <House className="h-4 w-4 stroke-[2.25] sm:h-5 sm:w-5" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                ระบบขายสินค้า
              </h1>
              <span className="hidden text-base font-bold text-slate-900 sm:inline">
                (POS)
              </span>
            </div>
            <p className="line-clamp-1 text-[10px] text-slate-500 sm:text-xs">
              จัดการรายการสั่งซื้อและชำระเงิน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-1 text-emerald-800 shadow-xs sm:px-3 sm:py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4" />
          <span className="text-xs font-semibold capitalize tracking-wide sm:text-sm">
            {role}
          </span>
        </div>
      </div>

      <SearchBarProduct onClick={() => setIsSearchOpen(true)} />
      <SearchOverlay open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
}
