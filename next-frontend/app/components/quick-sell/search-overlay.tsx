"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X, ScanBarcode } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCartStore } from "@/app/src/store/useCartStore";
import { searchProducts } from "@/lib/api/products";
import { Product } from "@/app/types/product";

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const { addToCart } = useCartStore();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  // React handles the pending state instead of synchronously
  // calling setState() inside useEffect.
  const [isSearching, startSearchTransition] = useTransition();

  const trimmedQuery = query.trim();

  // Query ว่าง = ไม่มีผลลัพธ์เสมอ
  // ไม่ต้อง setResults([]) ผ่าน effect
  const visibleResults = trimmedQuery ? results : [];

  const showSearching = trimmedQuery ? isSearching : false;

  useEffect(() => {
    if (!trimmedQuery) {
      return;
    }

    let cancelled = false;

    startSearchTransition(async () => {
      const products = await searchProducts(trimmedQuery);

      if (!cancelled) {
        setResults(products);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [trimmedQuery]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      clearSearch();
    }

    onOpenChange(nextOpen);
  };

  const handleSelect = (product: Product) => {
    // [LOCKED]
    // แตะแถว = เพิ่มลงตะกร้า + ปิด overlay + เคลียร์คำค้น
    addToCart(product);

    clearSearch();
    onOpenChange(false);
  };

  const handleAddNewProduct = () => {
    handleOpenChange(false);

    router.push(`/products/new?name=${encodeURIComponent(query)}`);
  };

  const handleScanClick = () => {
    // TODO:
    // สแกนเจอ → เพิ่มตะกร้าทันที + haptic + toast
    // สแกนไม่เจอ → เปิด S3 พร้อม barcode
    alert("โหมดสแกนบาร์โค้ด — ยังไม่ implement (TODO)");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 flex h-full max-h-[100dvh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col justify-between border-none bg-[#f8f5ee] p-0 text-amber-950 shadow-2xl sm:rounded-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">ค้นหาสินค้า</DialogTitle>

        <div className="bg-[#f8f5ee] px-4 pb-2 pt-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenChange(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-black/5 active:scale-95"
            >
              <ArrowLeft className="h-6 w-6 stroke-[2.25]" />
            </button>

            <div className="relative flex flex-1 items-center">
              <Search className="absolute left-3.5 h-5 w-5 text-amber-900/40" />

              <input
                type="text"
                value={query}
                onChange={(e) => {
                  const value = e.target.value;

                  setQuery(value);

                  // เมื่อ user ล้างช่องค้นหา
                  // ล้างผลลัพธ์ทันทีจาก event แทน effect
                  if (!value.trim()) {
                    setResults([]);
                  }
                }}
                placeholder="ค้นหาสินค้า หรือ รหัสบาร์โค้ด..."
                autoFocus
                className="h-12 w-full rounded-2xl border border-amber-900/10 bg-[#ebe5d8] pl-11 pr-20 text-base font-medium text-amber-950 placeholder:text-amber-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
              />

              <div className="absolute right-3 flex items-center gap-2">
                {query && (
                  <button
                    onClick={clearSearch}
                    className="p-1 text-amber-900/40 hover:text-amber-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                <span className="h-4 w-[1px] bg-amber-900/20" />

                <button
                  onClick={handleScanClick}
                  className="text-amber-900/60 hover:text-emerald-700"
                >
                  <ScanBarcode className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pb-2 text-xs font-semibold text-amber-900/60">
            <span>
              {trimmedQuery
                ? `พบสินค้าที่ตรงกัน ${visibleResults.length} รายการ`
                : "พิมพ์เพื่อค้นหาสินค้า"}
            </span>

            <span className="font-bold text-emerald-700">
              แตะแถวเพื่อคิดเงิน
            </span>
          </div>
        </div>

        <div className="flex-1 divide-y divide-gray-100 overflow-y-auto bg-white">
          {showSearching && (
            <div className="p-6 text-center text-sm text-slate-400">
              กำลังค้นหา...
            </div>
          )}

          {!showSearching &&
            visibleResults.map((product) => {
              const primaryUnit = product.units[0];

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-amber-50/50 active:bg-amber-100/50"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                        product.isLowStock ? "bg-amber-500" : "bg-emerald-600"
                      }`}
                    />

                    <div>
                      <h3 className="text-base font-bold leading-snug text-slate-900">
                        {product.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        {product.isLowStock ? (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800">
                            เหลือ {product.stock} {primaryUnit.unitName}{" "}
                            (ใกล้หมด)
                          </span>
                        ) : (
                          <span>
                            คงเหลือ {product.stock} {primaryUnit.unitName}
                          </span>
                        )}

                        {primaryUnit.barcode && (
                          <>
                            <span>•</span>
                            <span>{primaryUnit.barcode}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-base font-bold text-slate-900">
                    ฿{primaryUnit.price.toFixed(2)}
                  </div>
                </div>
              );
            })}

          {!showSearching && trimmedQuery && visibleResults.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">
                ไม่พบ &quot;{query}&quot;
              </p>

              <button
                onClick={handleAddNewProduct}
                className="mt-3 rounded-xl border border-emerald-600 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
              >
                เพิ่มสินค้าใหม่
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#f8f5ee] py-3 text-center text-xs font-medium text-amber-900/50">
          แตะ 1 ครั้งเพื่อหยิบใส่ตะกร้าและกลับสู่หน้าขายทันที
        </div>
      </DialogContent>
    </Dialog>
  );
}
