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

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { name, username, email, password, confirmPassword, agreeToTerms } = form;

    if (!name.trim() || !username.trim() || !password || !confirmPassword) {
      return setError("All fields are required");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!agreeToTerms) {
      return setError("Please accept the Terms & Conditions and Privacy Policy");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          userName: username.trim(),
          email: email.trim() || `${username.trim().toLowerCase()}@wanderly.com`,
          password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        return setError(data.msg || data.error || "Registration failed. Please try again.");
      }

      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
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

      {/* Main Register Card */}
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
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-ink-soft text-center mt-1 mb-4 max-w-[270px]">
          Join Wanderly and start sharing your adventures.
        </p>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {/* Name Field using TextInput */}
          <TextInput
            icon={<User className="w-5 h-5 text-ink-faint shrink-0" />}
            type="text"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            required
          />

          {/* Username Field using TextInput */}
          <TextInput
            icon={<User className="w-5 h-5 text-ink-faint shrink-0" />}
            type="text"
            name="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
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

          {/* Confirm Password Field using TextInput with toggle button */}
          <div className="relative">
            <TextInput
              icon={<Lock className="w-5 h-5 text-ink-faint shrink-0" />}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm Password"
              className="pr-8"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={form.agreeToTerms}
              onChange={(e) => setForm({ ...form, agreeToTerms: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-sand text-forest focus:ring-forest accent-forest cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-ink-muted leading-relaxed cursor-pointer select-none">
              I agree to the{" "}
              <span className="font-semibold text-ink underline underline-offset-2">
                Terms &amp; Conditions
              </span>{" "}
              and{" "}
              <span className="font-semibold text-ink underline underline-offset-2">
                Privacy Policy
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-clay-light border border-sand p-2.5 text-center text-xs font-medium text-clay">
              {error}
            </div>
          )}

          {/* Sign Up Button using Button UI component */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </div>

          {/* Login Link */}
          <p className="pt-2 text-center text-xs sm:text-sm text-ink-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-forest hover:underline underline-offset-2 transition-colors"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
