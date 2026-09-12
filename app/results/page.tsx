"use client";
import { RotateCcw, Share2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSupabaseClient } from "@/lib/supabase";
import { PINYIN_BY_CHARACTER } from "@/lib/words";

function HandDrawnCheck({ size = 21, rotate = 0 }: { size?: number; rotate?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: `rotate(${rotate - 3}deg)` }}
    >
      <path
        d="M3.8 12.2c1.6 1.3 3.5 3.1 4.9 4.8 3.1-5.4 7.3-11 11.5-15.4"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HandDrawnX({ size = 20, rotate = 0 }: { size?: number; rotate?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: `rotate(${rotate + 1}deg)` }}
    >
      <path
        d="M4.5 4.8c3.2 4.6 8.6 10 15 14.6"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M19.6 5.6c-4.3 4-9.7 9-15.2 13.6"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Submission = {
  id: string;
  submitted_at: string;
  total_score: number | null;
  status: "pending" | "graded" | "failed";
  lesson_id: string | null;
  lessons: { title: string } | null;
  image_path: string;
};

type CharacterResult = {
  submission_id: string;
  character_name: string;
  status: "correct" | "incorrect";
  box_x: number | null;
  box_y: number | null;
};

type Column = { id: string; submitted_at: string };

type ResultsData = {
  target: Submission;
  columns: Column[];
  words: string[];
  statusByKey: Map<string, "correct" | "incorrect">;
  corrections: Array<{ character: string; x: number; y: number }>;
  imageUrl: string | null;
};

function formatColumnDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatGradedDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      setError("");
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (live) {
          setError("Please log in to view results.");
          setLoading(false);
        }
        return;
      }

      const submissionSelect =
        "id, submitted_at, total_score, status, lesson_id, image_path, lessons(title)";
      let target: Submission | null = null;
      if (submissionId) {
        const { data: row, error: fetchError } = await supabase
          .from("submissions")
          .select(submissionSelect)
          .eq("id", submissionId)
          .single();
        if (fetchError || !row) {
          if (live) {
            setError("That submission could not be found.");
            setLoading(false);
          }
          return;
        }
        target = row as unknown as Submission;
      } else {
        const { data: row } = await supabase
          .from("submissions")
          .select(submissionSelect)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!row) {
          if (live) {
            setError("No worksheets scanned yet — capture one to see results here.");
            setLoading(false);
          }
          return;
        }
        target = row as unknown as Submission;
      }

      let historyQuery = supabase
        .from("submissions")
        .select("id, submitted_at")
        .eq("status", "graded")
        .order("submitted_at", { ascending: false });
      if (target.lesson_id) historyQuery = historyQuery.eq("lesson_id", target.lesson_id);
      const { data: historyRaw } = await historyQuery;
      // Render every real attempt. First scan: one column; later scans add
      // another date column.
      const uniqueHistory = new Map<string, Column>();
      for (const entry of historyRaw ?? []) uniqueHistory.set(entry.id, entry);
      uniqueHistory.set(target.id, { id: target.id, submitted_at: target.submitted_at });
      const columns = [...uniqueHistory.values()].sort(
        (a, b) => a.submitted_at.localeCompare(b.submitted_at),
      );

      const ids = columns.map((column) => column.id);
      const { data: resultsRaw } = await supabase
        .from("character_results")
        .select("submission_id, character_name, status, box_x, box_y, created_at")
        .in("submission_id", ids)
        .order("created_at", { ascending: true });

      const results = (resultsRaw ?? []) as CharacterResult[];
      const targetResults = results.filter((r) => r.submission_id === target!.id);
      const words = targetResults.map((r) => r.character_name);
      const statusByKey = new Map<string, "correct" | "incorrect">();
      for (const r of results) statusByKey.set(`${r.submission_id}:${r.character_name}`, r.status);
      const corrections = targetResults
        .filter(
          (result): result is CharacterResult & { box_x: number; box_y: number } =>
            result.status === "incorrect" && result.box_x != null && result.box_y != null,
        )
        .map((result) => ({ character: result.character_name, x: result.box_x, y: result.box_y }));
      let imageUrl: string | null = null;
      if (target.image_path) {
        const { data: signed } = await supabase.storage
          .from("worksheets")
          .createSignedUrl(target.image_path, 60 * 60);
        imageUrl = signed?.signedUrl ?? null;
      }
      const targetWords = new Set(words);
      // Older fallback scans may use a different word list. Keep them in
      // History, but not in this lesson's comparison table as an empty column.
      const comparableColumns = columns.filter((column) =>
        results.some(
          (result) =>
            result.submission_id === column.id && targetWords.has(result.character_name),
        ),
      );
      if (live) {
        setData({
          target: target!,
          columns: comparableColumns,
          words,
          statusByKey,
          corrections,
          imageUrl,
        });
        setLoading(false);
      }
    }
    load();
    return () => {
      live = false;
    };
  }, [submissionId]);

  if (loading) {
    return (
      <AppShell showBottomNav={false} desktopNavOnly unpadded>
        <main className="mx-auto grid min-h-screen max-w-[430px] place-items-center bg-[#f7f3ec] px-4 text-[#273b38] md:max-w-2xl">
          <p className="text-sm text-[#71847e]">Loading results…</p>
        </main>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell showBottomNav={false} desktopNavOnly unpadded>
        <main className="mx-auto grid min-h-screen max-w-[430px] place-items-center gap-4 bg-[#f7f3ec] px-4 text-center text-[#273b38] md:max-w-2xl">
          <p className="text-sm text-[#71847e]">{error}</p>
          <button
            onClick={() => router.push("/camera")}
            className="rounded-full !bg-[#2f7168] px-5 py-3 text-sm !text-white"
          >
            Scan a worksheet
          </button>
        </main>
      </AppShell>
    );
  }

  const { target, columns, words, statusByKey, corrections, imageUrl } = data;
  const correctCount = words.filter(
    (w) => statusByKey.get(`${target.id}:${w}`) === "correct",
  ).length;
  const missedCount = words.length - correctCount;
  const percent = target.total_score ?? 0;
  const isGood = target.status === "graded" && percent >= 80;

  const badgeText =
    target.status === "pending"
      ? "Grading…"
      : target.status === "failed"
        ? "Grading Failed"
        : isGood
          ? "On Track"
          : "Needs Revision";
  const badgeClass =
    target.status === "pending"
      ? "bg-[#eef1ef] text-[#71847e]"
      : target.status === "failed" || !isGood
        ? "bg-[#fff0ed] text-[#d36b60]"
        : "bg-[#e7f1ed] text-[#2f7168]";
  const circleColor = target.status === "failed" || !isGood ? "#d86962" : "#2f7168";
  const circleBg = target.status === "failed" || !isGood ? "#fff4f2" : "#eaf5f1";

  return (
    <AppShell showBottomNav={false} desktopNavOnly unpadded>
      <main className="mx-auto min-h-screen max-w-[430px] bg-[#f7f3ec] px-4 pb-28 pt-6 text-[#273b38] md:max-w-2xl md:px-10 md:pb-10 md:pt-12">
        <header className="flex justify-between">
          <div>
            <p className="text-[10px] text-[#90a19c]">TEST FEEDBACK</p>
            <h1 className="text-xl font-bold">
              {target.lessons?.title ?? "Practice Test"}
            </h1>
          </div>
          <span className={`h-fit rounded px-2 py-1 text-[9px] ${badgeClass}`}>
            {badgeText}
          </span>
        </header>
        <section className="mt-5 flex gap-4 rounded-2xl bg-white p-4">
          <div
            className="grid size-14 place-items-center rounded-full border-[3px] font-bold"
            style={{ borderColor: circleColor, background: circleBg, color: circleColor }}
          >
            {target.status === "graded" ? `${Math.round(percent)}%` : "…"}
          </div>
          <div>
            <strong className="block text-lg">
              {target.status === "graded"
                ? `Score: ${correctCount}/${words.length}`
                : target.status === "pending"
                  ? "Grading in progress…"
                  : "Grading failed"}
            </strong>
            <small>Graded on {formatGradedDate(target.submitted_at)}</small>
            {target.status === "graded" && (
              <b className="block text-[10px] text-[#d86962]">
                {missedCount} character{missedCount === 1 ? "" : "s"} missed
              </b>
            )}
          </div>
        </section>
        {imageUrl && (
          <>
            <h2 className="mt-5 text-sm font-bold">Corrected Worksheet</h2>
            <section className="relative mt-2 overflow-hidden rounded-xl border border-[#d6e4de] bg-white">
              <img src={imageUrl} alt="Captured worksheet" className="block w-full" />
              {target.status === "graded" && corrections.map((mark, index) => (
                <span
                  key={`${mark.character}-${index}`}
                  className="pointer-events-none absolute rounded bg-white/85 px-1.5 text-lg font-bold text-[#df3128] shadow-sm"
                  style={{
                    left: `${mark.x * 100}%`,
                    top: `${mark.y * 100}%`,
                    fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive',
                    transform: "translate(-50%, -50%) rotate(-5deg)",
                  }}
                >
                  {mark.character}
                </span>
              ))}
            </section>
          </>
        )}
        <h2 className="mt-5 text-sm font-bold">Results over time</h2>
        <section className="mt-2 overflow-x-auto rounded-xl border border-[#d6e4de] bg-white">
          <div
            className="grid min-w-max bg-[#eaf3ef] text-[10px]"
            style={{ gridTemplateColumns: `145px repeat(${columns.length}, 82px)` }}
          >
            <span className="p-3">Character</span>
            {columns.map((col, i) => (
              <span key={i} className="border-l border-[#d6e4de] p-3 text-center">
                {formatColumnDate(col.submitted_at)}
              </span>
            ))}
          </div>
          {words.length === 0 ? (
            <p className="p-5 text-center text-xs text-[#71847e]">
              No characters graded yet.
            </p>
          ) : (
            words.map((word, index) => (
              <div
                key={word}
                className={`grid min-w-max min-h-12 border-t ${index % 2 ? "bg-[#fbf7f0]" : "bg-white"}`}
                style={{ gridTemplateColumns: `145px repeat(${columns.length}, 82px)` }}
              >
                <span className="flex flex-col justify-center px-5 py-2">
                  <strong className="block text-lg font-extrabold">{word}</strong>
                  {PINYIN_BY_CHARACTER[word] && (
                    <small className="mt-1 text-xs text-[#71847e]">
                      {PINYIN_BY_CHARACTER[word]}
                    </small>
                  )}
                </span>
                {columns.map((col, i) => {
                  const mark = statusByKey.get(`${col.id}:${word}`);
                  return (
                    <span
                      key={i}
                      className={`grid place-items-center border-l border-[#e6ece8] ${mark === "correct" ? "text-[#438c76]" : mark === "incorrect" ? "text-[#d56d67]" : "text-[#c7d0cc]"}`}
                    >
                      {mark === "correct" ? (
                        <HandDrawnCheck size={21} rotate={((index + i) % 3) - 1} />
                      ) : mark === "incorrect" ? (
                        <HandDrawnX size={20} rotate={((index + i) % 3) - 1} />
                      ) : (
                        "–"
                      )}
                    </span>
                  );
                })}
              </div>
            ))
          )}
        </section>
        <div className="fixed bottom-0 left-1/2 flex w-full max-w-[430px] -translate-x-1/2 gap-2 border-t border-[#e5eeea] bg-white p-4 md:static md:mt-4 md:max-w-none md:translate-x-0 md:justify-end md:border-0 md:bg-transparent md:p-0">
          <button className="flex-1 rounded-full !bg-[#e7f1ed] py-3 !text-[#2f7168] md:max-w-40">
            <Share2 className="inline" size={15} /> Share Report
          </button>
          <button
            onClick={() => router.push("/camera")}
            className="flex-1 rounded-full !bg-[#2f7168] py-3 !text-white md:max-w-40"
          >
            <RotateCcw className="inline" size={15} /> Retest Missed
          </button>
        </div>
      </main>
    </AppShell>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}
