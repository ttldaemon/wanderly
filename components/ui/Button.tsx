"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";


//Variants

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost" | "amber";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-forest text-white border-forest hover:bg-forest-dark",
  secondary: "bg-cream-200 text-ink border-sand hover:bg-cream-300",
  outline: "bg-transparent text-ink border-sand-dark hover:bg-cream-200",
  danger: "bg-clay text-white border-clay hover:bg-clay-dark",
  ghost: "bg-transparent text-ink-soft border-transparent hover:bg-cream-100",
  amber: "bg-amber-register-now text-white border-[#d9a26f]",
};

//mobile-s -> mobile-m -> mobile-l -> md -> lg -> xxl -> 4k pattern

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: [
    "tracking-wide",
    "px-3 py-1.5",
    "mobile-s:px-3 mobile-s:py-1.5",
    "mobile-m:px-4 mobile-m:py-2",
    "mobile-l:px-5 mobile-l:py-2",
    "md:px-6 md:py-2",
    "lg:px-8 lg:py-2.5",
    "xxl:px-10 xxl:py-3",
    "4k:px-12 4k:py-3.5",
    "text-xs",
    "mobile-s:text-xs mobile-m:text-sm mobile-l:text-sm",
    "md:text-base lg:text-base xxl:text-lg 4k:text-xl",
  ].join(" "),

  md: [
    "tracking-wider",
    "px-4 py-2",
    "mobile-s:px-4 mobile-s:py-2",
    "mobile-m:px-6 mobile-m:py-2.5",
    "mobile-l:px-8 mobile-l:py-3",
    "md:px-10 md:py-3",
    "lg:px-12 lg:py-3.5",
    "xxl:px-16 xxl:py-4",
    "4k:px-20 4k:py-5",
    "text-sm",
    "mobile-s:text-sm mobile-m:text-base mobile-l:text-lg",
    "md:text-lg lg:text-xl xxl:text-2xl 4k:text-3xl",
  ].join(" "),

  lg: [
    "tracking-wider",
    "px-4 py-2",
    "mobile-s:px-6 mobile-s:py-3",
    "mobile-m:px-8 mobile-m:py-3",
    "mobile-l:px-10 mobile-l:py-4",
    "md:px-12 md:py-4",
    "lg:px-16 lg:py-4",
    "xxl:px-20 xxl:py-5",
    "4k:px-24 4k:py-6",
    "text-xs",
    "mobile-s:text-sm mobile-m:text-base mobile-l:text-lg",
    "md:text-xl lg:text-2xl xxl:text-3xl 4k:text-4xl",
  ].join(" "),
};

const BASE_STYLES = [
  "border rounded-full backdrop-blur-md",
  "transition-all duration-300 ease-in-out",
  "hover:scale-105 hover:shadow-lg",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "disabled:hover:scale-100 disabled:hover:shadow-none",
  "flex items-center justify-center gap-2",
].join(" ");

//Button

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        BASE_STYLES,
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

//Button iCon

type IconButtonVariant = "default" | "danger" | "overlay";

const ICON_VARIANT_STYLES: Record<IconButtonVariant, string> = {
  default: "text-ink-muted hover:bg-cream-100",
  danger: "text-clay hover:bg-clay-light",
  overlay: "bg-black/60 text-white hover:bg-black/75",
};

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  "aria-label": string;
  children: ReactNode;
}

export function IconButton({
  variant = "default",
  children,
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={[
        "flex items-center justify-center rounded-full transition",
        "h-5 w-5",
        "mobile-m:h-6 mobile-m:w-6",
        "md:h-7 md:w-7",
        ICON_VARIANT_STYLES[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
