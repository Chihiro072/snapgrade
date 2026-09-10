"use client";

import { ChevronRight, Menu, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getSupabaseClient } from "@/lib/supabase";
import { extractWords } from "@/lib/words";

type Level = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

const LEVELS: Level[] = ["P1", "P2", "P3", "P4", "P5", "P6"];

const TONE_CLASS: Record<string, string> = {
  green: "bg-[#e7f4ed] text-[#4f9278]",
  amber: "bg-[#fff5dc] text-[#ba8a2f]",
  red: "bg-[#fff0ed] text-[#d36b60]",
};

type LessonRow = {
  id: string;
  title: string;
  pinyin: string;
  week_number: number | null;
  status_label: string;
  status_tone: string;
  word_list: unknown;
};

export default function SyllabusPage() {
  const [level, setLevel] = useState<Level>("P2");
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [printError, setPrintError] = useState<{ lessonId: string; message: string } | null>(
    null,
  );

  useEffect(() => {
    let live = true;
    setLoading(true);
    setLoadError("");
    getSupabaseClient()
      .from("lessons")
      .select("id, title, pinyin, week_number, status_label, status_tone, word_list")
      .eq("moe_level", level)
      .order("week_number", { ascending: true })
      .then(({ data, error }) => {
        if (!live) return;
        if (error) {
          setLoadError(error.message);
        } else {
          setLessons((data ?? []) as LessonRow[]);
        }
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [level]);

  async function printWorksheet(lessonId: string) {
    setPrintError(null);
    setPrintingId(lessonId);
    try {
      const {
        data: { session },
      } = await getSupabaseClient().auth.getSession();
      if (!session) throw new Error("Please log in to print a worksheet.");

      const res = await fetch(`/api/worksheet?lessonId=${lessonId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not generate the worksheet.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      setPrintError({
        lessonId,
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setPrintingId(null);
    }
  }

  return (
    <AppShell>
      <header className="mb-5 flex justify-between">
        <div>
          <p className="text-[10px] tracking-wide text-[#90a19c]">
            MOE {level} SYLLABUS
          </p>
          <h1 className="mt-1 text-2xl tracking-tight">Chinese Syllabus</h1>
        </div>
        <Menu className="mt-1 text-[#71847e]" size={21} />
      </header>
      <div className="mb-5 flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`h-10 w-[68px] rounded-full border text-base shadow-[0_2px_7px_#31584b14] ${l === level ? "!border-[#2f7168] !bg-[#2f7168] font-bold !text-white" : "!border-[#e1ebe6] !bg-white font-semibold text-[#506762]"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-bold">
          {level} MOE Primary {level.slice(1)} Syllabus
        </h2>
        <span className="text-sm text-[#96a5a1]">24 Lessons Total</span>
      </div>
      {loading ? (
        <p className="py-10 text-center text-sm text-[#71847e]">Loading lessons…</p>
      ) : loadError ? (
        <p className="py-10 text-center text-sm text-[#d36b60]">{loadError}</p>
      ) : lessons.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#71847e]">
          No lessons found for {level} yet.
        </p>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const words = extractWords(lesson.word_list) as string[];
            const wordPairs: [string, string][] = (
              lesson.word_list as { word: string; pinyin: string }[]
            ).map((w) => [w.word, w.pinyin]);
            return (
              <article
                key={lesson.id}
                className="rounded-[22px] border border-[#e7efeb] !bg-white p-5 shadow-[0_5px_18px_#8f786012]"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#6b958c]">
                      {lesson.week_number ? `Week ${lesson.week_number}` : ""}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">{lesson.title}</h3>
                  </div>
                  <span
                    className={`h-fit rounded-lg px-3 py-2 text-xs font-semibold ${TONE_CLASS[lesson.status_tone] ?? TONE_CLASS.amber}`}
                  >
                    {lesson.status_label}
                  </span>
                </div>
                <div className="my-5 grid grid-cols-3 gap-3">
                  {(wordPairs.length ? wordPairs : words.map((w) => [w, ""] as [string, string])).map(
                    ([word, pinyin]) => (
                      <div
                        key={word}
                        className="flex min-h-[92px] flex-col items-center justify-center rounded-xl !bg-[#fbf8f3] p-2 text-center"
                      >
                        <strong className="block text-[28px] font-extrabold">{word}</strong>
                        {pinyin && (
                          <small className="mt-1 text-xs text-[#93a49f]">{pinyin}</small>
                        )}
                      </div>
                    ),
                  )}
                </div>
                <div className="flex items-center gap-2 !border-t !border-[#dce8e2] pt-4">
                  <button
                    onClick={() => printWorksheet(lesson.id)}
                    disabled={printingId === lesson.id}
                    className="flex flex-1 items-center gap-2 text-base font-semibold !text-[#2f7168] disabled:opacity-50"
                  >
                    <Printer size={20} />
                    {printingId === lesson.id
                      ? "Preparing worksheet…"
                      : "Print A4 Worksheet (PDF)"}
                    <ChevronRight className="ml-auto" size={21} />
                  </button>
                </div>
                {printError?.lessonId === lesson.id && (
                  <p className="mt-2 text-xs text-[#d36b60]">{printError.message}</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
