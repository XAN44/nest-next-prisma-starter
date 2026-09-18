// app/components/quick-sell/searchProduct.tsx
"use client";

import { Search, ScanBarcode } from "lucide-react";

interface SearchBarTriggerProps {
  onClick: () => void;
}

/**
 * เดิมไฟล์นี้เป็น input จริงที่มี state ของตัวเอง ทั้งที่ถูกครอบด้วย onClick
 * เพื่อเปิด SearchOverlay อีกที — ทำให้มี "ช่องพิมพ์ปลอม" 2 ชุดที่ state ไม่ตรงกัน
 * ตอนนี้เปลี่ยนให้เป็นแค่ปุ่ม trigger เฉยๆ ไม่มี input จริง ตัวพิมพ์ค้นหาจริง
 * อยู่ใน search-overlay.tsx เท่านั้นที่เดียว
 */
export function SearchBarProduct({ onClick }: SearchBarTriggerProps) {
  return (
    <div className="p-3">
      <button
        type="button"
        onClick={onClick}
        className="relative flex h-11 w-full items-center rounded-xl border border-amber-900/10 bg-[#f4ebd0]/50 pl-10 pr-12 text-left text-sm text-gray-500 shadow-xs transition-all hover:bg-white"
      >
        <Search className="absolute left-3.5 h-4 w-4 text-gray-600" />
        <span>ค้นหาสินค้า หรือ รหัสบาร์โค้ด...</span>
        <ScanBarcode className="absolute right-2.5 h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
}
