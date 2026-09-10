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

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("worksheets")
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signedUrlError || !signedUrlData) {
    return NextResponse.json(
      { error: `Could not create image URL: ${signedUrlError?.message}` },
      { status: 500 },
    );
  }

  const { data: submission, error: insertError } = await supabase
    .from("submissions")
    .insert({
      student_id: user.id,
      lesson_id: typeof lessonId === "string" && lessonId ? lessonId : null,
      image_url: signedUrlData.signedUrl,
      status: "pending",
    })
    .select("id, submitted_at, image_url, status")
    .single();
  if (insertError || !submission) {
    return NextResponse.json(
      { error: `Could not save submission: ${insertError?.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ submission }, { status: 201 });
}
