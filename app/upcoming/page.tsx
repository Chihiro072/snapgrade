"use client";
import { CalendarDays } from "lucide-react";
import { AppShell } from "@/components/app-shell";
export default function UpcomingPage() {
  return (
    <AppShell>
      <section className="flex gap-3 rounded-2xl bg-white p-5">
        <CalendarDays className="text-[#2f7168]" />
        <div>
          <strong>Week 4 Spelling Test</strong>
          <p>Wednesday, 14 Oct at 3:00 PM</p>
        </div>
      </section>
    </AppShell>
  );
}
