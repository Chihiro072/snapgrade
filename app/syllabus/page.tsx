"use client";

import { ChevronRight, Menu, Printer } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const lessons = [
  {
    week: "Week 4",
    title: "第十课 - 我们的校园",
    pinyin: "wǒ men de xiào yuán",
    status: "Pending Practice",
    tone: "bg-[#fff5dc] text-[#ba8a2f]",
    words: [
      ["校园", "xiào yuán"],
      ["操场", "cāo chǎng"],
      ["老师", "lǎo shī"],
      ["礼堂", "lǐ táng"],
    ],
  },
  {
    week: "Week 3",
    title: "第九课 - 我爱我的家",
    pinyin: "wǒ ài wǒ de jiā",
    status: "Completed (80%)",
    tone: "bg-[#e7f4ed] text-[#4f9278]",
    words: [
      ["爸爸", "bà ba"],
      ["妈妈", "mā ma"],
      ["温暖", "wēn nuǎn"],
    ],
  },
  {
    week: "Week 2",
    title: "第八课 - 快乐的周末",
    pinyin: "kuài lè de zhōu mò",
    status: "Needs Revision",
    tone: "bg-[#fff0ed] text-[#d36b60]",
    words: [
      ["玩耍", "wán shuǎ"],
      ["公园", "gōng yuán"],
    ],
  },
];

export default function SyllabusPage() {
  return (
    <AppShell>
      <header className="mb-5 flex justify-between">
        <div>
          <p className="text-[10px] tracking-wide text-[#90a19c]">
            MOE PRIMARY 2 SYLLABUS
          </p>
          <h1 className="mt-1 text-2xl tracking-tight">Chinese Syllabus</h1>
        </div>
        <Menu className="mt-1 text-[#71847e]" size={21} />
      </header>
      <div className="mb-5 flex gap-2">
        {["P1", "P2", "P3", "P4", "P5", "P6"].map((level) => (
          <button
            key={level}
          className={`h-10 w-[68px] rounded-full border text-base shadow-[0_2px_7px_#31584b14] ${level === "P2" ? "!border-[#2f7168] !bg-[#2f7168] font-bold !text-white" : "!border-[#e1ebe6] !bg-white font-semibold text-[#506762]"}`}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px]">P2 MOE Primary 2 Syllabus</h2>
        <span className="text-[11px] text-[#96a5a1]">24 Lessons Total</span>
      </div>
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <article
            key={lesson.week}
            className="rounded-2xl border border-[#e7efeb] bg-white p-[18px] shadow-[0_5px_18px_#8f786012]"
          >
            <div className="flex justify-between gap-2">
              <div>
                <p className="text-[11px] text-[#90a19c]">{lesson.week}</p>
                <h3 className="mt-1 text-base">{lesson.title}</h3>
                <p className="mt-1 text-[11px] text-[#92a29e]">
                  {lesson.pinyin}
                </p>
              </div>
              <span
                className={`h-fit rounded-md px-2 py-1.5 text-[10px] ${lesson.tone}`}
              >
                {lesson.status}
              </span>
            </div>
            <div className="my-4 flex gap-2">
              {lesson.words.map(([word, pinyin]) => (
                <div
                  key={word}
                  className="min-w-16 rounded-lg bg-[#fafcfb] p-2.5"
                >
                  <strong className="block text-[17px]">{word}</strong>
                  <small className="text-[9px] text-[#93a49f]">{pinyin}</small>
                </div>
              ))}
            </div>
            <button className="flex w-full items-center gap-1 border-t border-[#edf2ef] pt-3 text-[11px] text-[#607b73]">
              <Printer size={15} />
              Print A4 Worksheet (PDF)
              <ChevronRight className="ml-auto" size={15} />
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
