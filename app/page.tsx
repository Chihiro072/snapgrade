"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell as SharedAppShell } from "@/components/app-shell";
import {
  Bell,
  BookOpen,
  Camera as CameraIcon,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  CircleHelp,
  Clock3,
  FileText,
  Home,
  LockKeyhole,
  Menu,
  Play,
  Printer,
  RotateCcw,
  ScanLine,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const teal = "#2f7168";
const masteryChange = "+3.1% this month";
const lessons = [
  {
    week: "Week 4",
    title: "第十课 - 我们的校园",
    pinyin: "wǒ men de xiào yuán",
    words: [
      ["校园", "xiào yuán"],
      ["操场", "cāo chǎng"],
      ["老师", "lǎo shī"],
      ["礼堂", "lǐ táng"],
    ],
    status: "Pending Practice",
    tone: "amber",
  },
  {
    week: "Week 3",
    title: "第九课 - 我爱我的家",
    pinyin: "wǒ ài wǒ de jiā",
    words: [
      ["爸爸", "bà ba"],
      ["妈妈", "mā ma"],
      ["温暖", "wēn nuǎn"],
    ],
    status: "Completed (80%)",
    tone: "green",
  },
  {
    week: "Week 2",
    title: "第八课 - 快乐的周末",
    pinyin: "kuài lè de zhōu mò",
    words: [
      ["玩耍", "wán shuǎ"],
      ["公园", "gōng yuán"],
    ],
    status: "Needs Revision",
    tone: "red",
  },
];
const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/syllabus", label: "Syllabus", icon: BookOpen },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/premium", label: "Premium", icon: Star },
];

