// lib/session.ts
// ─────────────────────────────────────────────────────────────────────────
// ตัวยืนแทน GET /auth/session (ดู master-prompt ข้อ 2) จนกว่า Phase 1 (Auth)
// ฝั่ง backend จะต่อจริง — สิทธิ์มีแค่ 2 ระดับตาม schema: OWNER / STAFF
// ห้ามใช้ label อื่น (เช่น "CASHIER") เพราะไม่มีอยู่จริงใน enum Role
// ─────────────────────────────────────────────────────────────────────────

export type Role = "OWNER" | "STAFF";

export interface Session {
  userId: string;
  name: string;
  role: Role;
}

const MOCK_SESSION: Session = {
  userId: "mock-user-1",
  name: "แคชเชียร์ประจำร้าน",
  role: "STAFF",
};

/**
 * เมื่อ Phase 1 (Auth) ต่อ backend จริงแล้ว ให้เปลี่ยนฟังก์ชันนี้เป็น
 * fetch("/auth/session") จริง (ดู endpoint ที่ล็อกไว้ใน master-prompt ข้อ 2)
 * แล้ว component ที่เรียก useSession() ไม่ต้องแก้อะไรเลย
 */
export function useSession(): Session {
  // TODO: แทนที่ด้วย real fetch เมื่อ backend Auth เสร็จ:
  // const { data } = useSWR<Session>("/auth/session", fetcher);
  return MOCK_SESSION;
}
