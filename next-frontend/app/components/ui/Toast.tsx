// app/components/ui/Toast.tsx
"use client";

import { useUIStore } from "@/app/src/store/useUiStore";

export function Toast() {
  const { toastMessage } = useUIStore();

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg animate-in fade-in-0 slide-in-from-bottom-2"
    >
      {toastMessage}
    </div>
  );
}
