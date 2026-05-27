"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { colleges } from "@/data/colleges";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { MapPin, GraduationCap, Bookmark, ExternalLink, ArrowLeft } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  SEEDED SUPPLEMENTARY DATA (keyed by college id)                    */
/* ------------------------------------------------------------------ */

const RECRUITERS: Record<number, string[]> = {
  1: ["Google", "Microsoft", "Goldman Sachs", "Samsung", "Qualcomm"],
  2: ["Amazon", "Uber", "Cisco", "Texas Instruments", "Schlumberger"],
  3: ["TCS", "Infosys", "Wipro", "L&T", "Hyundai"],
  4: ["Zoho", "Cognizant", "Capgemini", "HCL", "Bosch"],
  5: ["AIIMS Hospitals", "Apollo", "Fortis", "Max Healthcare", "WHO"],
  6: ["Supreme Court", "Trilegal", "AZB & Partners", "Cyril Amarchand"],
  7: ["Microsoft", "Apple", "DE Shaw", "Goldman Sachs", "Intel"],
  8: ["TCS", "Infosys", "Wipro", "IBM", "Accenture"],
  9: ["Accenture", "Deloitte", "TCS", "Cognizant", "Capgemini"],
  10: ["TCS", "Wipro", "HCL", "Tech Mahindra", "Infosys"],
  11: ["AIIMS", "PGI Chandigarh", "Medanta", "Apollo", "NIMHANS"],
  12: ["Government Hospitals", "Apollo", "Fortis", "Max Healthcare"],
  13: ["Delhi Government Hospitals", "Apollo", "Sir Ganga Ram"],
  14: ["Mumbai Government Hospitals", "KEM Hospital", "Wockhardt"],
  15: ["Manipal Hospitals", "Apollo", "Fortis", "Narayana Health"],
  16: ["PSG Hospitals", "Apollo", "Kovai Medical", "Coimbatore Medical"],
  17: ["Supreme Court", "High Courts", "AZB", "Cyril Amarchand", "Trilegal"],
  18: ["High Courts", "Shardul Amarchand", "Khaitan & Co", "J Sagar"],
  19: ["Supreme Court", "AZB", "Trilegal", "Cyril Amarchand", "Linklaters"],
  20: ["Deloitte", "KPMG", "EY", "PwC", "JP Morgan"],
  21: ["EY", "KPMG", "Deloitte", "Accenture", "Infosys BPO"],
  22: ["EY", "Deloitte", "Mphasis", "Cognizant", "TCS"],
};

const YOY: Record<number, { year: string; avg: number }[]> = {
  1: [
    { year: "2020", avg: 26 },
    { year: "2021", avg: 28 },
    { year: "2022", avg: 30 },
    { year: "2023", avg: 31 },
    { year: "2024", avg: 32 },
  ],
  2: [
    { year: "2020", avg: 22 },
    { year: "2021", avg: 24 },
    { year: "2022", avg: 25 },
    { year: "2023", avg: 27 },
    { year: "2024", avg: 28 },
  ],
};

// Default YoY for colleges without specific data
function getYoY(id: number, base: number) {
  if (YOY[id]) return YOY[id];
  return [
    { year: "2020", avg: Math.max(base - 4, 2) },
    { year: "2021", avg: Math.max(base - 3, 3) },
    { year: "2022", avg: Math.max(base - 2, 4) },
    { year: "2023", avg: Math.max(base - 1, 5) },
    { year: "2024", avg: base },
  ];
}

// Stream → cutoff percentile (for admission predictor)
const CUTOFFS: Record<string, { jee?: number; neet?: number; cuet?: number; clat?: number }> = {
  Engineering: { jee: 95 },
  Medical: { neet: 99 },
  Law: { clat: 90 },
  Commerce: { cuet: 85 },
};

const EXAM_BY_STREAM: Record<string, string> = {
  Engineering: "JEE",
  Medical: "NEET",
  Law: "CLAT",
  Commerce: "CUET",
};

const COURSES: Record<string, string[]> = {
  Engineering: ["B.Tech CSE", "B.Tech ECE", "B.Tech Mechanical", "B.Tech Civil", "M.Tech", "PhD"],
  Medical: ["MBBS", "MD", "MS", "BDS", "BSc Nursing", "MPH"],
  Law: ["BA LLB (Hons)", "BBA LLB", "LLM", "PhD Law"],
  Commerce: ["B.Com (Hons)", "BBA", "MBA", "M.Com", "CA Foundation"],
};

