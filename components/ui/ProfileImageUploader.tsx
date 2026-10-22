"use client";

import { useEffect, useState } from "react";
import { Camera, LoaderCircle, User, X } from "lucide-react";

import {
  CloudinarySignaturePayload,
  CloudinaryUploadResponse,
} from "@/components/Createpostmodal";

interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number | string;
  cloudName: string;
  apiKey: string;
  folder?: string;
  error?: string;
}

interface ProfileImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export default function ProfileImageUploader({
  value,
  onChange,
  disabled = false,
}: ProfileImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    setError("");

    if (
      !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
        file.type,
      )
    ) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const signRes = await fetch("/api/cloudinary");

      const signJson: CloudinarySignaturePayload = await signRes.json();

      if (!signRes.ok || !signJson.success) {
        throw new Error(
          signJson.message || "Could not get an upload signature",
        );
      }

      const { uploadUrl, signature, apiKey, timestamp, folder } = signJson.data;

      if (!signature || !timestamp || !apiKey) {
        throw new Error("Invalid Cloudinary signature response.");
      }

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", String(timestamp));
      uploadData.append("signature", signature);
      uploadData.append("folder", folder);
      uploadData.append("type", "upload");

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: uploadData,
      });

      const result: CloudinaryUploadResponse = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error("Image upload failed.");
      }

      if (!result.secure_url) {
        throw new Error("Cloudinary did not return an image URL.");
      }

      onChange(result.secure_url);
    } catch (err) {
      console.error("Profile image upload failed:", err);
      setPreviewUrl("");

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload image. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onChange("");
    setError("");
  };

  const imageUrl = previewUrl || value;

  return (
    <div className="flex flex-col items-center gap-2 pb-2">
      <div className="relative">
        <label
          htmlFor="profile-picture"
          className={`group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-sand bg-cream-100 transition hover:border-forest ${
            disabled || uploading
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer"
          }`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile picture preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-ink-faint" />
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
            {uploading ? (
              <LoaderCircle className="h-6 w-6 animate-spin" />
            ) : (
              <Camera className="h-6 w-6" />
            )}
          </span>
        </label>

        {imageUrl && !uploading && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove profile picture"
            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-sand bg-cream text-ink shadow-sm transition hover:bg-clay-light hover:text-clay"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <input
        id="profile-picture"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageChange}
        disabled={disabled || uploading}
        className="sr-only"
      />

      <label
        htmlFor="profile-picture"
        className={`text-sm font-semibold text-forest hover:underline ${
          disabled || uploading
            ? "pointer-events-none opacity-60"
            : "cursor-pointer"
        }`}
      >
        {uploading
          ? "Uploading picture..."
          : value
            ? "Change profile picture"
            : "Upload profile picture"}
      </label>

      {error && (
        <p className="max-w-full text-center text-xs text-clay">{error}</p>
      )}

      {value && !uploading && (
        <p className="text-xs font-medium text-forest">
          Profile picture uploaded successfully
        </p>
      )}
    </div>
  );
}
