"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

// Variants
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

// Base size on mobile, one step up from md breakpoint

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs tracking-wide md:px-5 md:py-2 md:text-sm",
  md: "px-5 py-2 text-sm tracking-wider md:px-8 md:py-2.5 md:text-base",
  lg: "px-6 py-3 text-base tracking-wider md:px-10 md:py-3.5 md:text-lg",
};

const BASE_STYLES =
  "border rounded-xl backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2";

// Button

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
      className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

// Icon Button

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
      className={`flex items-center justify-center rounded-full transition h-6 w-6 md:h-7 md:w-7 ${ICON_VARIANT_STYLES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}