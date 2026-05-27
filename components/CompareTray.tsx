"use client";

import { useRouter } from "next/navigation";
import { GitCompareArrows } from "lucide-react";

export default function CompareTray({ count }: { count: number }) {
  const router = useRouter();

  if (count < 2) return null;

  const handleCompare = () => {
    const stored = localStorage.getItem("collegehunt-shortlist");
    const ids = stored ? JSON.parse(stored) : [];
    router.push(`/compare?ids=${ids.join(",")}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-4 rounded-full bg-[#222222] px-6 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[#FF385C]"
            />
          ))}
        </div>

        <span className="text-white text-sm font-medium">
          {count} college{count !== 1 ? "s" : ""} shortlisted
        </span>

        <div className="w-px h-4 bg-white/20" />

        <button
          onClick={handleCompare}
          className="flex items-center gap-2 rounded-full bg-[#FF385C] hover:bg-[#E31C5F] px-5 py-2 text-sm font-semibold text-white transition-colors"
        >
          <GitCompareArrows className="h-4 w-4" />
          Compare Now
        </button>
      </div>
    </div>
  );
}