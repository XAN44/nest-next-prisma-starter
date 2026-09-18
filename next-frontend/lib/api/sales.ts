// lib/api/sales.ts
// ─────────────────────────────────────────────────────────────────────────
// วันที่ Phase 4 (ขายหน้าร้าน) ฝั่ง backend เสร็จ: uncomment apiFetch() แล้ว
// ลบ mock ทิ้ง — PaymentModal ที่เรียก createSale() ไม่ต้องแก้เลย
// ─────────────────────────────────────────────────────────────────────────

import { CreateSalePayload, CreateSaleResult } from "@/app/types/product";
import { apiFetch } from "./client";

export async function createSale(
  payload: CreateSalePayload,
): Promise<CreateSaleResult> {
  // เมื่อ backend พร้อม แทนที่ทั้งฟังก์ชันนี้ด้วย:
  // return apiFetch<CreateSaleResult>("/sales", {
  //   method: "POST",
  //   body: JSON.stringify(payload),
  // });
  void apiFetch;

  await new Promise((resolve) => setTimeout(resolve, 200));

  // จำลอง network เก็บ log ไว้ดูใน console ระหว่าง dev เท่านั้น
  console.log("[mock createSale] payload:", payload);

  return {
    saleId: `mock-sale-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}
