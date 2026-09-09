"use client";
import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
const benefits = [
  "Unlimited worksheet grading",
  "Detailed progress insights",
  "Printable revision packs",
];
export default function PremiumPage() {
  return (
    <AppShell>
      <p className="text-[10px] tracking-wide text-[#90a19c]">TING XIE PLUS</p>
      <h1 className="mt-1 text-2xl">Practice with more support</h1>
      <section className="mt-6 rounded-2xl bg-white p-5">
        {benefits.map((x) => (
          <p key={x} className="my-4 flex gap-2">
            <Check size={18} />
            {x}
          </p>
        ))}
        <button className="w-full rounded-lg bg-[#2f7168] p-3 text-white">
          Explore Premium
        </button>
      </section>
    </AppShell>
  );
}