const FEES_BREAKDOWN: Record<string, { label: string; amount: number }[]> = {
  Engineering: [
    { label: "Tuition Fee", amount: 0.6 },
    { label: "Hostel & Mess", amount: 0.25 },
    { label: "Other Charges", amount: 0.15 },
  ],
  Medical: [
    { label: "Tuition Fee", amount: 0.7 },
    { label: "Hostel & Mess", amount: 0.2 },
    { label: "Other Charges", amount: 0.1 },
  ],
  Law: [
    { label: "Tuition Fee", amount: 0.65 },
    { label: "Hostel & Mess", amount: 0.25 },
    { label: "Other Charges", amount: 0.1 },
  ],
  Commerce: [
    { label: "Tuition Fee", amount: 0.55 },
    { label: "Hostel & Mess", amount: 0.3 },
    { label: "Other Charges", amount: 0.15 },
  ],
};

const TABS = ["Overview", "Courses & Fees", "Placements", "Admission"] as const;
type Tab = (typeof TABS)[number];

function formatFees(val: number) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${(val / 1000).toFixed(0)}K`;
}

/* ------------------------------------------------------------------ */
/*  ADMISSION PREDICTOR                                                 */
/* ------------------------------------------------------------------ */

function AdmissionPredictor({
  stream,
  collegeName,
}: {
  stream: string;
  collegeName: string;
}) {
  const exam = EXAM_BY_STREAM[stream] ?? "CUET";
  const cutoff = CUTOFFS[stream]?.[exam.toLowerCase() as keyof (typeof CUTOFFS)[string]] ?? 90;

  const [percentile, setPercentile] = useState(85);

  const gap = percentile - cutoff;
  const probability = Math.min(100, Math.max(0, 50 + gap * 5));

  const color =
    probability >= 70
      ? "bg-green-500"
      : probability >= 40
      ? "bg-yellow-400"
      : "bg-red-400";

  const label =
    probability >= 70 ? "Good chance" : probability >= 40 ? "Moderate chance" : "Low chance";

  const labelColor =
    probability >= 70
      ? "text-green-700"
      : probability >= 40
      ? "text-yellow-700"
      : "text-red-600";

  return (
    <div className="rounded-2xl border border-neutral-200 p-6">
      <h3 className="text-base font-semibold text-neutral-900">
        Admission Predictor
      </h3>
      <p className="mt-1 text-sm text-neutral-500">
        Enter your {exam} percentile to see your chances at {collegeName}.
      </p>

      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">
            Your {exam} Percentile
          </label>
          <span className="text-sm font-bold text-blue-600">{percentile}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percentile}
          onChange={(e) => setPercentile(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-neutral-600">Admission Probability</span>
          <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
        </div>
        <div className="h-3 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${probability}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-400 mt-1">
          <span>{probability.toFixed(0)}% probability</span>
          <span>Cutoff ~{cutoff} percentile</span>
        </div>
      </div>

      {gap < 0 && (
        <p className="mt-4 text-xs text-red-500">
          You are {Math.abs(gap).toFixed(0)} percentile points below the typical cutoff. Consider
          backup options or state quota.
        </p>
      )}
      {gap >= 0 && gap < 5 && (
        <p className="mt-4 text-xs text-yellow-600">
          You are near the cutoff. Consider applying but have backup options ready.
        </p>
      )}
      {gap >= 5 && (
        <p className="mt-4 text-xs text-green-600">
          You are comfortably above the cutoff. You have a strong chance.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                           */
/* ------------------------------------------------------------------ */

export default function CollegeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const college = useMemo(
    () =>
      colleges.find(
        (c) =>
          c.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") === slug
      ),
    [slug]
  );

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    if (!college) return;
    const stored = localStorage.getItem("collegehunt-shortlist");
    if (stored) {
      const ids: number[] = JSON.parse(stored);
      setShortlisted(ids.includes(college.id));
    }
  }, [college]);

  const toggleShortlist = () => {
    if (!college) return;
    const stored = localStorage.getItem("collegehunt-shortlist");
    const ids: number[] = stored ? JSON.parse(stored) : [];
    const next = shortlisted
      ? ids.filter((x) => x !== college.id)
      : [...ids, college.id];
    localStorage.setItem("collegehunt-shortlist", JSON.stringify(next));
    setShortlisted(!shortlisted);
  };

  if (!college) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500">College not found.</p>
          <a href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            ← Back to search
          </a>
        </div>
      </main>
    );
  }

  const recruiters = RECRUITERS[college.id] ?? ["TCS", "Infosys", "Wipro", "HCL", "Accenture"];
  const yoy = getYoY(college.id, college.placement);
  const courses = COURSES[college.stream] ?? [];
  const feesBreakdown = FEES_BREAKDOWN[college.stream] ?? [];

  return (
    <main className="min-h-screen bg-white text-neutral-900">

      {/* HERO */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">

          <a
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </a>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 font-medium">
                  NIRF #{college.nirf}
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                  {college.type}
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                  {college.stream}
                </span>
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                  NAAC A++
                </span>
              </div>

              {/* Name */}
              <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">
                {college.name}
              </h1>

              {/* Meta */}
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {college.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {formatFees(college.fees)} / year
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 shrink-0">
              <button
                onClick={toggleShortlist}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium transition-colors ${
                  shortlisted
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                {shortlisted ? "Saved" : "Save"}
              </button>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(college.name + " official website")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Apply
              </a>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Avg Placement", value: `₹${college.placement} LPA` },
              { label: "Annual Fees", value: formatFees(college.fees) },
              { label: "NIRF Rank", value: `#${college.nirf}` },
              { label: "Type", value: college.type },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-neutral-200 px-5 py-4"
              >
                <p className="text-xs text-neutral-500">{s.label}</p>
                <p className="mt-1 text-lg font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">

        {/* ---- OVERVIEW ---- */}
        {activeTab === "Overview" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-sm leading-7 text-neutral-600">
                  {college.name} is one of India&apos;s premier {college.stream.toLowerCase()} institutions,
                  located in {college.city}. Established as a {college.type.toLowerCase()} institution,
                  it consistently ranks among the top colleges in the country with a NIRF rank of #{college.nirf}.
                  The institute offers world-class infrastructure, research facilities, and strong
                  industry connections that translate into excellent placement outcomes for graduates.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Highlights</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    `NIRF Rank #${college.nirf} nationally`,
                    `Avg placement ₹${college.placement} LPA`,
                    `${college.type} institution`,
                    `Located in ${college.city}`,
                    "NAAC A++ Accredited",
                    `Annual fees ${formatFees(college.fees)}`,
                  ].map((h) => (
                    <div
                      key={h}
                      className="flex items-start gap-2 text-sm text-neutral-700"
                    >
                      <span className="mt-0.5 text-blue-600">✓</span>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <AdmissionPredictor
                stream={college.stream}
                collegeName={college.name}
              />
            </div>
          </div>
        )}

        {/* ---- COURSES & FEES ---- */}
        {activeTab === "Courses & Fees" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold mb-4">Courses Offered</h2>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
                  >
                    <span className="text-sm text-neutral-800">{course}</span>
                    <span className="text-xs text-neutral-400">
                      {formatFees(college.fees)} / yr
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Fee Breakdown</h2>
              <div className="space-y-3">
                {feesBreakdown.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-neutral-700">{f.label}</span>
                      <span className="text-sm font-medium">
                        {formatFees(Math.round(college.fees * f.amount))}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${f.amount * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 flex justify-between">
                  <span className="text-sm font-medium text-neutral-700">Total Annual</span>
                  <span className="text-sm font-bold text-neutral-900">
                    {formatFees(college.fees)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- PLACEMENTS ---- */}
        {activeTab === "Placements" && (
          <div className="space-y-10">

            {/* Avg package bar chart */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Average Package by Year</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yoy} barSize={36}>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}L`}
                    />
                    <Tooltip
                      formatter={(v: number) => [`₹${v} LPA`, "Avg Package"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="avg" fill="#006AFF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* YoY trend line */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Placement Trend</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yoy}>
                    <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}L`}
                    />
                    <Tooltip
                      formatter={(v: number) => [`₹${v} LPA`, "Avg Package"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        fontSize: "13px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#006AFF"
                      strokeWidth={2.5}
                      dot={{ fill: "#006AFF", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top recruiters */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Top Recruiters</h2>
              <div className="flex flex-wrap gap-3">
                {recruiters.map((r) => (
                  <span
                    key={r}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---- ADMISSION ---- */}
        {activeTab === "Admission" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">How to Apply</h2>
                <ol className="space-y-4">
                  {[
                    `Appear for ${EXAM_BY_STREAM[college.stream] ?? "entrance exam"} and get your scorecard.`,
                    "Register on the official college portal with valid ID and marksheets.",
                    "Fill the application form and upload required documents.",
                    "Pay the application fee online.",
                    "Track your application status on the portal.",
                    "Attend counselling/interview if shortlisted.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4 text-sm text-neutral-700 leading-6">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-neutral-200 px-5 py-4">
                <p className="text-sm font-medium text-neutral-700 mb-3">Key Dates (2025)</p>
                {[
                  { label: "Application Start", value: "Jan 15, 2025" },
                  { label: "Application Deadline", value: "Mar 31, 2025" },
                  { label: "Entrance Exam", value: "Apr 20, 2025" },
                  { label: "Result Declaration", value: "May 10, 2025" },
                  { label: "Counselling Begins", value: "Jun 1, 2025" },
                ].map((d) => (
                  <div
                    key={d.label}
                    className="flex justify-between py-2 border-b border-neutral-100 last:border-0"
                  >
                    <span className="text-sm text-neutral-500">{d.label}</span>
                    <span className="text-sm font-medium text-neutral-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <AdmissionPredictor
                stream={college.stream}
                collegeName={college.name}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}