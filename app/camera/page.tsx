"use client";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
export default function CameraPage() {
  const router = useRouter();
  return (
    <main className="grid min-h-screen place-items-center bg-[#202524] text-white">
      <button
        onClick={() => router.push("/results")}
        className="flex flex-col items-center gap-4"
      >
        <Camera size={56} />
        <span className="rounded-full bg-white px-6 py-3 font-bold text-[#2f7168]">
          Capture & Grade
        </span>
      </button>
    </main>
  );
}
