import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. เช็คก่อนว่ามี store อยู่แล้วหรือยัง (idempotent — รันซ้ำไม่สร้างซ้ำ)
  let store = await prisma.store.findFirst();

  if (store) {
    console.log("Store already exists, skip creating:", store.name);
  } else {
    // จุดที่ขาดไปตอนแรก: ต้อง create() แล้วเก็บผลลัพธ์ทับตัวแปร store เดิม
    // เพราะข้างล่างต้องใช้ store.id ไม่ว่าจะมาจาก findFirst() หรือ create() ก็ตาม
    store = await prisma.store.create({
      data: {
        name: process.env.SEED_STORE_NAME || "ร้านค้าของชำ",
      },
    });
    console.log("Created new store:", store.name);
  }

  // 2. hash PIN ด้วย argon2 (ตกลงกันไว้ว่าใช้แทน bcrypt)
  const pinHash = await argon2.hash(process.env.SEED_OWNER_PIN!);

  // 3. upsert User ด้วย composite unique key [storeId, phone]
  // Prisma ตั้งชื่อ field ให้อัตโนมัติเป็น "storeId_phone" (เอาชื่อ field ใน
  // @@unique([...]) มาต่อกันด้วย underscore ตามลำดับที่ประกาศไว้ใน schema)
  const owner = await prisma.user.upsert({
    where: {
      phone: process.env.SEED_OWNER_PHONE!,
    },
    update: {
      // ถ้ามี user นี้อยู่แล้ว (รัน seed ซ้ำ) อัปเดต hash ใหม่ทุกครั้ง
      // เผื่อกรณีเปลี่ยน SEED_OWNER_PIN ใน .env แล้วรัน seed ใหม่
      passwordHash: pinHash,
    },
    create: {
      storeId: store.id,
      name: process.env.SEED_OWNER_NAME || "เจ้าของร้าน",
      phone: process.env.SEED_OWNER_PHONE!,
      passwordHash: pinHash,
      role: "OWNER",
    },
  });

  console.log("Owner user ready:", owner.phone, owner.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
