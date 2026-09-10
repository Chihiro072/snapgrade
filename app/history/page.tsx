"use client";

import { ChevronRight, FileText, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSupabaseClient } from "@/lib/supabase";

type Attempt = {
  id: string;
  title: string;
  submitted_at: string;
  total_score: number | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    async function load() {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (live) setError("Please log in to view your practice history.");
        return;
      }

      // Only graded worksheets count as history — a pending or failed
      // submission isn't a completed attempt yet.
      const { data, error: fetchError } = await supabase
        .from("submissions")
        .select("id, submitted_at, total_score, lessons(title)")
        .eq("status", "graded")
        .order("submitted_at", { ascending: false });
      if (!live) return;
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setAttempts(
        (data ?? []).map((row) => ({
          id: row.id as string,
          title:
            (row.lessons as unknown as { title: string } | null)?.title ?? "Practice Test",
          submitted_at: row.submitted_at as string,
          total_score: row.total_score as number | null,
        })),
      );
    }
    load();
    return () => {
      live = false;
    };
  }, []);

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
      {attempts === null ? (
        <p className="py-10 text-center text-sm text-[#71847e]">
          {error || "Loading…"}
        </p>
      ) : attempts.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#71847e]">
          No graded worksheets yet — scan one to see it here.
        </p>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt) => (
            <button
              key={attempt.id}
              onClick={() => router.push(`/results?submissionId=${attempt.id}`)}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#e7efeb] !bg-white p-4 text-left shadow-[0_5px_18px_#8f786012]"
            >
              <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e8f2ed] text-[#2f7168]">
                <FileText size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-[13px]">{attempt.title}</strong>
                <small className="mt-1 block text-[10px] text-[#92a29e]">
                  {formatDate(attempt.submitted_at)}
                </small>
              </span>
              <strong className="text-[15px] text-[#2f7168]">
                {attempt.total_score != null ? `${Math.round(attempt.total_score)}%` : "—"}
              </strong>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}
