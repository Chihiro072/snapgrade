"use client";
import { Bell } from "lucide-react";
import { AppShell } from "@/components/app-shell";
const notifications = [
  "Your Week 4 test is ready",
  "Great progress, Sarah",
  "Credits expire soon",
];
export default function NotificationsPage() {
  return (
    <AppShell>
      <p className="text-[10px] tracking-wide text-[#90a19c]">
        STAY IN THE LOOP
      </p>
      <h1 className="mt-1 text-2xl">Notifications</h1>
      <section className="mt-6 rounded-2xl bg-white p-5">
        {notifications.map((x) => (
          <div key={x} className="flex gap-3 border-b py-4 last:border-0">
            <Bell size={17} />
            <strong>{x}</strong>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
