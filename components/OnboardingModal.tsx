"use client";

import { useEffect, useState } from "react";

type Step = 1 | 2 | 3;

const STREAMS = ["Engineering", "Medical", "Law", "Commerce"];
const EXAMS = ["JEE", "NEET", "CUET", "CLAT", "State"];
const PRIORITIES = ["Placement", "Fees", "Location"];

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
  onComplete: (data: {
    stream: string;
    exam: string;
    priority: string;
  }) => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">

        {/* PROGRESS BAR */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-colors ${
                n <= step ? "bg-blue-600" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>

        {/* STEP LABEL */}
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600 mb-2">
          Step {step} of 3
        </p>

        {/* TITLE */}
        <h2 className="text-xl font-bold text-neutral-900">
          {STEP_TITLES[step - 1]}
        </h2>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          {STEP_SUBTITLES[step - 1]}
        </p>

        {/* STEP 1 — STREAM */}
        {step === 1 && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {STREAMS.map((s) => (
              <button
                key={s}
                onClick={() => setStream(s)}
                className={`rounded-2xl border px-4 py-4 text-sm font-medium text-left transition-colors ${
                  stream === s
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — EXAM */}
        {step === 2 && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {EXAMS.map((e) => (
              <button
                key={e}
                onClick={() => setExam(e)}
                className={`rounded-2xl border px-4 py-4 text-sm font-medium text-left transition-colors ${
                  exam === e
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* STEP 3 — PRIORITY */}
        {step === 3 && (
          <div className="mt-6 grid gap-3">
            {PRIORITIES.map((p) => {
              const desc: Record<string, string> = {
                Placement: "Rank colleges by average salary package",
                Fees: "Show most affordable colleges first",
                Location: "Prioritise colleges near your preferred city",
              };
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                    priority === p
                      ? "border-blue-600 bg-blue-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <p className={`text-sm font-medium ${priority === p ? "text-blue-700" : "text-neutral-900"}`}>
                    {p}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{desc[p]}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep((s) => (s - 1) as Step)}
            className={`text-sm text-neutral-500 hover:text-neutral-800 transition-colors ${
              step === 1 ? "invisible" : ""
            }`}
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finish}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Show my colleges
            </button>
          )}
        </div>
      </div>
    </div>
  );
}