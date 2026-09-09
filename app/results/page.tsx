"use client";
import { Check, RotateCcw, Share2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
const rows = [
  ["操场", "cāo chǎng", "x", "x", "ok"],
  ["礼堂", "lǐ táng", "x", "x", "x"],
  ["校园", "xiào yuán", "x", "ok", "ok"],
  ["老师", "lǎo shī", "ok", "ok", "ok"],
  ["同学", "tóng xué", "x", "ok", "ok"],
  ["教室", "jiào shì", "ok", "ok", "ok"],
  ["图书馆", "tú shū guǎn", "x", "x", "ok"],
  ["食堂", "shí táng", "ok", "ok", "ok"],
  ["花园", "huā yuán", "x", "ok", "ok"],
  ["运动场", "yùn dòng chǎng", "x", "x", "ok"],
];
export default function ResultsPage() {
  const router = useRouter();
  return (
    <AppShell showBottomNav={false} desktopNavOnly unpadded>
      <main className="mx-auto min-h-screen max-w-[430px] bg-[#f7f3ec] px-4 pb-28 pt-6 text-[#273b38] md:max-w-2xl md:px-10 md:pb-10 md:pt-12">
        <header className="flex justify-between">
          <div>
            <p className="text-[10px] text-[#90a19c]">TEST FEEDBACK</p>
            <h1 className="text-xl font-bold">Week 4 Syllabus Test</h1>
          </div>
          <span className="h-fit rounded bg-[#fff0ed] px-2 py-1 text-[9px] text-[#d36b60]">
            Needs Revision
          </span>
        </header>
        <section className="mt-5 flex gap-4 rounded-2xl bg-white p-4">
          <div className="grid size-14 place-items-center rounded-full border-[3px] !border-[#d86962] !bg-[#fff4f2] font-bold !text-[#d86962]">
            80%
          </div>
          <div>
            <strong className="block text-lg">Score: 8/10</strong>
            <small>Graded on 14 Oct, 3:12 PM</small>
            <b className="block text-[10px] text-[#d86962]">
              2 characters missed
            </b>
          </div>
        </section>
        <h2 className="mt-5 text-sm font-bold">Results over time</h2>
        <section className="mt-2 overflow-hidden rounded-xl border border-[#d6e4de] bg-white">
          <div className="grid grid-cols-[1.45fr_repeat(3,1fr)] bg-[#eaf3ef] text-[10px]">
            <span className="p-3">Character</span>
            <span className="border-l border-[#d6e4de] p-3 text-center">
              8 Oct
            </span>
            <span className="border-l border-[#d6e4de] p-3 text-center">
              10 Oct
            </span>
            <span className="border-l border-[#d6e4de] p-3 text-center">
              12 Oct
            </span>
          </div>
          {rows.map(([word, pinyin, ...marks], index) => (
            <div
              key={word}
              className={`grid min-h-12 grid-cols-[1.45fr_repeat(3,1fr)] border-t ${index % 2 ? "bg-[#fbf7f0]" : "bg-white"}`}
            >
              <span className="flex flex-col justify-center px-5 py-2">
                <strong className="block text-lg font-extrabold">{word}</strong>
                <small className="mt-1 text-xs text-[#71847e]">{pinyin}</small>
              </span>
              {marks.map((mark, i) => (
                <span
                  key={i}
                  className={`grid place-items-center border-l border-[#e6ece8] ${mark === "ok" ? "text-[#438c76]" : "text-[#d56d67]"}`}
                >
                  {mark === "ok" ? <Check size={21} /> : <X size={20} />}
                </span>
              ))}
            </div>
          ))}
        </section>
        <div className="fixed bottom-0 left-1/2 flex w-full max-w-[430px] -translate-x-1/2 gap-2 border-t border-[#e5eeea] bg-white p-4 md:static md:mt-4 md:max-w-none md:translate-x-0 md:justify-end md:border-0 md:bg-transparent md:p-0">
          <button className="flex-1 rounded-full !bg-[#e7f1ed] py-3 !text-[#2f7168] md:max-w-40">
            <Share2 className="inline" size={15} /> Share Report
          </button>
          <button
            onClick={() => router.push("/camera")}
            className="flex-1 rounded-full !bg-[#2f7168] py-3 !text-white md:max-w-40"
          >
            <RotateCcw className="inline" size={15} /> Retest Missed
          </button>
        </div>
      </main>
    </AppShell>
  );
}
