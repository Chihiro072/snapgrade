"use client";

import { Flashlight, FlashlightOff, X } from "lucide-react";
import jsQR from "jsqr";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useGrade } from "@/lib/grade-context";

type Stage = "idle" | "uploading" | "grading";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "Capture & Grade",
  uploading: "Uploading worksheet…",
  grading: "Grading handwriting…",
};

const LESSON_QR_PREFIX = "snapgrade:lesson:";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readWorksheetLessonId(canvas: HTMLCanvasElement): string | null {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const value = jsQR(image.data, image.width, image.height, {
    inversionAttempts: "attemptBoth",
  })?.data;
  if (!value?.startsWith(LESSON_QR_PREFIX)) return null;
  const lessonId = value.slice(LESSON_QR_PREFIX.length);
  return UUID_PATTERN.test(lessonId) ? lessonId : null;
}

function CameraContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProgress } = useGrade();
  const lessonId = searchParams.get("lessonId");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [lessonTitle, setLessonTitle] = useState("");
  useEffect(() => {
    if (!lessonId) return setLessonTitle("");
    let live = true;
    getSupabaseClient()
      .from("lessons")
      .select("title")
      .eq("id", lessonId)
      .single()
      .then(({ data }) => {
        if (live) setLessonTitle(data?.title ?? "");
      });
    return () => {
      live = false;
    };
  }, [lessonId]);
  useEffect(() => {
    let live = true;
    navigator.mediaDevices
      ?.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      .then((stream) => {
        if (!live) return stream.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError("Camera access is needed to scan a worksheet."));
    return () => {
      live = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  async function toggleFlash() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const next = !flash;
      await (
        track as MediaStreamTrack & {
          applyConstraints(
            c: MediaTrackConstraints & { advanced: Array<{ torch: boolean }> },
          ): Promise<void>;
        }
      ).applyConstraints({ advanced: [{ torch: next }] });
      setFlash(next);
    } catch {
      setError("Flash is not available on this camera.");
    }
  }
  async function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const {
      data: { session },
    } = await getSupabaseClient().auth.getSession();
    if (!session) {
      setError("Please log in to grade a worksheet.");
      return;
    }

    setError("");
    setStage("uploading");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.94),
      );
      if (!blob) throw new Error("Could not capture a frame from the camera.");

      const qrLessonId = readWorksheetLessonId(canvas);
      const resolvedLessonId = qrLessonId ?? lessonId;
      if (!resolvedLessonId) {
        throw new Error(
          "Worksheet code not found. Keep the full page, including the small code at top right, inside the frame.",
        );
      }

      const file = new File([blob], `worksheet-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", resolvedLessonId);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const uploadBody = await uploadRes.json();
      if (!uploadRes.ok)
        throw new Error(uploadBody.error ?? "Upload failed.");

      setStage("grading");
      const gradeRes = await fetch("/api/grade", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionId: uploadBody.submission.id }),
      });
      const gradeBody = await gradeRes.json();
      if (!gradeRes.ok) throw new Error(gradeBody.error ?? "Grading failed.");

      refreshProgress();
      router.push(`/results?submissionId=${uploadBody.submission.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("idle");
    }
  }
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#18201f] text-white">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65" />
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5">
        <button
          onClick={() => router.back()}
          className="grid size-10 place-items-center rounded-full bg-black/45"
        >
          <X />
        </button>
        <strong className="max-w-[55%] truncate text-sm">
          {lessonTitle || "Align Worksheet"}
        </strong>
        <button
          onClick={toggleFlash}
          aria-label="Toggle flash"
          className="grid size-10 place-items-center rounded-full bg-black/45"
        >
          {flash ? <Flashlight size={19} /> : <FlashlightOff size={19} />}
        </button>
      </header>
      {error && (
        <p className="absolute left-1/2 top-20 z-10 w-[calc(100%-40px)] -translate-x-1/2 rounded-lg bg-black/65 p-3 text-center text-sm">
          {error}
        </p>
      )}
      <div className="absolute inset-x-[12%] top-[25%] bottom-[30%] z-10">
        <i className="absolute left-0 top-0 size-9 border-l-4 border-t-4" />
        <i className="absolute right-0 top-0 size-9 border-r-4 border-t-4" />
        <i className="absolute bottom-0 left-0 size-9 border-b-4 border-l-4" />
        <i className="absolute bottom-0 right-0 size-9 border-b-4 border-r-4" />
      </div>
      <p className="absolute bottom-36 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/55 px-3 py-2 text-xs">
        Keep page flat and inside the brackets
      </p>
      <div className="absolute inset-x-0 bottom-10 z-10 flex flex-col items-center">
        <button
          disabled={stage !== "idle"}
          onClick={capture}
          className="grid size-20 place-items-center rounded-full border-4 border-white/60 bg-white p-1 disabled:opacity-60"
        >
          <span className="size-full rounded-full border-2 border-[#d7d7d7] bg-white" />
        </button>
        <span className="mt-3 text-xs font-semibold">{STAGE_LABEL[stage]}</span>
      </div>
    </main>
  );
}

export default function CameraPage() {
  return (
    <Suspense fallback={null}>
      <CameraContent />
    </Suspense>
  );
}
