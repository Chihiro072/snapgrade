"use client";

import { Check, ChevronRight, FileText, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const attempts = [
  {
    title: "Week 4 Syllabus Test",
    date: "14 Oct 2026 · 3:12 PM",
    score: "80%",
    icon: FileText,
  },
  {
    title: "Week 3 Character Review",
    date: "09 Oct 2026 · 4:20 PM",
    score: "92%",
    icon: Check,
  },
  {
    title: "Week 2 Syllabus Test",
    date: "09 Oct 2026 · 4:20 PM",
    score: "92%",
    icon: Check,
  },
];

export default function HistoryPage() {
  const router = useRouter();
  return (
    <AppShell>
      <section className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-wide text-[#90a19c]">
            YOUR PRACTICE LOG
          </p>
          <h1 className="mt-1 text-2xl tracking-tight">History</h1>
        </div>
        <button aria-label="History options" className="p-1 text-[#71847e]">
          <Menu size={21} />
        </button>
      </section>
      <div className="space-y-3">
        {attempts.map(({ title, date, score, icon: Icon }) => (
          <button
            key={title}
            onClick={() => router.push("/results")}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#e7efeb] bg-white p-4 text-left shadow-[0_5px_18px_#8f786012]"
          >
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e8f2ed] text-[#2f7168]">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-[13px]">{title}</strong>
              <small className="mt-1 block text-[10px] text-[#92a29e]">
                {date}
              </small>
            </span>
            <strong className="text-[15px] text-[#2f7168]">{score}</strong>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
    </AppShell>
  );
}
