// lib/api/client.ts
// ─────────────────────────────────────────────────────────────────────────
// จุดเดียวที่จะสลับจาก mock → NestJS จริง อยู่ตรงนี้ที่เดียว
// วันที่ backend Phase 2+ เสร็จ: เปลี่ยน USE_MOCK เป็น false + ตั้งค่า
// NEXT_PUBLIC_API_BASE_URL ใน .env.local แล้ว products.ts / sales.ts
// จะเริ่มยิง apiFetch() แทน mock ทันที โดยไม่ต้องแก้ component ไหนเลย
// ─────────────────────────────────────────────────────────────────────────

export const USE_MOCK_API = true; // TODO: เปลี่ยนเป็น false เมื่อ backend NestJS พร้อมใช้งานจริง

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  if (USE_MOCK_API) {
    // ถ้าเห็น error นี้ แปลว่ามีที่ไหนเรียก apiFetch() ตรงๆ ทั้งที่ยังไม่ได้ปิด mock
    // ให้ไปเรียกฟังก์ชัน mock ใน lib/api/products.ts หรือ lib/api/sales.ts แทน
    throw new Error(
      `apiFetch("${path}") ถูกเรียกขณะที่ USE_MOCK_API = true — ตรวจสอบว่ากำลังเรียกฟังก์ชัน mock อยู่หรือเปล่า`,
    );
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    // ส่ง httpOnly cookie ไปด้วยเสมอ ตาม auth pattern ที่ล็อกไว้ใน master prompt
    // (เบอร์โทร+PIN → JWT ใน httpOnly cookie, ไม่ใช่ localStorage)
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status} ${path}: ${text}`);
  }

  // 204 No Content กรณี logout ฯลฯ
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
