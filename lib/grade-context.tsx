"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export type Grade = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

const LEVELS: Grade[] = ["P1", "P2", "P3", "P4", "P5", "P6"];

/** A level counts as "done" once every one of its lessons has a graded
 * submission scoring at least this — same bar the Syllabus screen's
 * per-lesson status tags use. */
export const PASS_THRESHOLD = 80;

type GradeContextValue = {
  /** The student's real current level, computed from their own grading
   * history — not a manually picked value. Starts at P1. */
  grade: Grade;
  /** Levels the student has actually unlocked: P1, plus every level after
   * it whose predecessor is fully passed. */
  unlockedLevels: Grade[];
  loading: boolean;
  /** Re-fetch and recompute after a new submission is graded, so the
   * badge/lock state updates without needing a full reload. */
  refreshProgress: () => void;
};

const GradeContext = createContext<GradeContextValue | null>(null);

async function computeProgress(): Promise<{ grade: Grade; unlockedLevels: Grade[] }> {
  const fallback = { grade: "P1" as Grade, unlockedLevels: ["P1"] as Grade[] };
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return fallback;

  const [{ data: lessons }, { data: submissions }] = await Promise.all([
    supabase.from("lessons").select("id, moe_level"),
    supabase.from("submissions").select("lesson_id, total_score").eq("status", "graded"),
  ]);
  if (!lessons || lessons.length === 0) return fallback;

  const bestScoreByLesson = new Map<string, number>();
  for (const s of submissions ?? []) {
    if (!s.lesson_id || s.total_score == null) continue;
    const prev = bestScoreByLesson.get(s.lesson_id) ?? -Infinity;
    if (s.total_score > prev) bestScoreByLesson.set(s.lesson_id, s.total_score);
  }

  const lessonIdsByLevel = new Map<Grade, string[]>(LEVELS.map((l) => [l, []]));
  for (const lesson of lessons) {
    const level = lesson.moe_level as Grade;
    lessonIdsByLevel.get(level)?.push(lesson.id);
  }

  const unlockedLevels: Grade[] = [];
  let grade: Grade = "P1";
  let previousComplete = true;
  for (const level of LEVELS) {
    if (!previousComplete) break;
    unlockedLevels.push(level);
    grade = level;
    const ids = lessonIdsByLevel.get(level) ?? [];
    previousComplete =
      ids.length > 0 && ids.every((id) => (bestScoreByLesson.get(id) ?? 0) >= PASS_THRESHOLD);
  }

  return { grade, unlockedLevels };
}

export function GradeProvider({ children }: { children: ReactNode }) {
  const [grade, setGrade] = useState<Grade>("P1");
  const [unlockedLevels, setUnlockedLevels] = useState<Grade[]>(["P1"]);
  const [loading, setLoading] = useState(true);

  function refreshProgress() {
    let live = true;
    setLoading(true);
    computeProgress().then((result) => {
      if (!live) return;
      setGrade(result.grade);
      setUnlockedLevels(result.unlockedLevels);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }

  useEffect(() => {
    return refreshProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GradeContext.Provider value={{ grade, unlockedLevels, loading, refreshProgress }}>
      {children}
    </GradeContext.Provider>
  );
}

export function useGrade() {
  const ctx = useContext(GradeContext);
  if (!ctx) throw new Error("useGrade must be used within a GradeProvider");
  return ctx;
}
