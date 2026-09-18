"use client";

import { useEffect, useState } from "react";
import { api } from "./src/lib/axios";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [phone, setPhone] = useState<string>("0891234567");
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (pin.length === 6) {
      handleLogin(pin);
    }
  }, [pin]);

  const handleLogin = async (pinToSubmit: string) => {
    if (loading || pinToSubmit.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        phone,
        pin: pinToSubmit,
      });

      // 3. ย้ายไปหน้า /pos เมื่อ Login ผ่าน
      router.push("/pos");
    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(
        Array.isArray(message) ? message[0] : message || "เข้าสู่ระบบไม่สำเร็จ",
      );
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg overflow-hidden rounded-3xl bg-[#F5F4EE] text-gray-800 shadow-2xl border border-gray-200 transition-all">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mb-2">
            <label className="block text-xs text-gray-500 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-center font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <p className="mt-3 text-sm text-gray-600">
            {loading ? "กำลังตรวจสอบ..." : "ป้อนรหัส PIN 6 หลักเพื่อเข้าใช้งาน"}
          </p>

          <div className="mt-4 flex justify-center gap-3">
            {[...Array(6)].map((_, index) => (
              <span
                key={index}
                className={`h-3.5 w-3.5 rounded-full border transition-all duration-150 ${
                  index < pin.length
                    ? "border-black bg-black"
                    : "border-gray-400 bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="px-5 pb-6">
            <p className="text-center text-sm text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="px-5 pb-6">
            <p className="text-center text-sm text-green-500">{success}</p>
          </div>
        )}

        <div className="px-5 pb-6">
          <div className="grid grid-cols-3 gap-2.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="flex h-14 items-center justify-center rounded-lg border border-gray-300 bg-[#FAF8F3] text-xl font-medium text-gray-800 shadow-sm transition active:scale-95 active:bg-gray-200"
              >
                {num}
              </button>
            ))}

            <div />

            <button
              onClick={() => handleKeyPress("0")}
              className="flex h-14 items-center justify-center rounded-lg border border-gray-300 bg-[#FAF8F3] text-xl font-medium text-gray-800 shadow-sm transition active:scale-95 active:bg-gray-200"
            >
              0
            </button>

            <button
              onClick={handleDelete}
              className="flex h-14 items-center justify-center rounded-lg border border-gray-300 bg-[#FAF8F3] text-gray-700 shadow-sm transition active:scale-95 active:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9.75 14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.796-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.299 0-.586-.119-.796-.33Z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-[#EFECE6] py-2.5 text-center text-xs text-gray-500">
          Grocery POS v1.2.0 • ระบบเครื่องจุดขายร้านโชห่วย
        </div>
      </div>
    </div>
  );
}
