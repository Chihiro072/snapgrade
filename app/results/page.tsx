"use client";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
export default function ResultsPage() {
  const router = useRouter();
  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-[#f7f3ec] p-5">
      <p className="text-[10px] text-[#90a19c]">TEST FEEDBACK</p>
      <h1 className="mt-1 text-2xl">Week 4 Syllabus Test</h1>
      <section className="mt-5 rounded-2xl bg-white p-5">
        <b className="text-xl">Score: 8/10</b>
        <p className="mt-2 text-red-500">2 characters missed</p>
      </section>
      <h2 className="mt-6 font-bold">Results over time</h2>
      <div className="mt-3 rounded-xl bg-white p-4">
        Character results available.
      </div>
      <button
        onClick={() => router.push("/camera")}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f7168] p-3 font-bold text-white"
      >
        <RotateCcw size={18} />
        Retest Missed
      </button>
    </main>
  );
}
