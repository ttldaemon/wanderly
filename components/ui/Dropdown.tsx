"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps<T extends string> {
  label?: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
  icon?: ReactNode;
}

export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5 first:mt-0">
      {label && (
        <label className="mb-2 block text-xs font-medium text-ink mobile-m:text-sm md:text-sm lg:text-base">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={[
            "flex w-full items-center justify-between rounded-xl border border-sand bg-white/60 text-ink",
            "px-3 py-2.5 mobile-m:px-4 mobile-m:py-3",
            "text-xs mobile-m:text-sm md:text-base",
          ].join(" ")}
        >
          <span className="flex items-center gap-2">
            {icon}
            {value}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className={`text-ink-soft transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-sand bg-white shadow-md">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-xs mobile-m:text-sm md:text-base text-ink hover:bg-cream-200"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
