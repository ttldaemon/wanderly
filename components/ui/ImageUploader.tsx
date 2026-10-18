"use client";

import { ChangeEvent, useRef } from "react";
import { Upload, X } from "lucide-react";
import { IconButton } from "./Button";

export interface UploaderImage {
  id: string;
  previewUrl: string;
  uploading: boolean;
}

interface ImageUploaderProps {
  label?: string;
  images: UploaderImage[];
  maxImages: number;
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
}

const TILE_SIZE = "h-20 w-20 mobile-m:h-24 mobile-m:w-24 md:h-28 md:w-28";

export function ImageUploader({ label, images, maxImages, onAdd, onRemove }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {label && (
        <label className="mb-2 block text-xs font-medium text-ink mobile-m:text-sm md:text-sm lg:text-base">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
          className={[
            "flex flex-shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed",
            "border-sand-dark text-center leading-tight text-ink-soft transition",
            "text-[10px] mobile-m:text-[11px]",
            "hover:border-forest hover:text-forest",
            "disabled:cursor-not-allowed disabled:opacity-40",
            TILE_SIZE,
          ].join(" ")}
        >
          <Upload size={20} strokeWidth={1.6} />
          Upload photos
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.files && onAdd(e.target.files)}
        />

        {images.map((img) => (
          <div
            key={img.id}
            className={["relative flex-shrink-0 overflow-hidden rounded-xl bg-cream-100", TILE_SIZE].join(" ")}
          >
            <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
            {img.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
            <IconButton
              variant="overlay"
              aria-label="Remove photo"
              onClick={() => onRemove(img.id)}
              className="absolute right-1 top-1"
            >
              <X size={10} strokeWidth={2.5} />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}
