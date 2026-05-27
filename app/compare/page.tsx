"use client";
import { Suspense } from "react";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { colleges } from "@/data/colleges";

type Weights = {
  placement: number;
  fees: number;
  location: number;
};

function formatFees(val: number) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${(val / 1000).toFixed(0)}K`;
}

function ComparePageInner() {
  const searchParams = useSearchParams();

  const [ids, setIds] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [diffOnly, setDiffOnly] = useState(false);

  const [rawWeights, setRawWeights] = useState<Weights>({
    placement: 60,
    fees: 30,
    location: 10,
  });

  useEffect(() => {
    const urlIds = searchParams.get("ids");
    if (urlIds) {
      setIds(urlIds.split(",").map(Number));
      return;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("collegehunt-shortlist");
      if (stored) setIds(JSON.parse(stored));
    }
  }, [searchParams]);

  const weights = useMemo(() => {
    const total = rawWeights.placement + rawWeights.fees + rawWeights.location;
    if (total === 0) return { placement: 0.34, fees: 0.33, location: 0.33 };
    return {
      placement: rawWeights.placement / total,
      fees: rawWeights.fees / total,
      location: rawWeights.location / total,
    };
  }, [rawWeights]);

  const selected = useMemo(
    () => colleges.filter((c) => ids.includes(c.id)),
    [ids]
  );

  const scored = useMemo(() => {
    return selected
      .map((c) => {
        const placementScore = c.placement * 10;
        const feesScore = (1800000 - c.fees) / 18000;
        const locationScore = c.city === "New Delhi" ? 10 : 5;
        const score =
          placementScore * weights.placement +
          feesScore * weights.fees +
          locationScore * weights.location;
        return { ...c, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [selected, weights]);

  const best = scored[0];

  const isDiff = (key: keyof (typeof scored)[0]) => {
    const vals = scored.map((c) => c[key]);
    return new Set(vals).size > 1;
  };

  const showRow = (key: keyof (typeof scored)[0]) =>
    !diffOnly || isDiff(key);

  const winnerIdx = (key: "placement" | "fees" | "nirf") => {
    if (key === "fees")
      return scored.reduce((mi, c, i, a) => (c.fees < a[mi].fees ? i : mi), 0);
    if (key === "nirf")
      return scored.reduce((mi, c, i, a) => (c.nirf < a[mi].nirf ? i : mi), 0);
    return scored.reduce(
      (mi, c, i, a) => (c.placement > a[mi].placement ? i : mi),
      0
    );
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight")
        setActiveIndex((p) => Math.min(p + 1, scored.length - 1));
      if (e.key === "ArrowLeft")
        setActiveIndex((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scored.length]);

  const cols = scored.length + 1;
  const gridClass =
    cols === 2
      ? "grid grid-cols-2"
      : cols === 3
      ? "grid grid-cols-3"
      : "grid grid-cols-4";

  /* ── EMPTY STATE ── */
  if (selected.length === 0) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#717171] text-base">No colleges selected.</p>
          <a href="/" className="mt-4 inline-block text-sm text-[#FF385C] hover:underline">
            Go back and shortlist colleges
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#222222]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/" className="text-sm text-[#FF385C] hover:underline">
              ← Back to search
            </a>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#222222]">
              Compare Colleges
            </h1>
            <p className="text-sm text-[#717171] mt-1">
              Decision-focused comparison, not raw data.
            </p>
          </div>

          <label className="text-sm text-[#717171] flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={diffOnly}
              onChange={(e) => setDiffOnly(e.target.checked)}
              className="accent-[#FF385C]"
            />
            Highlight differences only
          </label>
        </div>

        {/* WEIGHT SLIDERS */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3 rounded-2xl border border-[#DDDDDD] bg-white p-6 shadow-sm">
          {(["placement", "fees", "location"] as const).map((key) => (
            <div key={key}>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium capitalize text-[#222222]">
                  {key}
                </p>
                <p className="text-sm text-[#FF385C] font-semibold">
                  {Math.round(weights[key] * 100)}%
                </p>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={rawWeights[key]}
                onChange={(e) =>
                  setRawWeights((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value),
                  }))
                }
                className="w-full accent-[#FF385C]"
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#717171]">
          Weights are automatically normalised to 100%.
        </p>

        {/* BEST MATCH */}
        {best && (
          <div className="mt-6 border border-green-200 bg-green-50 rounded-2xl p-5">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
              Best Match
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#222222]">
              {best.name}
            </h2>
          </div>
        )}

        {/* COMPARISON TABLE */}
        <div className="mt-10 overflow-x-auto rounded-2xl border border-[#DDDDDD] shadow-sm">
          <div className="min-w-[540px]">

            {/* COLLEGE HEADER ROW */}
            <div className={`${gridClass} gap-0 border-b border-[#DDDDDD] bg-[#F7F7F7]`}>
              <div className="px-5 py-4 text-sm font-medium text-[#717171]">
                Metric
              </div>
              {scored.map((c, i) => (
                <div
                  key={c.id}
                  className={`px-5 py-4 text-sm font-semibold border-l border-[#DDDDDD] ${
                    i === activeIndex ? "text-[#FF385C]" : "text-[#222222]"
                  }`}
                >
                  {c.name}
                  {c.id === best?.id && (
                    <span className="ml-2 text-xs font-normal text-green-600">
                      ★ Best
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* PLACEMENT ROW */}
            {showRow("placement") && (
              <div className={`${gridClass} border-b border-[#DDDDDD]`}>
                <div className="px-5 py-4 text-sm text-[#717171]">
                  Placement (LPA)
                </div>
                {scored.map((c, i) => (
                  <div
                    key={c.id}
                    className={`px-5 py-4 text-sm font-semibold border-l border-[#DDDDDD] ${
                      i === winnerIdx("placement")
                        ? "text-green-600 bg-green-50"
                        : "text-[#222222]"
                    }`}
                  >
                    ₹{c.placement} LPA
                  </div>
                ))}
              </div>
            )}

            {/* FEES ROW */}
            {showRow("fees") && (
              <div className={`${gridClass} border-b border-[#DDDDDD]`}>
                <div className="px-5 py-4 text-sm text-[#717171]">
                  Fees (annual)
                </div>
                {scored.map((c, i) => (
                  <div
                    key={c.id}
                    className={`px-5 py-4 text-sm font-semibold border-l border-[#DDDDDD] ${
                      i === winnerIdx("fees")
                        ? "text-green-600 bg-green-50"
                        : "text-[#222222]"
                    }`}
                  >
                    {formatFees(c.fees)}
                  </div>
                ))}
              </div>
            )}

            {/* NIRF ROW */}
            {showRow("nirf") && (
              <div className={`${gridClass} border-b border-[#DDDDDD]`}>
                <div className="px-5 py-4 text-sm text-[#717171]">
                  NIRF Rank
                </div>
                {scored.map((c, i) => (
                  <div
                    key={c.id}
                    className={`px-5 py-4 text-sm font-semibold border-l border-[#DDDDDD] ${
                      i === winnerIdx("nirf")
                        ? "text-green-600 bg-green-50"
                        : "text-[#222222]"
                    }`}
                  >
                    #{c.nirf}
                  </div>
                ))}
              </div>
            )}

            {/* LOCATION ROW */}
            {showRow("city") && (
              <div className={`${gridClass} border-b border-[#DDDDDD]`}>
                <div className="px-5 py-4 text-sm text-[#717171]">
                  Location
                </div>
                {scored.map((c) => (
                  <div
                    key={c.id}
                    className="px-5 py-4 text-sm text-[#222222] border-l border-[#DDDDDD]"
                  >
                    {c.city}
                  </div>
                ))}
              </div>
            )}

            {/* STREAM ROW */}
            {showRow("stream") && (
              <div className={`${gridClass} border-b border-[#DDDDDD]`}>
                <div className="px-5 py-4 text-sm text-[#717171]">
                  Stream
                </div>
                {scored.map((c) => (
                  <div
                    key={c.id}
                    className="px-5 py-4 text-sm text-[#222222] border-l border-[#DDDDDD]"
                  >
                    {c.stream}
                  </div>
                ))}
              </div>
            )}

            {/* FINAL SCORE ROW */}
            <div className={`${gridClass} bg-[#F7F7F7]`}>
              <div className="px-5 py-4 text-sm font-medium text-[#222222]">
                Final Score
              </div>
              {scored.map((c, i) => (
                <div
                  key={c.id}
                  className={`px-5 py-4 text-sm font-bold border-l border-[#DDDDDD] ${
                    i === 0 ? "text-[#FF385C]" : "text-[#717171]"
                  }`}
                >
                  {c.score.toFixed(1)}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* KEYBOARD HINT */}
        <p className="mt-4 text-xs text-[#717171]">
          Use ← → keys to navigate focus between colleges
        </p>

      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <ComparePageInner />
    </Suspense>
  );
}