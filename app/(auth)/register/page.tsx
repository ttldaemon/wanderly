
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  CircleUser,
  LockKeyhole,
} from "lucide-react";

import { TextInput } from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/authContext";
import ProfileImageUploader from "@/components/ui/ProfileImageUploader";
import Logo from "@/components/ui/Logo";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    imgUrl: "",
    password: "",
    confirmPassword: "",
  });

  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const { name, username, email, password, confirmPassword, imgUrl } =
      form;

    if (uploadingImage) {
      setError("Please wait for the profile picture upload to finish.");
      return;
    }

    if (
      !name.trim() ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          userName: username.trim(),
          email: email.trim(),
          password: password.trim(),
          imgUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.msg ||
            data.error ||
            "Registration failed. Please try again.",
        );
        return;
      }

      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat p-4 selection:bg-forest selection:text-white sm:p-6"
      style={{ backgroundImage: "url('/wanderly-bg.jpg')" }}
    >
      {/* Background overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/15 backdrop-blur-[2px]" />

      {/* Registration card */}
      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center rounded-[36px] border border-sand bg-cream/95 p-7 shadow-2xl backdrop-blur-md sm:p-9">
        {/* Brand */}
        <Logo />

        {/* Heading */}
        <h1 className="text-center text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Create your account
        </h1>

        <p className="mb-4 mt-1 max-w-[270px] text-center text-xs text-ink-soft sm:text-sm">
          Join Wanderly and start sharing your Tours.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
         
          {/* Profile Picture Uploader */} 
          <ProfileImageUploader
            value={form.imgUrl}
            onChange={(url) =>
              setForm((prev) => ({ ...prev, imgUrl: url }))
            }
            disabled={loading}
          />

          {/* Name */}
          <TextInput
            icon={<User className="h-5 w-5 shrink-0 text-ink-faint" />}
            type="text"
            name="name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Name"
            required
          />

          {/* Username */}
          <TextInput
            icon={<CircleUser className="h-5 w-5 shrink-0 text-ink-faint" />}
            type="text"
            name="username"
            value={form.username}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, username: e.target.value }))
            }
            placeholder="Username"
            required
          />

          {/* Email */}
          <TextInput
            icon={<Mail className="h-5 w-5 shrink-0 text-ink-faint" />}
            type="email"
            name="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Email"
          />

          {/* Password */}
          <div className="relative">
            <TextInput
              icon={<Lock className="h-5 w-5 shrink-0 text-ink-faint" />}
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Password"
              className="pr-8"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-ink-faint transition-colors hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <TextInput
              icon={<LockKeyhole className="h-5 w-5 shrink-0 text-ink-faint" />}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm Password"
              className="pr-8"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-ink-faint transition-colors hover:text-ink"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Registration Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-sand bg-clay-light p-2.5 text-center text-xs font-medium text-clay"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading || uploadingImage}
              disabled={loading || uploadingImage}
            >
              {uploadingImage
                ? "Uploading picture..."
                : loading
                  ? "Creating account..."
                  : "Sign Up"}
            </Button>
          </div>

          {/* Login Link */}
          <p className="pt-2 text-center text-xs text-ink-muted sm:text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-forest underline-offset-2 transition-colors hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
