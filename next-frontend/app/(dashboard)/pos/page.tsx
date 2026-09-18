"use client";

import { useState } from "react";
import HeaderPOS from "@/app/components/quick-sell/headerPos";
import { SearchBarProduct } from "@/app/components/quick-sell/searchProduct";
import { SearchOverlay } from "@/app/components/quick-sell/search-overlay";
import { POSBody } from "@/app/components/quick-sell/POSBody";
import { POSBottomBar } from "@/app/components/quick-sell/POSBottomBar";
import { PaymentModal } from "@/app/components/quick-sell/PaymentModal";

export default function POSPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="pb-20">
      {/* 1. Header */}
      <HeaderPOS />

      {/* 2. Search Bar Trigger */}

      {/* 3. Body ส่วนขายด่วนและรายการสินค้า */}
      <POSBody />

      {/* 4. แถบสรุปยอดรวม + ปุ่มรับเงิน (ลอยติดขอบล่าง อิสระจาก Body) */}
      <POSBottomBar />

      {/* 5. Fullscreen Search Overlay */}

      {/* 6. Payment Bottom Sheet (เด้งขึ้นมาจากขอบล่าง) */}
      <PaymentModal />
    </div>
  );
}
