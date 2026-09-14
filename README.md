# วิธีสร้าง Monorepo เอง (NestJS + Next.js + Prisma) ตั้งแต่ศูนย์

เอกสารนี้ต่างจาก `nestjs-monorepo-prisma-setup-guide.md` ตรงที่เน้น **"เข้าใจว่าทำไมแต่ละขั้นตอนต้องมี"** และ **"ทำซ้ำเองได้โดยไม่งง"** ถ้าติด error ระหว่างทาง ให้ไปเปิดเอกสารตัวนั้นดูตาราง checklist แทน

---

## ภาพรวมที่ต้องเข้าใจก่อนลงมือ (อ่านส่วนนี้ก่อนเสมอ)

ลองนึกภาพร้านอาหาร 2 สาขาที่ใช้ครัวกลางร่วมกัน:

```
Monorepo/                    ← ที่ดินผืนเดียว เก็บทุกอย่างไว้ด้วยกัน
  package.json                ← "โฉนดที่ดิน" บอกว่ามีอาคารอะไรบ้างในนี้
  docker-compose.yml           ← สั่งเปิดห้องเก็บวัตถุดิบ (database)
  packages/
    database/                  ← ครัวกลาง เก็บสูตรอาหาร (schema) ที่เดียว
  nest-backend/                 ← สาขา A รับออเดอร์ ปรุงอาหารจริง
  next-frontend/                ← สาขา B หน้าร้านที่ลูกค้าเห็น
```

**กลไกที่ทำให้ทั้งหมดนี้ทำงานร่วมกันได้ มี 3 ชั้น:**

1. **npm workspaces** — ทำให้ npm รู้ว่าโฟลเดอร์ไหนเป็นพวกเดียวกัน แล้วสร้าง **symlink** (ทางลัดของระบบไฟล์ คล้าย shortcut) เชื่อม `nest-backend` และ `next-frontend` ให้ชี้ไปอ่านไฟล์เดียวกันใน `packages/database`
2. **Prisma** — เป็นตัวแปล "สูตรอาหาร" (schema.prisma) ให้กลายเป็นโค้ด TypeScript ที่มี type ถูกต้อง (`Task`, `User` ฯลฯ) ใช้ได้ทั้งสองฝั่งเพราะอ่านไฟล์ต้นฉบับเดียวกัน
3. **Docker** — จำลอง PostgreSQL ไว้ในกล่องแยก ไม่ต้องติดตั้งลงเครื่องจริง

**ผลลัพธ์:** ทั้ง `nest-backend` และ `next-frontend` เขียน `task.title` แล้ว TypeScript รู้ว่าเป็น `string` เหมือนกันเป๊ะ เพราะอ่าน type จากที่เดียวกันจริงๆ ไม่ใช่ copy คนละชุด — นี่คือเหตุผลที่ทำ monorepo แบบนี้ตั้งแต่แรก

**ข้อควรรู้:** การเชื่อมกันแบบนี้เกิดขึ้นแค่ตอน **dev** เท่านั้น ตอน deploy จริงแต่ละแอปแยกกันรันเป็นอิสระ (ดูรายละเอียดในเอกสารหลักถ้าอยากทวน)

---

## Checklist ก่อนเริ่ม (เครื่องมือที่ต้องมี)

- [ ] Node.js + npm (`node -v`, `npm -v`)
- [ ] Docker Desktop ติดตั้งแล้ว **และเปิดโปรแกรมค้างไว้**
- [ ] Git
- [ ] NestJS CLI: `npm i -g @nestjs/cli`

ถ้า `npm` ใน PowerShell error เรื่อง "running scripts is disabled" ให้รัน (ครั้งเดียวพอ ถาวร):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## ขั้นตอนสร้างตั้งแต่ศูนย์ (ทำตามลำดับนี้ ห้ามข้าม)

### 1. สร้างโฟลเดอร์แม่ + ตั้งค่า workspace

```powershell
mkdir Monorepo
cd Monorepo
npm init -y
```

แก้ `package.json` ที่ root ให้มี `workspaces`:
```json
{
  "name": "monorepo",
  "private": true,
  "workspaces": ["nest-backend", "next-frontend", "packages/*"]
}
```

