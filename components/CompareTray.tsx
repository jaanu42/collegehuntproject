


"use client";

import { useRouter } from "next/navigation";

export default function CompareTray({
  count,
}: {
  count: number;
}) {
  const router = useRouter();

  if (count < 2) return null;

  const handleCompare = () => {
    const stored = localStorage.getItem("collegehunt-shortlist");
    const ids = stored ? JSON.parse(stored) : [];

    router.push(`/compare?ids=${ids.join(",")}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 border bg-white rounded-full px-6 py-3 shadow-sm">
      <button
        onClick={handleCompare}
        className="text-sm font-medium text-blue-600"
      >
        Compare {count} Colleges
      </button>
    </div>
  );
}