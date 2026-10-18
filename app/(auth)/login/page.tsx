"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { User, Lock, Eye, EyeOff, Mountain } from "lucide-react";
import { TextInput } from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
});

export default function LoginPage() {
  const [form, setForm] = useState({
    userName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { userName, password } = form;

    if (!userName.trim() || !password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        return setError(data.msg || data.error || "Login failed. Please check your credentials.");
      }

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 selection:bg-forest selection:text-white"
      style={{ backgroundImage: "url('/wanderly-bg.jpg')" }}
    >
      {/* Subtle overlay for depth & readability */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[36px] bg-cream/95 backdrop-blur-md shadow-2xl border border-sand p-7 sm:p-9 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className={`${caveat.className} text-4xl sm:text-5xl text-forest font-bold tracking-wide drop-shadow-sm`}>
            Wanderly
          </span>
          <Mountain className="w-8 h-8 sm:w-9 sm:h-9 text-forest" strokeWidth={1.75} />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight text-center">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-ink-soft text-center mt-1 mb-4 max-w-[270px]">
          Log in to continue your journey and share moments.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {/* Username Field using TextInput */}
          <TextInput
            icon={<User className="w-5 h-5 text-ink-faint shrink-0" />}
            type="text"
            name="userName"
            value={form.userName}
            onChange={(e) => setForm({ ...form, userName: e.target.value })}
            placeholder="Username"
            required
          />

          {/* Password Field using TextInput with toggle button */}
          <div className="relative">
            <TextInput
              icon={<Lock className="w-5 h-5 text-ink-faint shrink-0" />}
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className="pr-8"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-clay-light border border-sand p-2.5 text-center text-xs font-medium text-clay">
              {error}
            </div>
          )}

          {/* Login Button using Button component */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </div>

          {/* Register Link */}
          <p className="pt-2 text-center text-xs sm:text-sm text-ink-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-forest hover:underline underline-offset-2 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
