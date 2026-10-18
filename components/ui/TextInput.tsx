"use client";

import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const LABEL_STYLES = [
  "mb-2 block font-medium text-ink",
  "text-xs mobile-m:text-sm md:text-sm lg:text-base",
].join(" ");

const FIELD_TEXT_STYLES = [
  "text-xs",
  "mobile-s:text-xs mobile-m:text-sm mobile-l:text-base",
  "md:text-base lg:text-lg",
].join(" ");


//TextInput — single-line, with optional leading icon (location, etc.)


interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
}

export function TextInput({ label, icon, className = "", ...rest }: TextInputProps) {
  return (
    <div className="mt-5 first:mt-0">
      {label && <label className={LABEL_STYLES}>{label}</label>}
      <div
        className={[
          "flex items-center gap-2 rounded-xl border border-sand bg-white/60",
          "px-3 py-2.5 mobile-m:px-4 mobile-m:py-3",
          "focus-within:border-forest transition-colors",
        ].join(" ")}
      >
        {icon}
        <input
          className={[
            "w-full bg-transparent outline-none text-ink placeholder:text-ink-faint",
            FIELD_TEXT_STYLES,
            className,
          ].join(" ")}
          {...rest}
        />
      </div>
    </div>
  );
}


//TextArea — multi-line (caption)


interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = "", ...rest }: TextAreaProps) {
  return (
    <div className="mt-5 first:mt-0">
      {label && <label className={LABEL_STYLES}>{label}</label>}
      <textarea
        className={[
          "w-full resize-none rounded-xl border border-sand bg-white/60 outline-none transition-colors",
          "px-3 py-2.5 mobile-m:px-4 mobile-m:py-3",
          "text-ink placeholder:text-ink-faint focus:border-forest",
          FIELD_TEXT_STYLES,
          className,
        ].join(" ")}
        {...rest}
      />
    </div>
  );
}
