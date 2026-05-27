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
import {
  MapPin,
  GraduationCap,
  Bookmark,
  ExternalLink,
  ArrowLeft,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
} from "lucide-react";

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

  const barColor =
    probability >= 70
      ? "#22c55e"
      : probability >= 40
      ? "#f59e0b"
      : "#FF385C";

  const label =
    probability >= 70 ? "Good chance" : probability >= 40 ? "Moderate chance" : "Low chance";

  const labelColor =
    probability >= 70
      ? "#16a34a"
      : probability >= 40
      ? "#d97706"
      : "#FF385C";

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #DDDDDD",
        padding: "24px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      }}
    >
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#222222",
          marginBottom: "6px",
        }}
      >
        Admission Predictor
      </h3>
      <p style={{ fontSize: "14px", color: "#717171", marginBottom: "24px" }}>
        Enter your {exam} percentile to see your chances at {collegeName}.
      </p>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500, color: "#222222" }}>
            Your {exam} Percentile
          </label>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#FF385C" }}>
            {percentile}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percentile}
          onChange={(e) => setPercentile(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#FF385C" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#717171",
            marginTop: "4px",
          }}
        >
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#717171" }}>Admission Probability</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: labelColor }}>{label}</span>
        </div>
        <div
          style={{
            height: "8px",
            borderRadius: "100px",
            backgroundColor: "#F7F7F7",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "100px",
              width: `${probability}%`,
              backgroundColor: barColor,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#717171",
            marginTop: "6px",
          }}
        >
          <span>{probability.toFixed(0)}% probability</span>
          <span>Cutoff ~{cutoff} percentile</span>
        </div>
      </div>

      {gap < 0 && (
        <p
          style={{
            marginTop: "16px",
            fontSize: "13px",
            color: "#FF385C",
            backgroundColor: "#FFF1F2",
            borderRadius: "10px",
            padding: "10px 14px",
          }}
        >
          You are {Math.abs(gap).toFixed(0)} points below the typical cutoff. Consider backup
          options or state quota.
        </p>
      )}
      {gap >= 0 && gap < 5 && (
        <p
          style={{
            marginTop: "16px",
            fontSize: "13px",
            color: "#d97706",
            backgroundColor: "#fffbeb",
            borderRadius: "10px",
            padding: "10px 14px",
          }}
        >
          You are near the cutoff. Apply but keep backup options ready.
        </p>
      )}
      {gap >= 5 && (
        <p
          style={{
            marginTop: "16px",
            fontSize: "13px",
            color: "#16a34a",
            backgroundColor: "#f0fdf4",
            borderRadius: "10px",
            padding: "10px 14px",
          }}
        >
          You are comfortably above the cutoff — strong chance of admission!
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
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#717171", fontSize: "15px" }}>College not found.</p>
          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: "16px",
              fontSize: "14px",
              color: "#FF385C",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
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

  /* Quick stat cards data */
  const quickStats = [
    {
      icon: <TrendingUp size={18} color="#FF385C" />,
      label: "Avg Placement",
      value: `₹${college.placement} LPA`,
    },
    {
      icon: <GraduationCap size={18} color="#FF385C" />,
      label: "Annual Fees",
      value: formatFees(college.fees),
    },
    {
      icon: <Award size={18} color="#FF385C" />,
      label: "NIRF Rank",
      value: `#${college.nirf}`,
    },
    {
      icon: <Users size={18} color="#FF385C" />,
      label: "Type",
      value: college.type,
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        color: "#222222",
        fontFamily: "'Circular', 'Circular Std', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid #DDDDDD" }}>
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            padding: "40px 24px 48px",
          }}
        >
          {/* Back link */}
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              color: "#717171",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#222222")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#717171")}
          >
            <ArrowLeft size={15} />
            Back to search
          </a>

          {/* Hero content */}
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
            }}
          >
            {/* Left: name + badges */}
            <div style={{ flex: "1 1 400px" }}>
              {/* Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span
                  style={{
                    borderRadius: "100px",
                    backgroundColor: "#FFF1F2",
                    color: "#FF385C",
                    fontSize: "13px",
                    fontWeight: 600,
                    padding: "4px 12px",
                  }}
                >
                  NIRF #{college.nirf}
                </span>
                <span
                  style={{
                    borderRadius: "100px",
                    backgroundColor: "#F7F7F7",
                    color: "#717171",
                    fontSize: "13px",
                    fontWeight: 500,
                    padding: "4px 12px",
                    border: "1px solid #DDDDDD",
                  }}
                >
                  {college.type}
                </span>
                <span
                  style={{
                    borderRadius: "100px",
                    backgroundColor: "#F7F7F7",
                    color: "#717171",
                    fontSize: "13px",
                    fontWeight: 500,
                    padding: "4px 12px",
                    border: "1px solid #DDDDDD",
                  }}
                >
                  {college.stream}
                </span>
                <span
                  style={{
                    borderRadius: "100px",
                    backgroundColor: "#f0fdf4",
                    color: "#16a34a",
                    fontSize: "13px",
                    fontWeight: 500,
                    padding: "4px 12px",
                  }}
                >
                  NAAC A++
                </span>
              </div>

              {/* College name */}
              <h1
                style={{
                  marginTop: "16px",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  color: "#222222",
                  lineHeight: 1.2,
                }}
              >
                {college.name}
              </h1>

              {/* Meta row */}
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                  fontSize: "15px",
                  color: "#717171",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={15} />
                  {college.city}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <GraduationCap size={15} />
                  {formatFees(college.fees)} / year
                </span>
              </div>
            </div>

            {/* Right: CTAs */}
            <div style={{ display: "flex", gap: "12px", flexShrink: 0, alignItems: "center" }}>
              <button
                onClick={toggleShortlist}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "12px",
                  border: shortlisted ? "1px solid #FF385C" : "1px solid #DDDDDD",
                  backgroundColor: shortlisted ? "#FFF1F2" : "#FFFFFF",
                  color: shortlisted ? "#FF385C" : "#222222",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "12px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Bookmark size={16} />
                {shortlisted ? "Saved" : "Save"}
              </button>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(college.name + " official website")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "12px",
                  backgroundColor: "#FF385C",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "12px 20px",
                  textDecoration: "none",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "#E31C5F")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "#FF385C")
                }
              >
                <ExternalLink size={16} />
                Apply Now
              </a>
            </div>
          </div>

          {/* ── QUICK STATS ── */}
          <div
            style={{
              marginTop: "36px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {quickStats.map((s) => (
              <div
                key={s.label}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #DDDDDD",
                  padding: "20px 24px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 6px 16px rgba(0,0,0,0.12)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{ marginBottom: "8px" }}>{s.icon}</div>
                <p style={{ fontSize: "13px", color: "#717171", marginBottom: "4px" }}>
                  {s.label}
                </p>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#222222" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #DDDDDD",
        }}
      >
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flexShrink: 0,
                padding: "16px 20px",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #FF385C" : "2px solid transparent",
                color: activeTab === tab ? "#FF385C" : "#717171",
                transition: "color 0.2s ease",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        {/* ─── OVERVIEW ─── */}
        {activeTab === "Overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "32px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)",
                gap: "32px",
                alignItems: "start",
              }}
              className="overview-grid"
            >
              {/* Left */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* About */}
                <div>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#222222",
                      marginBottom: "12px",
                    }}
                  >
                    About
                  </h2>
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: "1.75",
                      color: "#717171",
                    }}
                  >
                    {college.name} is one of India&apos;s premier{" "}
                    {college.stream.toLowerCase()} institutions, located in {college.city}.
                    Established as a {college.type.toLowerCase()} institution, it consistently
                    ranks among the top colleges in the country with a NIRF rank of #
                    {college.nirf}. The institute offers world-class infrastructure, research
                    facilities, and strong industry connections that translate into excellent
                    placement outcomes for graduates.
                  </p>
                </div>

                {/* Highlights */}
                <div>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#222222",
                      marginBottom: "16px",
                    }}
                  >
                    Highlights
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
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
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          fontSize: "14px",
                          color: "#222222",
                          padding: "14px 16px",
                          borderRadius: "12px",
                          border: "1px solid #DDDDDD",
                          backgroundColor: "#FFFFFF",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                      >
                        <CheckCircle2 size={16} color="#FF385C" style={{ flexShrink: 0, marginTop: "1px" }} />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: predictor */}
              <AdmissionPredictor stream={college.stream} collegeName={college.name} />
            </div>
          </div>
        )}

        {/* ─── COURSES & FEES ─── */}
        {activeTab === "Courses & Fees" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
            }}
          >
            {/* Courses */}
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#222222",
                  marginBottom: "16px",
                }}
              >
                Courses Offered
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {courses.map((course) => (
                  <div
                    key={course}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: "12px",
                      border: "1px solid #DDDDDD",
                      padding: "14px 18px",
                      backgroundColor: "#FFFFFF",
                      transition: "box-shadow 0.2s ease",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.boxShadow =
                        "0 6px 16px rgba(0,0,0,0.10)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.boxShadow =
                        "0 1px 4px rgba(0,0,0,0.04)")
                    }
                  >
                    <span style={{ fontSize: "15px", color: "#222222", fontWeight: 500 }}>
                      {course}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#FF385C",
                        fontWeight: 600,
                        backgroundColor: "#FFF1F2",
                        padding: "3px 10px",
                        borderRadius: "100px",
                      }}
                    >
                      {formatFees(college.fees)} / yr
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Breakdown */}
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#222222",
                  marginBottom: "16px",
                }}
              >
                Fee Breakdown
              </h2>
              <div
                style={{
                  borderRadius: "16px",
                  border: "1px solid #DDDDDD",
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {feesBreakdown.map((f) => (
                  <div key={f.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "#717171" }}>{f.label}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#222222" }}>
                        {formatFees(Math.round(college.fees * f.amount))}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        borderRadius: "100px",
                        backgroundColor: "#F7F7F7",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "100px",
                          width: `${f.amount * 100}%`,
                          backgroundColor: "#FF385C",
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div
                  style={{
                    marginTop: "4px",
                    borderTop: "1px solid #DDDDDD",
                    paddingTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#222222" }}>
                    Total Annual
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#FF385C",
                    }}
                  >
                    {formatFees(college.fees)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── PLACEMENTS ─── */}
        {activeTab === "Placements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            {/* Bar chart */}
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#222222",
                  marginBottom: "24px",
                }}
              >
                Average Package by Year
              </h2>
              <div
                style={{
                  borderRadius: "16px",
                  border: "1px solid #DDDDDD",
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  height: "280px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yoy} barSize={40}>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 13, fill: "#717171" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 13, fill: "#717171" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}L`}
                    />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v)} LPA`, "Avg Package"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #DDDDDD",
                        fontSize: "13px",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
                      }}
                    />
                    <Bar dataKey="avg" fill="#FF385C" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line chart */}
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#222222",
                  marginBottom: "24px",
                }}
              >
                Placement Trend
              </h2>
              <div
                style={{
                  borderRadius: "16px",
                  border: "1px solid #DDDDDD",
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  height: "220px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yoy}>
                    <CartesianGrid stroke="#F7F7F7" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 13, fill: "#717171" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 13, fill: "#717171" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}L`}
                    />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v)} LPA`, "Avg Package"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #DDDDDD",
                        fontSize: "13px",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#FF385C"
                      strokeWidth={2.5}
                      dot={{ fill: "#FF385C", r: 5, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recruiters */}
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#222222",
                  marginBottom: "16px",
                }}
              >
                Top Recruiters
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {recruiters.map((r) => (
                  <span
                    key={r}
                    style={{
                      borderRadius: "100px",
                      border: "1px solid #DDDDDD",
                      padding: "10px 20px",
                      fontSize: "14px",
                      color: "#222222",
                      fontWeight: 500,
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#FF385C";
                      (e.currentTarget as HTMLElement).style.color = "#FF385C";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF1F2";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#DDDDDD";
                      (e.currentTarget as HTMLElement).style.color = "#222222";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFFFF";
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── ADMISSION ─── */}
        {activeTab === "Admission" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
              alignItems: "start",
            }}
          >
            {/* Steps + dates */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {/* How to apply */}
              <div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#222222",
                    marginBottom: "20px",
                  }}
                >
                  How to Apply
                </h2>
                <ol style={{ display: "flex", flexDirection: "column", gap: "16px", padding: 0, margin: 0, listStyle: "none" }}>
                  {[
                    `Appear for ${EXAM_BY_STREAM[college.stream] ?? "entrance exam"} and get your scorecard.`,
                    "Register on the official college portal with valid ID and marksheets.",
                    "Fill the application form and upload required documents.",
                    "Pay the application fee online.",
                    "Track your application status on the portal.",
                    "Attend counselling/interview if shortlisted.",
                  ].map((step, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        gap: "14px",
                        fontSize: "15px",
                        color: "#717171",
                        lineHeight: 1.6,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          backgroundColor: "#FFF1F2",
                          color: "#FF385C",
                          fontSize: "13px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: "1px",
                        }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Key dates */}
              <div
                style={{
                  borderRadius: "16px",
                  border: "1px solid #DDDDDD",
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#222222",
                    marginBottom: "16px",
                  }}
                >
                  Key Dates (2025)
                </p>
                {[
                  { label: "Application Start", value: "Jan 15, 2025" },
                  { label: "Application Deadline", value: "Mar 31, 2025" },
                  { label: "Entrance Exam", value: "Apr 20, 2025" },
                  { label: "Result Declaration", value: "May 10, 2025" },
                  { label: "Counselling Begins", value: "Jun 1, 2025" },
                ].map((d) => (
                  <div
                    key={d.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid #F7F7F7",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#717171" }}>{d.label}</span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#222222",
                      }}
                    >
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictor */}
            <AdmissionPredictor stream={college.stream} collegeName={college.name} />
          </div>
        )}
      </div>

      {/* ── RESPONSIVE STYLE ── */}
      <style>{`
        @media (max-width: 768px) {
          .overview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}