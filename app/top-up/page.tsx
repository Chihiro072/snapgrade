"use client";
import { AppShell } from "@/components/app-shell";
const bundles = [
  ["5 lessons", "$4.90"],
  ["10 lessons", "$8.90"],
  ["20 lessons", "$15.90"],
];
export default function TopUpPage() {
  return (
    <AppShell>
      <p className="text-[10px] tracking-wide text-[#90a19c]">LESSON CREDITS</p>
      <h1 className="mt-1 text-2xl">Top up credits</h1>
      <section className="mt-6 rounded-2xl bg-white p-5">
        <h2 className="text-lg">Choose a credit bundle</h2>
        {bundles.map(([name, price]) => (
          <button
            key={name}
            className="mt-3 flex w-full justify-between rounded-xl border p-4"
          >
            <strong>{name}</strong>
            <b>{price}</b>
          </button>
        ))}
        <button className="mt-5 w-full rounded-lg bg-[#2f7168] p-3 text-white">
          Continue to payment
        </button>
      </section>
    </AppShell>
  );
}
