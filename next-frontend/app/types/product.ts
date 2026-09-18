// types/product.ts
// ─────────────────────────────────────────────────────────────────────────
// Type กลางที่ยึดตาม schema.prisma (model Product + model ProductUnit)
// เหตุผลที่แยกไฟล์นี้ออกมา: ตอนนี้ POSBody / search-overlay / PaymentModal
// เคยประกาศ interface Product กันเองคนละแบบ พอ backend จริงส่ง DTO มา
// จะ mismatch กันเละ — ไฟล์นี้คือ "สัญญา" เดียวที่ทั้ง mock และของจริงต้องตรงกัน
// ─────────────────────────────────────────────────────────────────────────

export interface ProductUnitOption {
  id: string; // = ProductUnit.id → นี่คือ productUnitId ที่ SaleItem ต้องใช้จริงตอนขาย
  unitName: string; // เช่น "ชิ้น" | "แพ็ค" | "ฟอง" | "กก." (ProductUnit.unitName)
  price: number; // ราคาอ้างอิงของหน่วยนี้ — Prisma เก็บเป็น Decimal, backend ควร serialize เป็น number ให้ FE
  qtyPerBase: number; // อัตราส่วนต่อหน่วยฐาน (ProductUnit.qtyPerBase)
  barcode?: string; // ProductUnit.barcode (nullable ได้จริงตาม schema)
}

export interface Product {
  id: string;
  name: string;
  stock: number; // = Product.qtyOnHandBaseUnit (แปลงจาก Decimal → number ฝั่ง FE)
  units: ProductUnitOption[]; // อย่างน้อย 1 หน่วยเสมอ — มาจาก Product.units (relation)
  isLowStock?: boolean; // เกณฑ์ "ใกล้หมด" ตัดสินใจฝั่ง backend แล้วส่ง flag นี้มาเลย ไม่ต้องคิดเองฝั่ง FE
}

// รายการในตะกร้า — เก็บ snapshot ของหน่วย/ราคา ณ ตอนหยิบใส่ เพราะราคาสินค้าอาจถูกแก้
// ทีหลังโดยไม่ควรกระทบของที่อยู่ในตะกร้าอยู่แล้ว (เหมือน costSnapshot ฝั่ง backend)
export interface CartItem {
  id: string; // = Product.id
  productUnitId: string; // = ProductUnit.id ของหน่วยที่กำลังเลือกอยู่ตอนนี้ (ใช้ยิง POST /sales)
  name: string;
  unit: string; // unitName ปัจจุบัน (โชว์เป็น chip)
  price: number; // ราคาที่ใช้จริงตอนนี้ (อาจถูกแก้เป็น "ราคาพิเศษ" จาก S2.3)
  originalPrice: number; // ราคาอ้างอิงของหน่วยที่เลือก ก่อนถูกแก้ราคาพิเศษ — เทียบกับ price เพื่อรู้ว่ามีส่วนลดไหม
  quantity: number;
  stock: number; // สต็อกคงเหลือ ณ ตอนหยิบ (หน่วยฐาน) — ใช้เทียบเตือน "สต็อกไม่พอ" แบบไม่ block
  availableUnits: ProductUnitOption[]; // หน่วยทั้งหมดของสินค้านี้ — ให้ chip สลับหน่วยเลือกจากตรงนี้
}

// input ตอนหยิบสินค้าใส่ตะกร้า (จากขายด่วน หรือจากผลค้นหา) — ยังไม่ผูกกับ CartItem โดยตรง
// เพราะต้อง resolve ว่าจะใช้ unit ไหนก่อน (default = หน่วยแรก)
export interface AddToCartInput {
  id: string;
  name: string;
  stock: number;
  units: ProductUnitOption[];
  preferredUnitId?: string; // ไม่ระบุ = ใช้ units[0]
}

// payload สำหรับ POST /sales ในอนาคต — โครงตาม model Sale + SaleItem ใน schema.prisma
export interface CreateSalePayload {
  items: {
    productUnitId: string;
    qty: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  paymentMethod: "CASH" | "TRANSFER" | "MIXED";
  cashAmount: number;
  transferAmount: number;
}

export interface CreateSaleResult {
  saleId: string;
  createdAt: string;
}
