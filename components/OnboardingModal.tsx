"use client";

import { useEffect, useState } from "react";

type Step = 1 | 2 | 3;

const STREAMS = ["Engineering", "Medical", "Law", "Commerce"];
const EXAMS = ["JEE", "NEET", "CUET", "CLAT", "State"];
const PRIORITIES = ["Placement", "Fees", "Location"];

const STREAM_ICONS: Record<string, string> = {
  Engineering: "⚙️",
  Medical: "🩺",
  Law: "⚖️",
  Commerce: "📊",
};

const STEP_TITLES = [
  "What stream are you targeting?",
  "Which exam did you give?",
  "What matters most to you?",
];

const STEP_SUBTITLES = [
  "We'll show colleges that match your stream first.",
  "We'll highlight colleges where your exam score counts.",
  "Your homepage ranking will reflect this priority.",
];

export default function OnboardingModal({
  onComplete,
}: {
  onComplete: (data: { stream: string; exam: string; priority: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [stream, setStream] = useState("Engineering");
  const [exam, setExam] = useState("JEE");
  const [priority, setPriority] = useState("Placement");

  useEffect(() => {
    const seen = localStorage.getItem("onboarding-done");
    if (!seen) setOpen(true);
  }, []);

  const finish = () => {
    const data = { stream, exam, priority };
    localStorage.setItem("onboarding-done", "true");
    localStorage.setItem("user-preferences", JSON.stringify(data));
    onComplete(data);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#DDDDDD] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                n <= step ? "bg-[#FF385C]" : "bg-[#DDDDDD]"
              }`}
            />
          ))}
        </div>

        {/* Step label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#FF385C] mb-2">
          Step {step} of 3
        </p>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#222222] leading-snug">
          {STEP_TITLES[step - 1]}
        </h2>
        <p className="mt-2 text-sm text-[#717171] leading-relaxed">
          {STEP_SUBTITLES[step - 1]}
        </p>

        {/* Step 1 — Stream */}
        {step === 1 && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {STREAMS.map((s) => (
              <button
                key={s}
                onClick={() => setStream(s)}
                className={`rounded-2xl border px-4 py-4 text-sm font-medium text-left transition-all ${
                  stream === s
                    ? "border-[#FF385C] bg-[#FFF1F2] text-[#FF385C] shadow-sm"
                    : "border-[#DDDDDD] text-[#222222] hover:border-[#222222]"
                }`}
              >
                <span className="text-lg block mb-1">{STREAM_ICONS[s]}</span>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Exam */}
        {step === 2 && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {EXAMS.map((e) => (
              <button
                key={e}
                onClick={() => setExam(e)}
                className={`rounded-2xl border px-4 py-4 text-sm font-semibold text-left transition-all ${
                  exam === e
                    ? "border-[#FF385C] bg-[#FFF1F2] text-[#FF385C] shadow-sm"
                    : "border-[#DDDDDD] text-[#222222] hover:border-[#222222]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — Priority */}
        {step === 3 && (
          <div className="mt-6 grid gap-3">
            {PRIORITIES.map((p) => {
              const meta: Record<string, { icon: string; desc: string }> = {
                Placement: {
                  icon: "📈",
                  desc: "Rank colleges by average salary package",
                },
                Fees: {
                  icon: "💰",
                  desc: "Show most affordable colleges first",
                },
                Location: {
                  icon: "📍",
                  desc: "Prioritise colleges near your preferred city",
                },
              };
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                    priority === p
                      ? "border-[#FF385C] bg-[#FFF1F2] shadow-sm"
                      : "border-[#DDDDDD] hover:border-[#222222]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta[p].icon}</span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          priority === p ? "text-[#FF385C]" : "text-[#222222]"
                        }`}
                      >
                        {p}
                      </p>
                      <p className="text-xs text-[#717171] mt-0.5">
                        {meta[p].desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep((s) => (s - 1) as Step)}
            className={`text-sm text-[#717171] hover:text-[#222222] transition-colors ${
              step === 1 ? "invisible" : ""
            }`}
          >
            ← Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="btn-primary"
            >
              Next →
            </button>
          ) : (
            <button onClick={finish} className="btn-primary">
              Show my colleges ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}