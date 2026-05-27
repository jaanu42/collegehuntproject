"use client";

export function CollegeCardSkeleton() {
  return (
    <div className="rounded-3xl border border-neutral-200 p-6 animate-pulse">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}
        <div className="min-w-0 flex-1">
          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-neutral-100" />
            <div className="h-5 w-20 rounded-full bg-neutral-100" />
            <div className="h-5 w-24 rounded-full bg-neutral-100" />
          </div>

          {/* Name */}
          <div className="mt-3 h-6 w-64 rounded-lg bg-neutral-100" />

          {/* Meta */}
          <div className="mt-2 flex gap-4">
            <div className="h-4 w-28 rounded-lg bg-neutral-100" />
            <div className="h-4 w-24 rounded-lg bg-neutral-100" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6 shrink-0">
          <div>
            <div className="h-3 w-24 rounded bg-neutral-100" />
            <div className="mt-2 h-7 w-28 rounded-lg bg-neutral-100" />
          </div>
          <div className="h-10 w-28 rounded-2xl bg-neutral-100" />
        </div>

      </div>
    </div>
  );
}

export function CollegeListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CollegeCardSkeleton key={i} />
      ))}
    </div>
  );
}