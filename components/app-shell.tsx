"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  Clock3,
  Home,
  LogOut,
  Star,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

const navigation = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/syllabus", label: "Syllabus", icon: BookOpen },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/premium", label: "Premium", icon: Star },
];

export function AppShell({
  children,
  showBottomNav = true,
  desktopNavOnly = false,
  unpadded = false,
}: {
  children: ReactNode;
  showBottomNav?: boolean;
  desktopNavOnly?: boolean;
  unpadded?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState("Learner");

  useEffect(() => {
    getSupabaseClient()
      .auth.getUser()
      .then(({ data }) => {
        const user = data.user;
        if (!user) return;
        setName(
          String(
            user.user_metadata.full_name ||
              user.email?.split("@")[0] ||
              "Learner",
          ),
        );
      })
      .catch(() => undefined);
  }, []);
  async function logout() {
    try {
      await getSupabaseClient().auth.signOut();
    } finally {
      router.push("/login");
    }
  }

  return (
    <div
      className={`mx-auto min-h-screen w-full max-w-[430px] bg-[#f7f3ec] ${showBottomNav ? "pb-[78px]" : "pb-0"} text-[#253635] md:my-6 md:min-h-[calc(100vh-48px)] md:max-w-[1180px] md:overflow-hidden md:rounded-[22px] md:border md:border-[#e6ded2] md:pb-0 md:shadow-[0_18px_48px_#8f786018]`}
    >
      <header
        className={`${desktopNavOnly ? "hidden md:flex" : "flex"} h-[70px] items-center gap-2 border-b-0 !bg-[#f7f3ec] px-5 md:h-[76px] md:border-b md:border-[#edf1ee] md:!bg-white md:px-8`}
      >
        <button
          onClick={() => router.push("/")}
          className="hidden items-center gap-2 text-sm font-bold text-[#315e57] md:flex"
        >
          <span className="grid size-7 place-items-center rounded-full bg-[#eaf3ee] text-[#2f7168]">
            S
          </span>
          Ting Xie
        </button>
        <nav className="mx-auto hidden items-center gap-2 md:flex">
          {navigation.map(({ href, label }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`rounded-lg px-3 py-2 text-[11px] transition-colors ${(href === "/" ? pathname === href : pathname.startsWith(href)) ? "!bg-[#e3eee8] font-bold !text-[#2f7168]" : "text-[#74837d]"}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex w-full min-w-0 items-center justify-end gap-2 md:w-auto">
          <button
            onClick={() => router.push("/profile")}
            className="order-[-1] mr-auto flex items-center gap-2 text-left md:order-none md:mr-0"
          >
            <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#eaf3ee] text-[13px] font-bold text-[#2f7168] md:size-7">
              S
            </span>
            <span>
              <small className="block whitespace-nowrap text-[9px] leading-none text-[#90a19c]">
                Welcome back,
              </small>
              <strong className="block whitespace-nowrap text-xs leading-tight">
                {name}
              </strong>
            </span>
          </button>
          <button className="flex items-center gap-1 whitespace-nowrap rounded-full !border-[#d7d7d7] !bg-white px-4 py-2 text-sm font-bold !text-[#2f7168] shadow-[0_2px_7px_#31584b14]">
            Lucas – Primary 2 <ChevronDown size={14} />
          </button>
          <button
            onClick={() => router.push("/notifications")}
            aria-label="Notifications"
            className="p-1 text-[#71847e]"
          >
            <Bell size={20} />
          </button>
          <button
            onClick={logout}
            aria-label="Log out"
            className="hidden p-1 text-[#71847e] md:block"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main
        className={
          unpadded
            ? ""
            : "mx-auto w-full max-w-[760px] px-5 py-6 md:px-7 md:py-8"
        }
      >
        {children}
      </main>
      {showBottomNav && (
        <nav className="fixed bottom-0 z-10 flex h-[72px] w-full max-w-[430px] justify-around border-t border-[#e5eeea] bg-white pt-2.5 md:hidden">
          {navigation.map(({ href, label, icon: Icon }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[9px] ${(href === "/" ? pathname === href : pathname.startsWith(href)) ? "font-bold !text-[#2f7168]" : "text-[#9aaba6]"}`}
            >
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
