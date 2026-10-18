"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagInput({ label, tags, onChange, maxTags = 8 }: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag || tags.includes(tag) || tags.length >= maxTags) return;
    onChange([...tags, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="mt-5 first:mt-0">
      {label && (
        <label className="mb-2 block text-xs font-medium text-ink mobile-m:text-sm md:text-sm lg:text-base">
          {label}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sand bg-white/60 px-3 py-2.5 mobile-m:px-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-xl bg-forest/10 px-2.5 py-1 text-[13px] mobile-m:text-xs font-medium text-forest"
          >
            #{tag}
            <IconButton
              variant="default"
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(tag)}
              className="h-4 w-4 text-forest/70 hover:bg-transparent hover:text-forest"
            >
              <X size={10} strokeWidth={2.5} />
            </IconButton>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
            className="min-w-[100px] flex-1 bg-transparent text-xs mobile-m:text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        )}
      </div>
    </div>
  );
}