**⚠️ กฎเหล็ก:** `package.json` ตัวนี้ต้องอยู่ที่โฟลเดอร์แม่สุดโดยตรงเท่านั้น ห้ามซ้อนอยู่ในโฟลเดอร์ลูกอีกที (เช่น `Monorepo/root-project/package.json`) เพราะ `workspaces` มองเห็นแค่โฟลเดอร์ที่อยู่ *ใต้* ตำแหน่งของมัน

### 2. สร้าง Docker + PostgreSQL

สร้าง `docker-compose.yml` ที่ root:
```yaml
services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

รัน:
```powershell
docker compose up -d
docker ps   # เช็คว่ารันสำเร็จ
```

**จำไว้:** ชื่อ user/password/db ในไฟล์นี้ต้อง**ตรงกันเป๊ะ**กับ `DATABASE_URL` ที่จะตั้งในทุก `.env` ต่อจากนี้

### 3. สร้างครัวกลาง (packages/database)

```powershell
mkdir packages\database
cd packages\database
npm init -y
npm install prisma --save-dev
npm install @prisma/client @prisma/adapter-pg pg dotenv
npm install typescript @types/node --save-dev
npx prisma init
```

**แก้ `package.json` ของ `packages/database` — ตั้งชื่อแบบ scoped (สำคัญมาก):**
```json
{
  "name": "@monorepo/database",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": { "build": "tsc" }
}
```
**ทำไมต้องมี `@`:** ชื่อธรรมดาอย่าง `database` ชนกับแพ็กเกจสาธารณะบน npm ได้ ทำให้ npm ดึงของคนอื่นมาแทนโดยไม่รู้ตัว ต้องตั้งชื่อแบบ scoped (`@ชื่อของคุณ/database`) เสมอ

**แก้ `schema.prisma`:**
```prisma
generator client {
  provider     = "prisma-client"
  output       = "../generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String
  done      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```
**⚠️ กฎเหล็ก:** `moduleFormat = "cjs"` ต้องมีเสมอ ไม่งั้น NestJS (CommonJS) กับ Prisma (ESM by default) จะชนกัน error `Cannot use 'import.meta' outside a module`

**สร้าง `.env`:**
```
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb"
```

**สร้าง `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "moduleResolution": "node10",
    "declaration": true,
    "outDir": "./dist",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["index.ts", "generated/**/*"]
}
```
(ถ้า TypeScript เวอร์ชันใหม่ error ว่า `node10` ถูกลบ ให้เปลี่ยนเป็น `"module": "NodeNext", "moduleResolution": "nodenext"` แทนทั้งคู่พร้อมกัน)

**สร้าง `index.ts` (ประตูหน้าบ้าน):**
```ts
export * from "./generated/prisma/client";
export { PrismaClient } from "./generated/prisma/client";
```

**Migrate + Generate + Build:**
```powershell
npx prisma migrate dev --name init
npx prisma generate
npm run build
```

### 4. สร้าง Backend (nest-backend)

```powershell
cd ..\..
nest new nest-backend
```
**⚠️ ตอนถามเลือก module system → เลือก CJS (CommonJS) เสมอ** ไม่ใช่ ESM (แม้จะเป็น default) เพราะเอกสารทางการของ NestJS+Prisma ยังรองรับ CJS เต็มที่กว่า

```powershell
cd nest-backend
nest g resource tasks   # เลือก REST API + Y (CRUD)
npm install @prisma/adapter-pg pg @nestjs/config class-validator class-transformer
```

**เพิ่ม dependency ในเครือ workspace:** เปิด `nest-backend/package.json` เพิ่ม:
```json
"@monorepo/database": "*"
```
แล้วกลับไป root รัน `npm install` เพื่อสร้าง symlink:
```powershell
cd ..
npm install
```

**สร้าง `src/prisma/prisma.service.ts`:**
```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@monorepo/database';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });
  }
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

