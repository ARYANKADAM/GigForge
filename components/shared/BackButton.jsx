"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Simple back arrow button that navigates to the previous page in history.
// It can be placed in headers or individual pages wherever a "go back" action is
// desired. On first load or if there's no history, `router.back()` will simply
// do nothing (the browser typically stays on the same page).
export default function BackButton({ className = "" }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`p-2 rounded-full hover:bg-slate-100 transition ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 text-slate-600" />
    </button>
  );
}
