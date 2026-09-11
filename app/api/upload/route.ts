import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const accessToken = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing or malformed Authorization header." },
      { status: 401 },
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

  const formData = await request.formData();
  const file = formData.get("file");
  const lessonId = formData.get("lessonId");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Missing 'file' in the upload." },
      { status: 400 },
    );
  }
  if (typeof lessonId !== "string" || !lessonId) {
    return NextResponse.json(
      { error: "Select and print a Syllabus worksheet before scanning." },
      { status: 400 },
    );
  }

  const extension = file.type === "image/png" ? "png" : "jpg";
  const path = `${user.id}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("worksheets")
    .upload(path, file, { contentType: file.type || "image/jpeg" });
  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  // Store the storage path, not a signed URL — the bucket is private, so
  // any browser-usable link has to be generated fresh (and expires) rather
  // than saved permanently. See schema.sql's comment on `image_path`.
  const { data: submission, error: insertError } = await supabase
    .from("submissions")
    .insert({
      student_id: user.id,
      lesson_id: lessonId,
      image_path: path,
      status: "pending",
    })
    .select("id, submitted_at, image_path, status")
    .single();
  if (insertError || !submission) {
    return NextResponse.json(
      { error: `Could not save submission: ${insertError?.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ submission }, { status: 201 });
}
