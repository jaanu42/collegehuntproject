"use client";

import { useEffect, useMemo, useState } from "react";
import CompareTray from "@/components/CompareTray";
import OnboardingModal from "@/components/OnboardingModal";
import {
  Search,
  MapPin,
  GraduationCap,
  Bookmark,
  SlidersHorizontal,
  X,
  TrendingUp,
} from "lucide-react";
import { colleges } from "@/data/colleges";
import { slugify } from "@/data/colleges";
import { CollegeListSkeleton } from "@/components/CollegeCardSkeleton";

type Preferences = {
  stream: string;
  exam: string;
  priority: "Placement" | "Fees" | "Location";
};

const STREAMS = ["All", "Engineering", "Medical", "Law", "Commerce"];
const TYPES = ["All", "Government", "Private"];
const MAX_FEES = 1800000;
const CITIES = [
  "All",
  ...Array.from(new Set(colleges.map((c) => c.city))).sort(),
];

function formatFees(val: number) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${(val / 1000).toFixed(0)}K`;
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedStream, setSelectedStream] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [feesMax, setFeesMax] = useState(MAX_FEES);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shortlisted, setShortlisted] = useState<number[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedShortlist = localStorage.getItem("collegehunt-shortlist");
    if (savedShortlist) setShortlisted(JSON.parse(savedShortlist));
    const savedPrefs = localStorage.getItem("user-preferences");
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
    setHydrated(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("collegehunt-shortlist", JSON.stringify(shortlisted));
  }, [shortlisted]);

  const toggleShortlist = (id: number) => {
    setShortlisted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const activeFilterCount = [
    selectedStream !== "All",
    selectedType !== "All",
    selectedCity !== "All",
    feesMax < MAX_FEES,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedStream("All");
    setSelectedType("All");
    setSelectedCity("All");
    setFeesMax(MAX_FEES);
  };

  const filteredColleges = useMemo(() => {
    const base = colleges.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase());
      const matchesStream =
        selectedStream === "All" || c.stream === selectedStream;
      const matchesType =
        selectedType === "All" || c.type === selectedType;
      const matchesCity =
        selectedCity === "All" || c.city === selectedCity;
      const matchesFees = c.fees <= feesMax;
      return (
        matchesSearch && matchesStream && matchesType && matchesCity && matchesFees
      );
    });

    if (!preferences) return base;

    const scored = base.map((c) => {
      let score = 0;
      if (c.stream === preferences.stream) score += 30;
      if (preferences.exam === "JEE" && c.stream === "Engineering") score += 25;
      if (preferences.priority === "Placement") score += c.placement * 2;
      if (preferences.priority === "Fees") score += (1000000 - c.fees) / 10000;
      if (preferences.priority === "Location" && c.city === "New Delhi") score += 20;
      return { ...c, score };
    });

    return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [search, selectedStream, selectedType, selectedCity, feesMax, preferences]);

  return (
    <main className="min-h-screen bg-white text-[#222222]">

      {/* ── NAVBAR ── */}
      <nav className="border-b border-[#DDDDDD] bg-white sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-[#FF385C] tracking-tight">
            CollegeHunt
          </span>
          <div className="flex items-center gap-3">
            {shortlisted.length > 0 && (
              <span className="text-sm text-[#717171]">
                <span className="font-semibold text-[#222222]">
                  {shortlisted.length}
                </span>{" "}
                shortlisted
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-white border-b border-[#DDDDDD]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-[#FFF1F2] text-[#FF385C] text-xs font-semibold uppercase tracking-widest px-3 py-1 mb-6">
              College Discovery Platform
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#222222]">
              Find the right college,{" "}
              <span className="text-[#FF385C]">without the noise.</span>
            </h1>
            <p className="mt-5 text-base text-[#717171] leading-relaxed max-w-xl">
              Discover, compare, and shortlist colleges using placements, fees,
              rankings, and real outcomes — all in one clean view.
            </p>

            {/* Search bar */}
            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-[#DDDDDD] bg-white px-5 py-4 shadow-sm focus-within:border-[#FF385C] focus-within:shadow-[0_0_0_3px_rgba(255,56,92,0.1)] transition-all">
              <Search className="h-5 w-5 text-[#717171] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by college name or city…"
                className="w-full bg-transparent text-sm text-[#222222] placeholder-[#717171] outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-[#717171] hover:text-[#222222] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-[#717171]">
              <span>
                <strong className="text-[#222222]">22+</strong> top colleges
              </span>
              <span>
                <strong className="text-[#222222]">4</strong> streams
              </span>
              <span>
                <strong className="text-[#222222]">15+</strong> cities
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <section className="border-b border-[#DDDDDD] sticky top-16 bg-white z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4">

          {/* Pill row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stream pills */}
            {STREAMS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStream(s)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  selectedStream === s
                    ? "border-[#FF385C] bg-[#FFF1F2] text-[#FF385C]"
                    : "border-[#DDDDDD] text-[#717171] hover:border-[#222222] hover:text-[#222222]"
                }`}
              >
                {s}
              </button>
            ))}

            <div className="h-5 w-px bg-[#DDDDDD] mx-1" />

            {/* Type pills */}
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  selectedType === t
                    ? "border-[#FF385C] bg-[#FFF1F2] text-[#FF385C]"
                    : "border-[#DDDDDD] text-[#717171] hover:border-[#222222] hover:text-[#222222]"
                }`}
              >
                {t}
              </button>
            ))}

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  filtersOpen || activeFilterCount > 0
                    ? "border-[#FF385C] bg-[#FFF1F2] text-[#FF385C]"
                    : "border-[#DDDDDD] text-[#717171] hover:border-[#222222] hover:text-[#222222]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-[#FF385C] text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-sm text-[#717171]">
                <span className="font-semibold text-[#222222]">
                  {filteredColleges.length}
                </span>{" "}
                result{filteredColleges.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Expanded filters */}
          {filtersOpen && (
            <div className="mt-4 pt-4 border-t border-[#DDDDDD] grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* City */}
              <div>
                <p className="mb-2 text-sm font-semibold text-[#222222]">City</p>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="input-base text-sm"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fees range */}
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-semibold text-[#222222]">
                    Max Annual Fees
                  </p>
                  <p className="text-sm text-[#FF385C] font-semibold">
                    {formatFees(feesMax)}
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={MAX_FEES}
                  step={10000}
                  value={feesMax}
                  onChange={(e) => setFeesMax(Number(e.target.value))}
                  className="w-full accent-[#FF385C]"
                />
                <div className="flex justify-between mt-1 text-xs text-[#717171]">
                  <span>₹0</span>
                  <span>{formatFees(MAX_FEES)}</span>
                </div>
              </div>

              {/* Clear */}
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-[#717171] hover:text-[#222222] transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── COLLEGE LIST ── */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
        {preferences && (
          <p className="mb-6 text-sm text-[#717171]">
            Sorted by your preference:{" "}
            <span className="font-semibold text-[#222222]">
              {preferences.priority}
            </span>
          </p>
        )}

        {loading ? (
          <CollegeListSkeleton count={6} />
        ) : (
          <div className="grid gap-5">
            {filteredColleges.map((c) => {
              const isSaved = shortlisted.includes(c.id);
              return (
                <div
                  key={c.id}
                  className={`card p-6 transition-all ${
                    isSaved
                      ? "border border-[#FF385C] bg-[#FFF1F2]/40 shadow-[0_6px_20px_rgba(255,56,92,0.1)]"
                      : "border border-[#DDDDDD]"
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left */}
                    <div className="min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="badge-nirf">
                          # {c.nirf} NIRF
                        </span>
                        <span className="rounded-full bg-[#F7F7F7] border border-[#DDDDDD] px-3 py-1 text-xs font-medium text-[#717171]">
                          {c.type}
                        </span>
                        <span className="rounded-full bg-[#F7F7F7] border border-[#DDDDDD] px-3 py-1 text-xs font-medium text-[#717171]">
                          {c.stream}
                        </span>
                      </div>

                      {/* Name */}
                      <a href={`/colleges/${slugify(c.name)}`}>
                        <h3 className="mt-3 text-lg font-semibold text-[#222222] hover:text-[#FF385C] transition-colors leading-snug">
                          {c.name}
                        </h3>
                      </a>

                      {/* Meta */}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#717171]">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {c.city}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4" />
                          {formatFees(c.fees)} / yr
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-6 shrink-0">
                      {/* Placement stat */}
                      <div className="text-right">
                        <p className="text-xs text-[#717171] flex items-center gap-1 justify-end">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Avg Placement
                        </p>
                        <p className="text-2xl font-bold text-[#222222] mt-0.5">
                          ₹{c.placement}{" "}
                          <span className="text-sm font-medium text-[#717171]">
                            LPA
                          </span>
                        </p>
                      </div>

                      {/* Shortlist button */}
                      <button
                        onClick={() => toggleShortlist(c.id)}
                        className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all ${
                          isSaved
                            ? "border-[#FF385C] bg-[#FF385C] text-white shadow-md"
                            : "border-[#DDDDDD] text-[#222222] hover:border-[#FF385C] hover:text-[#FF385C]"
                        }`}
                      >
                        <Bookmark className="h-4 w-4" />
                        {isSaved ? "Saved" : "Shortlist"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {filteredColleges.length === 0 && (
              <div className="mt-24 text-center">
                <div className="text-5xl mb-4">🎓</div>
                <p className="text-[#222222] font-semibold text-lg">
                  No colleges match your filters.
                </p>
                <p className="mt-1 text-sm text-[#717171]">
                  Try adjusting or clearing your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 btn-primary"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── FLOATING UI ── */}
      {hydrated && (
        <>
          <CompareTray count={shortlisted.length} />
          <OnboardingModal
            onComplete={(data) => {
              localStorage.setItem("user-preferences", JSON.stringify(data));
              setPreferences(data as Preferences);
            }}
          />
        </>
      )}
    </main>
  );
}