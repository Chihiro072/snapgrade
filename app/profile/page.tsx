"use client";
import { AppShell } from "@/components/app-shell";
import { getSupabaseClient } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
const fields = [
  ["Name", "Sarah"],
  ["Learner", "Lucas"],
  ["Class", "Primary 2"],
  ["Notifications", "On"],
];
export default function ProfilePage() {
  const router = useRouter();

  async function logout() {
    try {
      await getSupabaseClient().auth.signOut();
    } finally {
      router.push("/login");
    }
  }

  return (
    <AppShell>
      <p className="text-[10px] tracking-wide text-[#90a19c]">ACCOUNT</p>
      <h1 className="mt-1 text-2xl">Your profile</h1>
      <section className="mt-6 rounded-2xl bg-white p-5">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-b py-4 last:border-0"
          >
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
        <button
          onClick={logout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e5b9b4] bg-[#fff5f3] p-3 font-bold text-[#c85b53]"
        >
          <LogOut size={18} />
          Log out
        </button>
      </section>
    </AppShell>
  );
}
