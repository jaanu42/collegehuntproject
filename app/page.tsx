"use client";

import { useEffect, useMemo, useState } from "react";
import CompareTray from "@/components/CompareTray";
import OnboardingModal from "@/components/OnboardingModal";
import { Search, MapPin, GraduationCap, Bookmark, SlidersHorizontal, X } from "lucide-react";
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
  /* ---------------- LOAD STATE ---------------- */
  
  useEffect(() => {
  const savedShortlist = localStorage.getItem("collegehunt-shortlist");
  if (savedShortlist) setShortlisted(JSON.parse(savedShortlist));
 
  const savedPrefs = localStorage.getItem("user-preferences");
  if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
 
  setHydrated(true);
  setLoading(false); 
}, []);

  /* ---------------- SAVE SHORTLIST ---------------- */
  useEffect(() => {
    localStorage.setItem("collegehunt-shortlist", JSON.stringify(shortlisted));
  }, [shortlisted]);

  /* ---------------- SHORTLIST TOGGLE ---------------- */
  const toggleShortlist = (id: number) => {
    setShortlisted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ---------------- ACTIVE FILTER COUNT ---------------- */
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

  /* ---------------- FILTER + RANKING ---------------- */
  const filteredColleges = useMemo(() => {
    const base = colleges.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase());
      const matchesStream = selectedStream === "All" || c.stream === selectedStream;
      const matchesType = selectedType === "All" || c.type === selectedType;
      const matchesCity = selectedCity === "All" || c.city === selectedCity;
      const matchesFees = c.fees <= feesMax;

      return matchesSearch && matchesStream && matchesType && matchesCity && matchesFees;
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
    <main className="min-h-screen bg-white text-neutral-900">

      {/* HERO */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
              College Discovery Platform
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl">
              Find the right college without decision paralysis.
            </h1>
            <p className="mt-6 text-base leading-7 text-neutral-600">
              Discover, compare, and shortlist colleges using placements, fees, rankings, and outcomes.
            </p>
            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-neutral-300 px-4 py-4">
              <Search className="h-5 w-5 text-neutral-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search colleges or cities"
                className="w-full bg-transparent text-sm outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="h-4 w-4 text-neutral-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="border-b border-neutral-200 sticky top-0 bg-white z-10">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">

          {/* TOP ROW — pills + toggle */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Stream */}
            {STREAMS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStream(s)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  selectedStream === s
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                {s}
              </button>
            ))}

            <div className="h-5 w-px bg-neutral-200 mx-1" />

            {/* Ownership */}
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  selectedType === t
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                {t}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3">
              {/* More filters toggle */}
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                  filtersOpen || activeFilterCount > 0
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-blue-600 text-white text-xs w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Results count */}
              <span className="text-sm text-neutral-500">
                {filteredColleges.length} result{filteredColleges.length !== 1 ? "s" : ""}
              </span>

              {/* Shortlist count */}
              {shortlisted.length > 0 && (
                <span className="text-sm text-neutral-500">
                  · {shortlisted.length} shortlisted
                </span>
              )}
            </div>
          </div>

          {/* EXPANDED FILTERS — city + fees */}
          {filtersOpen && (
            <div className="mt-5 pt-5 border-t border-neutral-100 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {/* City */}
              <div>
                <p className="mb-3 text-sm font-medium text-neutral-700">City</p>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-600"
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
                <div className="flex justify-between mb-3">
                  <p className="text-sm font-medium text-neutral-700">Max Annual Fees</p>
                  <p className="text-sm text-blue-600 font-medium">{formatFees(feesMax)}</p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={MAX_FEES}
                  step={10000}
                  value={feesMax}
                  onChange={(e) => setFeesMax(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-xs text-neutral-400">
                  <span>₹0</span>
                  <span>{formatFees(MAX_FEES)}</span>
                </div>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
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

      {/* COLLEGE LIST */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {loading ? (
    <CollegeListSkeleton count={6} />
  ) : (
        <div className="grid gap-6">
          {filteredColleges.map((c) => {
            const isSaved = shortlisted.includes(c.id);
            return (
              <div
                key={c.id}
                className={`rounded-3xl border p-6 transition-colors ${
                  isSaved ? "border-blue-600 bg-blue-50/40" : "border-neutral-200"
                }`}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                        NIRF #{c.nirf}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                        {c.type}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                        {c.stream}
                      </span>
                    </div>

                    <a href={`/colleges/${slugify(c.name)}`}>
  <h3 className="mt-3 text-xl font-semibold leading-snug hover:text-blue-600 transition-colors">
    {c.name}
  </h3>
</a>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {c.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {formatFees(c.fees)} / yr
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div>
                      <p className="text-xs text-neutral-500">Avg Placement</p>
                      <p className="text-2xl font-bold">₹{c.placement} LPA</p>
                    </div>

                    <button
                      onClick={() => toggleShortlist(c.id)}
                      className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium transition-colors ${
                        isSaved
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
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
       

        {filteredColleges.length === 0 && (
          <div className="mt-20 text-center">
            <p className="text-neutral-500 text-base">No colleges match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
         </div>
     )} 
      </section>

      {/* FLOATING UI */}
      {hydrated && (
        <>
          <CompareTray count={shortlisted.length} />
          <OnboardingModal
            onComplete={(data) => {
              localStorage.setItem("user-preferences", JSON.stringify(data));
              setPreferences(data);
            }}
          />
        </>
      )}
    </main>
  );
}