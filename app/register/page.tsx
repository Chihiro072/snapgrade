"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmPassword")) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const { error } = await getSupabaseClient().auth.signUp({
        email: String(data.get("email")),
        password: String(data.get("password")),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: String(data.get("fullName")) },
        },
      });
      if (error) throw error;
      setMessage("Check your email to confirm your account, then sign in.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f3ec] p-5">
      <form
        onSubmit={register}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[#2f7168]">
          <img src="/logo-notext.png" alt="SnapGrade" className="size-7 rounded-md" />
          <span>SNAPGRADE</span>
        </div>
        <h1 className="mt-2 text-2xl">Create account</h1>
        <label className="mt-6 block text-sm font-semibold">
          Your name
          <input
            required
            name="fullName"
            autoComplete="name"
            className="mt-2 w-full rounded-lg border p-3"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
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
              minLength={6}
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
        <label className="mt-4 block text-sm font-semibold">
          Confirm password
          <span className="relative mt-2 block">
            <input
              required
              minLength={6}
              name="confirmPassword"
              type={showConfirmation ? "text" : "password"}
              className="w-full rounded-lg border p-3 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmation(!showConfirmation)}
              aria-label={showConfirmation ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 px-3 text-[#71847e]"
            >
              {showConfirmation ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </span>
        </label>
        {message && <p className="mt-4 text-sm text-[#2f7168]">{message}</p>}
        <button
          disabled={loading}
          className="mt-6 w-full rounded-lg !bg-[#2f7168] p-3 font-bold !text-white hover:!bg-[#255e56]"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="mt-5 text-center text-sm">
          Already registered?{" "}
          <Link className="font-bold text-[#2f7168]" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
