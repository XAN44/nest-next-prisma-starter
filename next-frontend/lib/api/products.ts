// lib/api/products.ts
// ─────────────────────────────────────────────────────────────────────────
// Service layer สำหรับข้อมูลสินค้า — component ต้องเรียกผ่านฟังก์ชันในไฟล์นี้
// เท่านั้น ห้าม import mock array ตรงๆ เข้า component อีกต่อไป
//
// วันที่ backend เสร็จ: uncomment บรรทัด apiFetch() แล้วลบส่วน mock ทิ้ง
// component ที่เรียกใช้ (POSBody, search-overlay) ไม่ต้องแก้อะไรเลย
// เพราะ signature (รับ query คืน Promise<Product[]>) เหมือนเดิมทุกประการ
// ─────────────────────────────────────────────────────────────────────────

import { Product } from "@/app/types/product";
import { apiFetch } from "./client";

const MOCK_NETWORK_DELAY_MS = 150;

function delay<T>(value: T, ms = MOCK_NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// แคตตาล็อกสินค้าจำลอง — ตอนต่อ backend จริงข้อมูลนี้จะมาจาก
// GET /products (join กับ ProductUnit) แทน
const MOCK_CATALOG: Product[] = [
  {
    id: "1",
    name: "มาม่าต้มยำกุ้งน้ำข้น 67 กรัม",
    stock: 28,
    units: [
      {
        id: "u1-1",
        unitName: "ซอง",
        price: 7.0,
        qtyPerBase: 1,
        barcode: "885012300412",
      },
      { id: "u1-2", unitName: "แพ็ค (6 ซอง)", price: 40.0, qtyPerBase: 6 },
    ],
  },
  {
    id: "2",
    name: "มาม่าหมูสับ 67 กรัม",
    stock: 14,
    units: [
      {
        id: "u2-1",
        unitName: "ซอง",
        price: 7.0,
        qtyPerBase: 1,
        barcode: "885012300415",
      },
    ],
  },
  {
    id: "3",
    name: "มาม่าคัพ รสต้มยำกุ้ง 60 กรัม",
    stock: 3,
    isLowStock: true,
    units: [
      {
        id: "u3-1",
        unitName: "ถ้วย",
        price: 15.0,
        qtyPerBase: 1,
        barcode: "885012300902",
      },
    ],
  },
  {
    id: "4",
    name: "ไวไวต้มยำกุ้งน้ำข้น 60 กรัม",
    stock: 42,
    units: [
      {
        id: "u4-1",
        unitName: "ซอง",
        price: 10.0,
        qtyPerBase: 1,
        barcode: "885012300188",
      },
    ],
  },
  {
    id: "5",
    name: "ไข่ไก่ เบอร์ 2",
    stock: 48,
    units: [
      { id: "u5-1", unitName: "ฟอง", price: 4.5, qtyPerBase: 1 },
      { id: "u5-2", unitName: "แผง (30 ฟอง)", price: 125.0, qtyPerBase: 30 },
    ],
  },
  {
    id: "6",
    name: "น้ำดื่มตราสิงห์ 600ml",
    stock: 24,
    units: [
      { id: "u6-1", unitName: "ขวด", price: 10.0, qtyPerBase: 1 },
      { id: "u6-2", unitName: "แพ็ค (12 ขวด)", price: 108.0, qtyPerBase: 12 },
    ],
  },
  {
    id: "7",
    name: "น้ำแข็งหลอด",
    stock: 50,
    units: [{ id: "u7-1", unitName: "ถุง", price: 8.0, qtyPerBase: 1 }],
  },
  {
    id: "8",
    name: "ปลากระป๋อง ตราปลาเงิน",
    stock: 15,
    units: [{ id: "u8-1", unitName: "กระป๋อง", price: 20.0, qtyPerBase: 1 }],
  },
  {
    id: "9",
    name: "เอ็ม-150",
    stock: 30,
    units: [{ id: "u9-1", unitName: "ขวด", price: 12.0, qtyPerBase: 1 }],
  },
  {
    id: "10",
    name: "บะหมี่กึ่งสำเร็จรูป ยำยำ รสหมู",
    stock: 20,
    units: [{ id: "u10-1", unitName: "ซอง", price: 7.0, qtyPerBase: 1 }],
  },
];

// ลำดับ id ของสินค้าขายดี — ของจริงจะมาจาก
// GET /products/quick-sell (เรียงตาม ProductUnit.salesCount DESC ตาม schema)
const QUICK_SELL_ORDER = ["1", "5", "6", "7", "8", "9", "2", "4", "3", "10"];

/** สินค้าขายด่วนหน้า POS — เรียงตามความถี่ขายจริงของร้าน (ฝั่ง backend เป็นคนคำนวณลำดับ) */
export async function getQuickSellProducts(): Promise<Product[]> {
  if (!(process.env.NODE_ENV === "production")) {
    // no-op, กันไม่ให้ TS complain ว่า apiFetch import ไม่ได้ใช้ตอน mock
    void apiFetch;
  }
  // เมื่อ backend พร้อม แทนที่ทั้งฟังก์ชันนี้ด้วย:
  // return apiFetch<Product[]>("/products/quick-sell");

  const ordered = QUICK_SELL_ORDER.map((id) =>
    MOCK_CATALOG.find((p) => p.id === id),
  ).filter((p): p is Product => Boolean(p));

  return delay(ordered);
}

/**
 * ค้นหาสินค้าแบบ fuzzy — ใช้ subsequence match แบบเบาๆ (พิมพ์ตัวอักษรไม่ติดกัน
 * ก็ยัง match ได้) ไม่ใช่ fuzzy library เต็มรูปแบบ ถ้าต้องการแม่นกว่านี้ค่อยเปลี่ยน
 * ไปใช้ไลบรารีอย่าง Fuse.js ตอนต่อ backend จริง (backend เองก็ควรทำ fuzzy search
 * ด้วย เช่น Postgres pg_trgm เพราะข้อมูลสินค้าจริงจะมีเป็นพันรายการ ค้นฝั่ง FE ไม่ไหว)
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return delay([]);

  // เมื่อ backend พร้อม แทนที่ด้วย:
  // return apiFetch<Product[]>(`/products/search?q=${encodeURIComponent(trimmed)}`);

  const results = MOCK_CATALOG.filter(
    (p) =>
      fuzzyMatch(trimmed, p.name) ||
      p.units.some((u) => u.barcode?.includes(trimmed)),
  );

  return delay(results);
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (t.includes(q)) return true; // substring ตรงไปตรงมาก่อน เร็วและแม่นสุด

  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}
