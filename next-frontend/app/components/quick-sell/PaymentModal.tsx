// app/components/quick-sell/PaymentModal.tsx
"use client";

import { useState } from "react";
import {
  Wallet,
  Coins,
  Landmark,
  Banknote,
  Shuffle,
  type LucideIcon,
} from "lucide-react";
import { useCartStore } from "@/app/src/store/useCartStore";
import { useUIStore } from "@/app/src/store/useUiStore";
import { createSale } from "@/lib/api/sales";

type PaymentMethod = "CASH" | "TRANSFER" | "MIXED";

function getChangeBreakdown(change: number) {
  if (change <= 0) return "";
  const denominations = [500, 100, 50, 20, 10, 5, 2, 1];

  let rem = change;
  const result: string[] = [];

  for (const value of denominations) {
    const count = Math.floor(rem / value);
    if (count > 0) {
      const label = value >= 20 ? "แบงก์" : "เหรียญ";
      result.push(`${label} ${value} × ${count}`);
      rem %= value;
    }
  }
  return result.join("  •  ");
}

export function PaymentModal() {
  const { isPaymentOpen, setIsPaymentOpen, getTotalPrice, cart, clearCart } =
    useCartStore();
  const showToast = useUIStore((s) => s.showToast);
  const totalPrice = getTotalPrice();

  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashInput, setCashInput] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferInput, setTransferInput] = useState<string>("");
  const [counts, setCounts] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const receivedTotal =
    method === "CASH"
      ? cashAmount
      : method === "TRANSFER"
        ? transferAmount
        : cashAmount + transferAmount;

  const changeAmount = Math.max(0, receivedTotal - totalPrice);
  const shortfall = Math.max(0, totalPrice - receivedTotal);
  const hasEnteredAmount = receivedTotal > 0;

  if (!isPaymentOpen) return null;

  const resetAmounts = () => {
    setCashAmount(0);
    setCashInput("");
    setTransferAmount(0);
    setTransferInput("");
    setCounts({});
  };

  const handleMethodChange = (next: PaymentMethod) => {
    setMethod(next);
    resetAmounts();
  };

  const handleQuickAddCash = (amount: number) => {
    const next = cashAmount + amount;
    setCashAmount(next);
    setCashInput(next.toFixed(2));
    setCounts((prev) => ({ ...prev, [amount]: (prev[amount] || 0) + 1 }));
  };

  const handleExactCash = () => {
    const exact = Math.max(0, totalPrice - transferAmount);
    setCashAmount(exact);
    setCashInput(exact.toFixed(2));
    setCounts({});
  };

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCashInput(val);
    const num = parseFloat(val);
    setCashAmount(isNaN(num) ? 0 : num);
    setCounts({});
  };

  const handleTransferInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    setTransferInput(val);
    const num = parseFloat(val);
    setTransferAmount(isNaN(num) ? 0 : num);
  };

  const handleClose = () => {
    setIsPaymentOpen(false);
    resetAmounts();
    setMethod("CASH");
  };

  const handleFinishSale = async () => {
    if (!hasEnteredAmount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createSale({
        items: cart.map((item) => ({
          productUnitId: item.productUnitId,
          qty: item.quantity,
          unitPrice: item.price,
        })),
        totalAmount: totalPrice,
        paymentMethod: method,
        // หมายเหตุการตัดสินใจ (ดูสเปก S2.2 หมายเหตุ ⚠):
        // ระบบนี้ "ไม่รองรับค้างชำระ" เป็นค่าเริ่มต้น — ปุ่มปิดการขายยังกดได้แม้
        // เงินที่รับไม่ครบยอด แล้วบันทึกยอดรับจริงตามที่กดไว้ ไม่สร้าง record หนี้ใดๆ
        // ถ้าจะเปลี่ยนเป็นรองรับค้างชำระ ต้องเพิ่มหน้ารายการค้างชำระใน S2.4 ด้วย
        cashAmount: method === "TRANSFER" ? 0 : cashAmount,
        transferAmount: method === "CASH" ? 0 : transferAmount,
      });

      showToast("บันทึกการขายแล้ว");
      clearCart();
      handleClose();
    } catch (err) {
      console.error(err);
      showToast("บันทึกการขายไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const methodTabs: { id: PaymentMethod; label: string; icon: LucideIcon }[] = [
    { id: "CASH", label: "เงินสด", icon: Banknote },
    { id: "TRANSFER", label: "โอน", icon: Landmark },
    { id: "MIXED", label: "ผสม", icon: Shuffle },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-[99] bg-black/50 transition-opacity animate-in fade-in-0"
        onClick={handleClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-[100] mx-auto flex max-h-[90vh] w-full sm:max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-[#f5f4ee] text-slate-800 shadow-2xl animate-in slide-in-from-bottom-full duration-200 font-sans">
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-[#d8d5c8]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
            <Wallet className="h-5 w-5 text-slate-700" />
            <span>รับเงิน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">ต้องชำระ</span>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              ฿{totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment method tabs — เงินสด / โอน / ผสม ตามที่ล็อกไว้ใน master-prompt */}
        <div className="mx-5 mt-1 grid grid-cols-3 gap-1.5 rounded-2xl bg-[#e9e7dc] p-1">
          {methodTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleMethodChange(id)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold transition-all ${
                method === id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {/* Card เงินทอน / ยังขาดอีก */}
          <div className="rounded-2xl bg-[#e9e7dc] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {shortfall > 0 && hasEnteredAmount ? "ยอดที่ยังขาด" : "เงินทอน"}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#1e6b45]">
                <span className="h-2 w-2 rounded-full bg-[#1e6b45] animate-pulse" />
                คำนวณอัตโนมัติ
              </span>
            </div>

            <div className="mt-1 flex items-baseline justify-between">
              {/* [LOCKED-adjacent] เงินไม่พอ → แทนที่ตัวเลขเงินทอนด้วย "ยังขาดอีก" สี brick */}
              {shortfall > 0 && hasEnteredAmount ? (
                <span className="text-3xl font-black text-red-700 tracking-tight">
                  ฿{shortfall.toFixed(2)}
                </span>
              ) : (
                <span className="text-3xl font-black text-[#1e6b45] tracking-tight">
                  ฿{changeAmount.toFixed(2)}
                </span>
              )}
              <div className="text-right">
                <span className="text-xs text-slate-400">รับมาแล้ว </span>
                <span className="text-sm font-bold text-slate-700">
                  ฿{receivedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {changeAmount > 0 && (
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-300/60 pt-2 text-xs font-medium text-slate-600">
                <Coins className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>แนะนำเงินทอน: </span>
                <span className="font-semibold text-slate-800">
                  {getChangeBreakdown(changeAmount)}
                </span>
              </div>
            )}
          </div>

          {/* เงินสด */}
          {(method === "CASH" || method === "MIXED") && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2.5">
                <span>
                  {method === "MIXED"
                    ? "ส่วนที่จ่ายเป็นเงินสด"
                    : "แตะเลือกหรือสะสมจำนวนเงินที่รับ"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCashAmount(0);
                    setCashInput("");
                    setCounts({});
                  }}
                  className="text-red-600 font-bold hover:opacity-80"
                >
                  ล้างยอด
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[20, 50, 100, 500, 1000].map((val) => {
                  const count = counts[val] || 0;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAddCash(val)}
                      className="flex flex-col items-center justify-center rounded-2xl bg-[#e9e7dc] py-3 transition-all active:scale-95 hover:bg-[#e1dfd3]"
                    >
                      <span className="text-lg font-black text-slate-900 tracking-tight">
                        ฿{val >= 1000 ? "1,000" : val}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {count > 0
                          ? `${count} ใบ (฿${val * count})`
                          : "กดเพิ่ม"}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleExactCash}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#e5a038] bg-[#f2e2c9]/40 py-3 transition-all active:scale-95 hover:bg-[#f2e2c9]"
                >
                  <span className="text-base font-bold text-[#b36b00]">
                    พอดี
                  </span>
                  <span className="text-[11px] font-bold text-[#b36b00]">
                    ฿{Math.max(0, totalPrice - transferAmount).toFixed(2)}
                  </span>
                </button>
              </div>

              <div className="mt-3 mb-2">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">
                  หรือระบุจำนวนเงินสดที่รับมา
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-bold text-slate-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    value={cashInput}
                    onChange={handleCashInputChange}
                    placeholder="0.00"
                    className="h-12 w-full rounded-2xl bg-[#e9e7dc] pl-9 pr-4 text-right text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e6b45]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* โอน */}
          {(method === "TRANSFER" || method === "MIXED") && (
            <div className="mt-4 mb-2">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">
                {method === "MIXED" ? "ส่วนที่โอนมา" : "จำนวนเงินที่โอนมา"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-bold text-slate-400">
                  ฿
                </span>
                <input
                  type="number"
                  value={transferInput}
                  onChange={handleTransferInputChange}
                  placeholder={
                    method === "TRANSFER" ? totalPrice.toFixed(2) : "0.00"
                  }
                  className="h-12 w-full rounded-2xl bg-[#e9e7dc] pl-9 pr-4 text-right text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e6b45]"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                * บันทึกเป็นคำบอกกล่าวเท่านั้น ไม่มีการเชื่อมต่อธนาคารจริง
              </p>
            </div>
          )}
        </div>

        {/* Footer Action Button */}
        <div className="p-4 pt-2 pb-6 bg-[#f5f4ee] border-t border-slate-200/60">
          <button
            type="button"
            disabled={!hasEnteredAmount || isSubmitting}
            onClick={handleFinishSale}
            className={`flex h-14 w-full items-center justify-center rounded-2xl font-bold text-base shadow-sm transition-all active:scale-[0.99] ${
              hasEnteredAmount && !isSubmitting
                ? "bg-[#1e6b45] text-white hover:bg-[#185737] cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-60"
            }`}
          >
            {isSubmitting
              ? "กำลังบันทึก..."
              : !hasEnteredAmount
                ? "กรุณาเลือกหรือระบุจำนวนเงินที่รับ"
                : shortfall > 0
                  ? `ปิดการขาย (รับ ฿${receivedTotal.toFixed(2)} • ขาด ฿${shortfall.toFixed(2)})`
                  : `ปิดการขาย (รับ ฿${receivedTotal.toFixed(2)} • ทอน ฿${changeAmount.toFixed(2)})`}
          </button>
        </div>
      </div>
    </>
  );
}
