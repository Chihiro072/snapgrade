import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { renderWorksheetPdf } from "@/lib/worksheet";
import { extractWords } from "@/lib/words";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  const authHeader = request.headers.get("authorization") ?? "";
  const accessToken = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing or malformed Authorization header." },
      { status: 401 },
    );
  }
  if (!lessonId) {
    return NextResponse.json({ error: "Missing 'lessonId'." }, { status: 400 });
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

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("title, moe_level, week_number, word_list")
    .eq("id", lessonId)
    .single();
  if (lessonError || !lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const wordList = extractWords(lesson.word_list);

  const pdfBytes = await renderWorksheetPdf({
    title: lesson.title,
    moe_level: lesson.moe_level,
    week_number: lesson.week_number,
    word_list: wordList,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(lesson.title)}.pdf"`,
    },
  });
}
