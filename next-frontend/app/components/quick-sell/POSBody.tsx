// app/components/quick-sell/POSBody.tsx
"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/app/src/store/useCartStore";
import { getQuickSellProducts } from "@/lib/api/products";
import { Plus, Minus, Trash2, ChevronDown } from "lucide-react";
import { Product } from "@/app/types/product";

// จำนวนปุ่มขายด่วนที่โชว์ตอนตะกร้าว่าง vs ตอนมีของแล้ว
// [LOCKED] ตะกร้ามีของ → ยุบเหลือ 2 แถว (6 ชิ้น) เพื่อให้ตะกร้าได้พื้นที่
const QUICK_SELL_COUNT_EXPANDED = 9;
const QUICK_SELL_COUNT_COLLAPSED = 6;

export function POSBody() {
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    switchUnit,
    lastAddedId,
    clearLastAdded,
  } = useCartStore();

  const [quickProducts, setQuickProducts] = useState<Product[]>([]);
  const [isLoadingQuick, setIsLoadingQuick] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getQuickSellProducts()
      .then((products) => {
        if (!cancelled) setQuickProducts(products);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingQuick(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // เคลียร์ highlight ของแถวที่เพิ่งเพิ่ม หลัง animation จบ (400ms ตามสเปก)
  useEffect(() => {
    if (!lastAddedId) return;
    const timer = setTimeout(() => clearLastAdded(), 400);
    return () => clearTimeout(timer);
  }, [lastAddedId, clearLastAdded]);

  const visibleQuickProducts = quickProducts.slice(
    0,
    cart.length > 0 ? QUICK_SELL_COUNT_COLLAPSED : QUICK_SELL_COUNT_EXPANDED,
  );

  return (
    <div className="mx-auto max-w-lg px-3 py-2 pb-28 pt-3">
      {/* 1. ปุ่มขายด่วน */}
      <div className="rounded-2xl border-amber-900/10 bg-[#f8f5ee] p-3 shadow-2xs mb-3">
        <div className="flex items-center justify-between pb-2 text-xs font-semibold text-amber-900/70">
          <span>ขายด่วน (แตะเพิ่มทันที)</span>
          <button className="flex items-center gap-0.5 font-bold text-emerald-700 hover:underline">
            ดูเพิ่ม <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoadingQuick ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-amber-900/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {visibleQuickProducts.map((prod) => (
              <button
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="flex h-20 flex-col justify-between rounded-2xl border border-amber-900/15 bg-[#fdfbf7] p-2.5 text-left transition-all hover:border-amber-500 hover:bg-amber-50 active:scale-95 shadow-2xs"
              >
                <span className="line-clamp-1 text-xs font-bold text-slate-800">
                  {prod.name}
                </span>
                <span className="text-sm font-black text-amber-900">
                  ฿{prod.units[0].price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. รายการสินค้าที่เลือกไว้แล้วในตะกร้า */}
      <div className="rounded-2xl border border-amber-900/10 bg-[#f8f5ee] p-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-900/70">
              รายการสินค้าในตะกร้า
            </span>
            <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-xs font-bold text-amber-900">
              {cart.length}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              ล้างตะกร้า
            </button>
          )}
        </div>

        <div className="divide-y divide-amber-900/10">
          {cart.length === 0 ? (
            // ข้อความตรงตาม spec S2 (empty state) เป๊ะๆ
            <div className="py-8 text-left text-[15px] font-medium text-slate-400">
              แตะสินค้าขายด่วน หรือค้นหาเพื่อเริ่มขาย
            </div>
          ) : (
            cart.map((item) => {
              const isLowStockForQty = item.stock < item.quantity;
              const isSpecialPrice = item.price !== item.originalPrice;

              return (
                <div
                  key={item.id}
                  className={`py-2.5 transition-colors duration-[400ms] ${
                    lastAddedId === item.id ? "bg-[#e4efe8]" : "bg-transparent"
                  }`}
                >
                  {/* แถวที่ 1: ชื่อสินค้า + ปุ่มลบ */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {/* [LOCKED] chip หน่วยขาย ต้องกดสลับได้ ไม่ใช่ label เฉยๆ */}
                        {item.availableUnits.length > 1 ? (
                          <select
                            value={item.productUnitId}
                            onChange={(e) =>
                              switchUnit(item.id, e.target.value)
                            }
                            className="rounded-md bg-stone-200/60 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium"
                          >
                            {item.availableUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.unitName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="rounded-md bg-stone-200/60 px-1.5 py-0.5 text-[10px] text-slate-600">
                            {item.unit}
                          </span>
                        )}

                        {isSpecialPrice && (
                          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            ราคาพิเศษ
                          </span>
                        )}

                        {/* [LOCKED] เตือนแบบไม่ block เฉพาะตอนสต็อกไม่พอจริงๆ เท่านั้น */}
                        {isLowStockForQty && (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                            เหลือ {item.stock} {item.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="shrink-0 p-1 text-red-400 hover:text-red-600 transition-all active:scale-90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* แถวที่ 2: ราคารวม + ปุ่มปรับจำนวน */}
                  <div className="mt-2 flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-emerald-700">
                        ฿{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (@฿{item.price.toFixed(2)})
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center rounded-xl border border-slate-300 bg-[#ebe5d8]/60 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-slate-700 hover:bg-white rounded-lg transition-all active:scale-90"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-slate-700 hover:bg-white rounded-lg transition-all active:scale-90"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
