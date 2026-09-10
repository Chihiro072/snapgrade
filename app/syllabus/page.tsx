"use client";

import { Camera, ChevronRight, Menu, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const lessons = [
  {
    id: "a0000000-0000-4000-8000-000000000004",
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
    id: "a0000000-0000-4000-8000-000000000003",
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
    id: "a0000000-0000-4000-8000-000000000002",
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
  const router = useRouter();
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
        <h2 className="text-[18px] font-bold">P2 MOE Primary 2 Syllabus</h2>
        <span className="text-sm text-[#96a5a1]">24 Lessons Total</span>
      </div>
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <article
            key={lesson.week}
            className="rounded-[22px] border border-[#e7efeb] !bg-white p-5 shadow-[0_5px_18px_#8f786012]"
          >
            <div className="flex justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#6b958c]">{lesson.week}</p>
                <h3 className="mt-1 text-xl font-bold">{lesson.title}</h3>
              </div>
              <span
                className={`h-fit rounded-lg px-3 py-2 text-xs font-semibold ${lesson.tone}`}
              >
                {lesson.status}
              </span>
            </div>
            <div className="my-5 grid grid-cols-3 gap-3">
              {lesson.words.map(([word, pinyin]) => (
                <div
                  key={word}
                  className="flex min-h-[92px] flex-col items-center justify-center rounded-xl !bg-[#fbf8f3] p-2 text-center"
                >
                  <strong className="block text-[28px] font-extrabold">{word}</strong>
                  <small className="mt-1 text-xs text-[#93a49f]">{pinyin}</small>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 !border-t !border-[#dce8e2] pt-4">
              <button className="flex flex-1 items-center gap-2 text-base font-semibold !text-[#2f7168]">
                <Printer size={20} />
                Print A4 Worksheet (PDF)
                <ChevronRight className="ml-auto" size={21} />
              </button>
            </div>
            <button
              onClick={() => router.push(`/camera?lessonId=${lesson.id}`)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full !bg-[#2f7168] py-3 text-sm font-semibold !text-white"
            >
              <Camera size={16} />
              Scan &amp; Grade This Lesson
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
