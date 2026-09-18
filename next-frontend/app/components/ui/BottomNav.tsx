"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentType } from "react";
import {
  HandCoins,
  ShoppingCart,
  House,
  Handshake,
  TrendingUp,
  LucideProps,
} from "lucide-react";

// 1. กำหนด Type ชัดเจน
interface MenuItem {
  name: string;
  icon: ComponentType<LucideProps>;
  path: string;
}

// 2. แยก Config ไว้ด้านนอก เพื่อป้องกัน Re-creation ทุกครั้งที่ Re-render
const MENU_ITEMS: MenuItem[] = [
  { name: "ขาย", icon: HandCoins, path: "/pos" },
  { name: "สินค้า", icon: ShoppingCart, path: "/products" },
  { name: "สต็อก", icon: House, path: "/stock" },
  { name: "ฝากขาย", icon: Handshake, path: "/consignment" },
  { name: "สรุป", icon: TrendingUp, path: "/summary" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-gray-200 bg-white shadow-lg">
      <ul className="flex h-full items-center justify-around">
        {MENU_ITEMS.map(({ name, icon: Icon, path }) => {
          const isActive = pathname === path;
          return (
            <li key={path} className="flex-1">
              <Link
                href={path}
                className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
                  isActive
                    ? "text-emerald-600 font-medium"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
