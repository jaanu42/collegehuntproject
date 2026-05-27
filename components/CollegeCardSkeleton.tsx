"use client";

export function CollegeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#DDDDDD] bg-white p-6 overflow-hidden">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}
        <div className="min-w-0 flex-1">
          {/* Badges */}
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-24 rounded-full" />
          </div>

          {/* Name */}
          <div className="skeleton mt-3 h-6 w-3/4 rounded-lg" />

          {/* Meta */}
          <div className="mt-2 flex gap-4">
            <div className="skeleton h-4 w-28 rounded-lg" />
            <div className="skeleton h-4 w-24 rounded-lg" />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 shrink-0">
          <div>
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton mt-2 h-7 w-28 rounded-lg" />
          </div>
          <div className="skeleton h-11 w-28 rounded-xl" />
        </div>

      </div>
    </div>
  );
}

export function CollegeListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CollegeCardSkeleton key={i} />
      ))}
    </div>
  );
}