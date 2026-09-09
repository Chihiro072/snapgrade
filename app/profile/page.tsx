"use client";
import { AppShell } from "@/components/app-shell";
const fields = [
  ["Name", "Sarah"],
  ["Learner", "Lucas"],
  ["Class", "Primary 2"],
  ["Notifications", "On"],
];
export default function ProfilePage() {
  return (
    <AppShell>
      <p className="text-[10px] tracking-wide text-[#90a19c]">ACCOUNT</p>
      <h1 className="mt-1 text-2xl">Your profile</h1>
      <section className="mt-6 rounded-2xl bg-white p-5">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-b py-4 last:border-0"
          >
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
