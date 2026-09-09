"use client";

import { Flashlight, FlashlightOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    setUploading(true);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setUploading(false);
          return;
        }
        const file = new File([blob], `worksheet-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        sessionStorage.setItem("snapgrade-capture", URL.createObjectURL(file));
        setTimeout(() => setUploading(false), 900);
      },
      "image/jpeg",
      0.94,
    );
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
        <strong className="text-sm">Align Worksheet</strong>
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
        <div className="absolute right-4 top-4 grid size-16 place-items-center rounded border-2 border-dashed border-white/80 text-[7px]">
          QR target
        </div>
      </div>
      <p className="absolute bottom-36 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/55 px-3 py-2 text-xs">
        Keep page flat and inside the brackets
      </p>
      <div className="absolute inset-x-0 bottom-10 z-10 flex flex-col items-center">
        <button
          disabled={uploading || !!error}
          onClick={capture}
          className="grid size-20 place-items-center rounded-full border-4 border-white/60 bg-white p-1 disabled:opacity-60"
        >
          <span className="size-full rounded-full border-2 border-[#d7d7d7] bg-white" />
        </button>
        <span className="mt-3 text-xs font-semibold">
          {uploading ? "Uploading worksheet…" : "Capture & Grade"}
        </span>
      </div>
    </main>
  );
}