**สร้าง `src/prisma/prisma.module.ts` (Global เพื่อไม่ต้อง import ซ้ำทุกโมดูล):**
```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**แก้ `src/app.module.ts`:**
```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
**⚠️ อย่าลืม `ConfigModule.forRoot()`** ไม่งั้น `.env` จะไม่ถูกอ่าน ทำให้ `process.env.DATABASE_URL` เป็น `undefined`

**แก้ `src/main.ts` เพิ่ม ValidationPipe:**
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**สร้าง `.env`:**
```
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb"
```

**เขียน `tasks.service.ts` ให้เรียก Prisma จริง:**
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly db: PrismaService) {}

  create(dto: CreateTaskDto) {
    return this.db.task.create({ data: dto });
  }
  findAll() {
    return this.db.task.findMany();
  }
  async findOne(id: number) {
    const task = await this.db.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
  async update(id: number, dto: UpdateTaskDto) {
    await this.findOne(id);
    return this.db.task.update({ where: { id }, data: dto });
  }
  async remove(id: number) {
    await this.findOne(id);
    return this.db.task.delete({ where: { id } });
  }
}
```

**เขียน `dto/create-task.dto.ts` ให้มี validation:**
```ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsBoolean()
  @IsOptional()
  done?: boolean;
}
```

**ทดสอบ:**
```powershell
npm run start:dev
```
ต้องเห็น `PrismaModule dependencies initialized` และ `Nest application successfully started`

### 5. สร้าง Frontend (next-frontend)

```powershell
cd ..
npx create-next-app@latest next-frontend
npm install @prisma/adapter-pg pg -w next-frontend
```

เพิ่มใน `next-frontend/package.json`:
```json
"@monorepo/database": "*"
```
รัน `npm install` ที่ root อีกครั้ง

**สร้าง `.env`:**
```
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb"
```

**สร้าง `lib/prisma.ts` (ต้องใช้ globalThis singleton เพราะ Next.js hot-reload บ่อย):**
```ts
import { PrismaClient } from "@monorepo/database";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;
const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton | undefined };
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const db = prisma;
```

---

## ทำไม nest-backend ใช้ PrismaService (DI) แต่ next-frontend ใช้ globalThis

| | nest-backend | next-frontend |
|---|---|---|
| วิธีจัดการ instance | Dependency Injection (NestJS สร้างให้อัตโนมัติ, Singleton scope) | `globalThis` เขียนเอง |
| เหตุผล | NestJS มีระบบ DI ในตัวอยู่แล้ว | Next.js hot-reload บ่อย ต้องกันสร้าง PrismaClient ซ้ำเอง |

---

## Checklist หลัง Clone/Degit Repo มาใหม่ (สำคัญมาก มักลืม)

ไฟล์เหล่านี้ **ไม่ติดมาด้วย** ตอน clone (เพราะอยู่ใน `.gitignore`) ต้องสร้าง/รันใหม่เองทุกครั้ง:

```powershell
# 1. ติดตั้ง dependency ทั้งหมด
npm install

# 2. เปิด Docker + สร้าง .env ใหม่ 3 จุด
docker compose up -d
# สร้าง packages/database/.env, nest-backend/.env, next-frontend/.env

# 3. Generate + Build ครัวกลาง (โฟลเดอร์ generated/ ไม่ติดมาด้วย)
cd packages/database
npx prisma generate
npm run build

# 4. รันแต่ละฝั่ง
cd ../../nest-backend && npm run start:dev
cd ../next-frontend && npm run dev
```

---

## เก็บไว้เตือนตัวเอง: กฎ 5 ข้อที่ห้ามลืม

1. ชื่อ package ใน `packages/database` ต้องเป็น scoped name (`@ชื่อ/database`) ห้ามใช้ชื่อเปล่าๆ
2. `moduleFormat = "cjs"` ต้องมีใน `schema.prisma` เสมอ
3. `nest new` ต้องเลือก **CJS** ไม่ใช่ ESM
4. `ConfigModule.forRoot()` ต้องอยู่ใน `app.module.ts` ไม่งั้น `.env` จะไม่ถูกอ่าน
5. หลัง clone repo ใหม่ ต้องรัน `npm install` → สร้าง `.env` 3 จุด → `prisma generate` + `build` เสมอ ก่อนจะรันได้
