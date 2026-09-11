import { NextResponse } from "next/server";
import { gradeWorksheet } from "@/lib/grading";
import { getSupabaseServerClient } from "@/lib/supabase";
import { extractWords } from "@/lib/words";
import {
  identifyWorksheetLesson,
  WorksheetNotIdentifiedError,
  type WorksheetCandidate,
} from "@/lib/worksheet-identification";

export const runtime = "nodejs";
// Vision-model calls and Storage downloads can exceed Vercel's short default.
// This remains within the maximum duration available on Vercel Hobby.
export const maxDuration = 60;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const accessToken = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing or malformed Authorization header." },
      { status: 401 },
    );
  }

  const { submissionId } = await request.json().catch(() => ({}));
  if (typeof submissionId !== "string" || !submissionId) {
    return NextResponse.json(
      { error: "Missing 'submissionId'." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "Your session has expired. Please sign in again." },
      { status: 401 },
    );
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, image_path, lesson_id")
    .eq("id", submissionId)
    .single();
  if (submissionError || !submission) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  }

  let words: string[] = [];
  let resolvedLessonId = submission.lesson_id as string | null;
  if (submission.lesson_id) {
    const { data: lesson } = await supabase
      .from("lessons")
      .select("word_list")
      .eq("id", submission.lesson_id)
      .single();
    const extracted = extractWords(lesson?.word_list);
    if (extracted.length > 0) words = extracted;
  }

  try {
    const { data: imageBlob, error: downloadError } = await supabase.storage
      .from("worksheets")
      .download(submission.image_path);
    if (downloadError || !imageBlob)
      throw new Error(`Could not download worksheet image: ${downloadError?.message}`);
    const mimeType = imageBlob.type || "image/jpeg";
    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    const imageBase64 = imageBuffer.toString("base64");

    // Dashboard scans have no selected course. Identify the printed worksheet
    // against the real Syllabus first, then grade only with that lesson's list.
    if (!resolvedLessonId) {
      const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, title, moe_level, week_number, word_list");
      if (lessonsError || !lessons) throw new Error("Could not load Syllabus lessons.");
      const candidates: WorksheetCandidate[] = lessons
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          moeLevel: lesson.moe_level,
          weekNumber: lesson.week_number,
          words: extractWords(lesson.word_list),
        }))
        .filter((lesson) => lesson.words.length > 0);
      resolvedLessonId = await identifyWorksheetLesson(imageBase64, mimeType, candidates);
      const matched = candidates.find((lesson) => lesson.id === resolvedLessonId);
      if (!matched) throw new Error("Matched worksheet lesson is no longer available.");
      words = matched.words;
      const { error: linkError } = await supabase
        .from("submissions")
        .update({ lesson_id: resolvedLessonId })
        .eq("id", submission.id);
      if (linkError) throw new Error(`Could not link worksheet to its lesson: ${linkError.message}`);
    }
    if (words.length === 0) throw new Error("This worksheet has no words to grade.");

    const results = await gradeWorksheet(imageBase64, mimeType, words);
    const correctCount = results.filter((r) => r.status === "correct").length;
    const totalScore = Math.round((correctCount / results.length) * 10000) / 100;

    const { error: resultsError } = await supabase
      .from("character_results")
      .insert(
        results.map((r) => ({
          submission_id: submission.id,
          character_name: r.character,
          status: r.status,
          box_x: r.x ?? null,
          box_y: r.y ?? null,
        })),
      );
    if (resultsError)
      throw new Error(`Could not save character results: ${resultsError.message}`);

    const { data: updated, error: updateError } = await supabase
      .from("submissions")
      .update({ total_score: totalScore, status: "graded" })
      .eq("id", submission.id)
      .select("id, submitted_at, image_path, total_score, status")
      .single();
    if (updateError || !updated)
      throw new Error(`Could not update submission: ${updateError?.message}`);

    return NextResponse.json({ submission: updated, results });
  } catch (error) {
    await supabase
      .from("submissions")
      .update({ status: "failed" })
      .eq("id", submission.id);
    const message = error instanceof Error ? error.message : "Grading failed.";
    return NextResponse.json(
      { error: message },
      { status: error instanceof WorksheetNotIdentifiedError ? 422 : 502 },
    );
  }
}