function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand-lockup"
          onClick={() => router.push("/")}
          aria-label="Go to dashboard"
        >
          <span className="brand-mark">S</span>
          <span className="brand-name">Ting Xie</span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(({ href, label }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={path === href ? "active" : ""}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="topbar-tools">
          <button className="class-pill">
            Lucas – Primary 2 <ChevronDown size={13} />
          </button>
          <button
            className="icon-btn"
            onClick={() => router.push("/notifications")}
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <button
            className="profile-chip"
            onClick={() => router.push("/profile")}
          >
            <span className="profile-avatar">S</span>
            <span>
              <small>Welcome back,</small>
              <strong>Sarah</strong>
            </span>
          </button>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <nav className="bottom-nav">
        {nav.map(({ href, label, icon: Icon }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={path === href ? "active" : ""}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ProgressCard() {
  const router = useRouter();
  return (
    <section className="credit-card">
      <div className="card-top">
        <div>
          <span className="eyebrow">PREPAID LESSON CREDITS</span>
          <div className="credit-number">
            12 <small>of 20 Remaining</small>
          </div>
        </div>
        <button className="dark-button" onClick={() => router.push("/top-up")}>
          Top Up
        </button>
      </div>
      <div className="progress">
        <span style={{ width: "60%" }} />
      </div>
      <p>Credits expire on 30 Nov 2026</p>
    </section>
  );
}
function Dashboard() {
  const router = useRouter();
  return (
    <>
      <ProgressCard />
      <div className="stats-row">
        <div className="stat-card">
          <span>
            MASTERY RATE <CircleCheckBig size={22} strokeWidth={2.4} className="!text-[#648c82]" />
          </span>
          <strong>82.4%</strong>
          <small className={masteryChange.startsWith("-") ? "!text-[#d56d67]" : "!text-[#4f9278]"}>{masteryChange}</small>
        </div>
        <div className="stat-card">
          <span>
            PRACTICED <BookOpen size={18} className="!text-[#bfa061]" />
          </span>
          <strong>48 Characters</strong>
          <small>8 lists covered</small>
        </div>
      </div>
      <section>
        <div className="row-heading">
          <h2>Upcoming Ting Xie</h2>
          <button onClick={() => router.push("/upcoming")}>
            View All <ChevronRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-6 gap-1 rounded-[22px] border border-[#e5eeea] !bg-white p-3 shadow-[0_2px_8px_#31584b0d]">
          {["Mon|12", "Tue|13", "Wed|14", "Thu|15", "Fri|16", "Sat|17"].map(
            (d, i) => {
              let [a, b] = d.split("|");
              return (
                <div className={`grid h-[78px] grid-rows-[16px_24px_8px] content-center justify-items-center gap-2 rounded-[18px] ${i === 2 ? "border-2 border-[#7da59b] !bg-[#edf5f1] text-[#2f7168]" : "text-[#253635]"}`} key={d}>
                  <small className="text-[11px] text-[#71847e]">{a}</small>
                  <strong className="text-lg">{b}</strong>
                  <span className={i === 2 ? "size-1 rounded-full !bg-[#2f7168]" : "size-1"} />
                </div>
              );
            },
          )}
        </div>
        <div className="upcoming">
          <div className="alarm">
            <Bell size={16} />
          </div>
          <div>
            <strong>Week 4: (第十课) Spelling Test</strong>
            <p>Wednesday, 14 Oct at 3:00 PM · P2 MOE Syllabus</p>
          </div>
        </div>
      </section>
      <button className="scan-cta" onClick={() => router.push("/camera")}>
        <ScanLine size={18} /> Scan & Grade Worksheet
      </button>
    </>
  );
}
function Syllabus() {
  const [tab, setTab] = useState("P2");
  const router = useRouter();
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">MOE PRIMARY 2 SYLLABUS</p>
          <h1>Chinese Syllabus</h1>
        </div>
        <button className="help">
          <Menu size={19} />
        </button>
      </div>
      <div className="tabs">
        {["P1", "P2", "P3", "P4", "P5", "P6"].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="row-heading syllabus-title">
        <h2>{tab} MOE Primary 2 Syllabus</h2>
        <span>24 Lessons Total</span>
      </div>
      {lessons.map((lesson) => (
        <article
          className="lesson-card"
          key={lesson.week}
          onClick={() => router.push("/syllabus/detail")}
          role="link"
          tabIndex={0}
        >
          <div className="lesson-header">
            <div>
              <span className="eyebrow">{lesson.week}</span>
              <h3>{lesson.title}</h3>
              <p>{lesson.pinyin}</p>
            </div>
            <span className={"status " + lesson.tone}>{lesson.status}</span>
          </div>
          <div className="word-grid">
            {lesson.words.map(([cn, py]) => (
              <div key={cn}>
                <strong>{cn}</strong>
                <small>{py}</small>
              </div>
            ))}
          </div>
          <button className="print-link">
            <Printer size={14} /> Print A4 Worksheet (PDF)
            <ChevronRight size={14} />
          </button>
        </article>
      ))}
    </>
  );
}
function Camera() {
  const router = useRouter();
  const [capturing, setCapturing] = useState(false);
  return (
    <div className="camera-page">
      <div className="camera-image">
        <div className="camera-top">
          <button onClick={() => router.back()}>
            <X size={18} />
          </button>
          <span>Align Worksheet</span>
          <button>
            <Zap size={16} />
          </button>
        </div>
        <div className="brackets">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="camera-tip">Keep page flat and inside the brackets</div>
        <button
          className="shutter"
          onClick={() => {
            setCapturing(true);
            setTimeout(() => router.push("/results"), 900);
          }}
        >
          <span>{capturing ? "" : " "}</span>
        </button>
        <div className="capture-label">
          {capturing ? "Processing…" : "Capture & Grade"}
        </div>
        <div className="home-indicator" />
      </div>
    </div>
  );
}
function Results() {
  const router = useRouter();
  return (
    <div className="results-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TEST FEEDBACK</p>
          <h1>Week 4 Syllabus Test</h1>
        </div>
        <span className="status red">Needs Revision</span>
      </div>
      <section className="score-card">
        <div className="score-ring">80%</div>
        <div>
          <strong>Score: 8/10</strong>
          <small>Graded on 14 Oct, 3:12 PM</small>
          <b>2 characters missed</b>
        </div>
      </section>
      <h2 className="table-title">Results over time</h2>
      <div className="results-table">
        <div className="table-row table-head">
          <span>Character</span>
          <span>8 Oct</span>
          <span>10 Oct</span>
          <span>12 Oct</span>
        </div>
        {[
          ["操场", "cāo chǎng", "c", "c", "check"],
          ["礼堂", "lǐ táng", "x", "x", "x"],
          ["校园", "xiào yuán", "x", "check", "check"],
          ["老师", "lǎo shī", "check", "check", "check"],
          ["同学", "tóng xué", "check", "check", "check"],
          ["教室", "jiào shì", "x", "check", "check"],
          ["图书馆", "tú shū guǎn", "x", "x", "check"],
          ["食堂", "shí táng", "x", "check", "check"],
          ["花园", "huā yuán", "x", "check", "check"],
          ["运动场", "yùn dòng chǎng", "x", "x", "check"],
        ].map(([word, pinyin, ...marks]) => (
          <div className="table-row" key={word}>
            <span>
              <strong>{word}</strong>
              <small>{pinyin}</small>
            </span>
            {marks.map((m, i) => (
              <span className={m === "check" ? "correct" : "wrong"} key={i}>
                {m === "check" ? "✓" : "×"}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="result-actions">
        <button className="soft-button">
          <Share2 size={15} /> Share Report
        </button>
        <button className="dark-button" onClick={() => router.push("/camera")}>
          <RotateCcw size={15} /> Retest Missed
        </button>
      </div>
    </div>
  );
}
function History() {
  const router = useRouter();
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR PRACTICE LOG</p>
          <h1>History</h1>
        </div>
        <button className="help">
          <Menu size={19} />
        </button>
      </div>
      {[
        "Week 4 Syllabus Test",
        "Week 3 Character Review",
        "Week 2 Syllabus Test",
      ].map((x, i) => (
        <button
          className="history-item"
          key={x}
          onClick={() => router.push("/results")}
          aria-label={`Open feedback for ${x}`}
        >
          <div className="history-icon">
            {i === 0 ? <FileText size={17} /> : <Check size={17} />}
          </div>
          <div>
            <strong>{x}</strong>
            <small>
              {i === 0 ? "14 Oct 2026 · 3:12 PM" : "09 Oct 2026 · 4:20 PM"}
            </small>
          </div>
          <span>{i === 0 ? "80%" : "92%"}</span>
          <ChevronRight size={16} />
        </button>
      ))}
    </>
  );
}
function SyllabusDetail() {
  const router = useRouter();
  const words = lessons.flatMap((lesson) => lesson.words);
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">MOE PRIMARY 2 SYLLABUS</p>
          <h1>Week 4 · Our School</h1>
        </div>
        <button
          className="help"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronRight size={19} className="back-icon" />
        </button>
      </div>
      <section className="detail-hero">
        <span className="status amber">Pending Practice</span>
        <h2>第十课 - 我们的校园</h2>
        <p>
          Practice the characters from Week 4 and prepare for your upcoming
          spelling test.
        </p>
      </section>
      <section className="detail-section">
        <h2>Lesson characters</h2>
        <div className="character-list">
          {words.map(([cn, py]) => (
            <div className="character-item" key={cn}>
              <strong>{cn}</strong>
              <small>{py}</small>
            </div>
          ))}
        </div>
      </section>
      <button className="scan-cta" onClick={() => router.push("/camera")}>
        <ScanLine size={18} /> Start practice
      </button>
    </>
  );
}
function TopUp() {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">LESSON CREDITS</p>
          <h1>Top up credits</h1>
        </div>
      </div>
      <section className="payment-card">
        <h2>Choose a credit bundle</h2>
        <p>Credits are used whenever you grade a worksheet.</p>
        <div className="payment-options">
          <div className="payment-option">
            <div>
              <strong>5 lessons</strong>
              <small>Good for a quick refresh</small>
            </div>
            <b>$4.90</b>
          </div>
          <div className="payment-option selected">
            <div>
              <strong>10 lessons</strong>
              <small>Best value for regular practice</small>
            </div>
            <b>$8.90</b>
          </div>
          <div className="payment-option">
            <div>
              <strong>20 lessons</strong>
              <small>For the whole school term</small>
            </div>
            <b>$15.90</b>
          </div>
        </div>
        <div className="payment-total">
          <span>Total</span>
          <strong>$8.90</strong>
        </div>
        <button className="dark-button full-button">Continue to payment</button>
      </section>
    </>
  );
}
function Notifications() {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">STAY IN THE LOOP</p>
          <h1>Notifications</h1>
        </div>
      </div>
      <section className="settings-card">
        <div className="notification-item">
          <span className="notification-dot" />
          <div>
            <strong>Your Week 4 test is ready</strong>
            <p>Scan your worksheet after Wednesday at 3:00 PM.</p>
          </div>
        </div>
        <div className="notification-item">
          <span className="notification-dot" />
          <div>
            <strong>Great progress, Sarah</strong>
            <p>Your mastery rate improved by 3.1% this month.</p>
          </div>
        </div>
        <div className="notification-item">
          <span className="notification-dot" />
          <div>
            <strong>Credits expire soon</strong>
            <p>12 lesson credits expire on 30 Nov 2026.</p>
          </div>
        </div>
      </section>
    </>
  );
}
function Premium() {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">TING XIE PLUS</p>
          <h1>Practice with more support</h1>
        </div>
      </div>
      <section className="payment-card">
        <div className="placeholder-icon">
          <Sparkles size={22} />
        </div>
        <h2>Premium learning tools</h2>
        <p>Make handwriting practice calmer, clearer, and more consistent.</p>
        <div className="benefit-list">
          <div className="benefit-item">
            <Check size={16} />
            <span>Unlimited worksheet grading</span>
          </div>
          <div className="benefit-item">
            <Check size={16} />
            <span>Detailed progress insights</span>
          </div>
          <div className="benefit-item">
            <Check size={16} />
            <span>Printable revision packs</span>
          </div>
        </div>
        <button className="dark-button full-button">Explore Premium</button>
      </section>
    </>
  );
}
function Profile() {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">ACCOUNT</p>
          <h1>Your profile</h1>
        </div>
      </div>
      <section className="settings-card">
        <div className="profile-field">
          <div>
            <strong>Name</strong>
            <small>How you appear in Ting Xie</small>
          </div>
          <span>Sarah</span>
        </div>
        <div className="profile-field">
          <div>
            <strong>Learner</strong>
            <small>Current learner profile</small>
          </div>
          <span>Lucas</span>
        </div>
        <div className="profile-field">
          <div>
            <strong>Class</strong>
            <small>Current syllabus</small>
          </div>
          <span>Primary 2</span>
        </div>
        <div className="profile-field">
          <div>
            <strong>Notifications</strong>
            <small>Reminders and updates</small>
          </div>
          <span>On</span>
        </div>
      </section>
    </>
  );
}
function Placeholder({
  title,
  eyebrow,
  icon: Icon,
  children,
}: {
  title: string;
  eyebrow: string;
  icon: typeof Bell;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <button
          className="help"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronRight size={19} className="back-icon" />
        </button>
      </div>
      <section className="placeholder-card">
        <div className="placeholder-icon">
          <Icon size={22} />
        </div>
        <h2>{title}</h2>
        <p>{children}</p>
        <button className="dark-button" onClick={() => router.push("/")}>
          Back to Dashboard
        </button>
      </section>
    </>
  );
}
function App() {
  const path = usePathname();
  let content =
    path === "/syllabus/detail" ? (
      <SyllabusDetail />
    ) : path === "/syllabus" ? (
      <Syllabus />
    ) : path === "/camera" ? (
      <Camera />
    ) : path === "/results" ? (
      <Results />
    ) : path === "/history" ? (
      <History />
    ) : path === "/notifications" ? (
      <Notifications />
    ) : path === "/premium" ? (
      <Premium />
    ) : path === "/top-up" ? (
      <TopUp />
    ) : path === "/profile" ? (
      <Profile />
    ) : path === "/upcoming" ? (
      <Placeholder
        title="Upcoming Ting Xie"
        eyebrow="YOUR NEXT LESSONS"
        icon={Clock3}
      >
        Your scheduled spelling tests and upcoming practice sessions will appear
        here.
      </Placeholder>
    ) : (
      <Dashboard />
    );
  return path === "/camera" || path === "/results" ? (
    content
  ) : (
    <SharedAppShell>{content}</SharedAppShell>
  );
}
export default App;
