"use client";
import { AppShell } from "@/components/app-shell";
import { getSupabaseClient } from "@/lib/supabase";
import { useGrade } from "@/lib/grade-context";
import { Check, LogOut, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function ProfilePage() {
  const router = useRouter();
  const { grade } = useGrade();
  const [name, setName] = useState("Learner");
  const [email, setEmail] = useState("Not signed in");
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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
        setEmail(user.email || "Not available");
      })
      .catch(() => undefined);
  }, []);

  function startEditing() {
    setSaveError("");
    setDraftName(name);
    setEditing(true);
  }

  async function saveName() {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setSaveError("Name can't be empty.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const { error } = await getSupabaseClient().auth.updateUser({
        data: { full_name: trimmed },
      });
      if (error) throw error;
      // The header badge/welcome text fetch the user's name independently
      // on their own mount, so a full reload is the simplest way to keep
      // them in sync with this change right away.
      window.location.reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save your name.");
      setSaving(false);
    }
  }

  const otherFields: [string, string][] = [
    ["Email", email],
    ["Class", `Primary ${grade.slice(1)}`],
    ["Notifications", "On"],
  ];

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
        <div className="border-b py-4">
          <div className="flex items-center justify-between gap-3">
            <strong className="shrink-0">Name</strong>
            {editing ? (
              <div className="flex flex-1 items-center justify-end gap-2">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  autoFocus
                  disabled={saving}
                  className="min-w-0 flex-1 rounded-lg border border-[#dce8e2] px-3 py-1.5 text-right text-sm outline-none focus:border-[#2f7168]"
                />
                <button
                  onClick={saveName}
                  disabled={saving}
                  aria-label="Save name"
                  className="grid size-7 shrink-0 place-items-center rounded-full !bg-[#2f7168] !text-white disabled:opacity-60"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  aria-label="Cancel"
                  className="grid size-7 shrink-0 place-items-center rounded-full !bg-[#f1eee6] !text-[#71847e]"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={startEditing}
                className="flex items-center gap-2 text-right"
              >
                <span>{name}</span>
                <Pencil size={14} className="text-[#90a19c]" />
              </button>
            )}
          </div>
          {editing && saveError && (
            <p className="mt-2 text-right text-xs text-[#d36b60]">{saveError}</p>
          )}
        </div>
        {otherFields.map(([label, value]) => (
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
