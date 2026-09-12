"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      if (error) throw error;
      router.push("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f3ec] p-5">
      <form
        onSubmit={login}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[#2f7168]">
          <img src="/logo-notext.png" alt="SnapGrade" className="size-7 rounded-md" />
          <span>SNAPGRADE</span>
        </div>
        <h1 className="mt-2 text-2xl">Welcome back</h1>
        <label className="mt-6 block text-sm font-semibold">
          Email
          <input
            required
            name="email"
            type="email"
            className="mt-2 w-full rounded-lg border p-3"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Password
          <span className="relative mt-2 block">
            <input
              required
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full rounded-lg border p-3 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 px-3 text-[#71847e]"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </span>
        </label>
        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
        <button
          disabled={loading}
          className="mt-6 w-full rounded-lg !bg-[#2f7168] p-3 font-bold !text-white hover:!bg-[#255e56]"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-5 text-center text-sm">
          New here?{" "}
          <Link className="font-bold text-[#2f7168]" href="/register">
            Create account
          </Link>
        </p>
      </form>
    </main>
  );
}
