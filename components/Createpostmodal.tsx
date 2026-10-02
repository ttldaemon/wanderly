"use client";

import { useState } from "react";
import { X, MapPin, Users, Send } from "lucide-react";
import Button, { IconButton } from "./ui/Button";
import { TextInput, TextArea } from "./ui/TextInput";
import { Dropdown } from "./ui/Dropdown";
import { TagInput } from "./ui/TagInput";
import { ImageUploader } from "./ui/ImageUploader";

const SIGNATURE_ENDPOINT = "/api/cloudinary";
const CREATE_POST_ENDPOINT = (userId: string) => `/api/tours/${userId}`;

const MAX_IMAGES = 6;
const MAX_TAGS = 8;

type Audience = "Everyone" | "Friends only";
const AUDIENCE_OPTIONS: Audience[] = ["Everyone", "Friends only"];

function toVisibility(audience: Audience): "public" | "private" {
  return audience === "Everyone" ? "public" : "private";
}

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl: string | null;
  uploading: boolean;
}

interface CloudinarySignaturePayload {
  success: boolean;
  message?: string;
  data: {
    uploadUrl: string;
    signature: string;
    apiKey: string;
    cloudName: string;
    timestamp: number;
    folder: string;
    resourceType: string;
  };
}

interface CloudinaryUploadResponse {
  secure_url: string;
  [key: string]: unknown;
}

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPosted?: (data: unknown) => void;
  /** The logged-in user's id — required for POST /api/tours/:userId */
  userId: string;
}

//lucide icons

function LocationIcon() {
  return <MapPin size={16} strokeWidth={1.6} className="text-ink-soft" />;
}

function AudienceIcon() {
  return <Users size={16} strokeWidth={1.6} className="text-ink-soft" />;
}

function SendIcon() {
  return <Send size={16} strokeWidth={1.6} />;
}

function CloseIcon() {
  return <X size={20} strokeWidth={1.8} />;
}

//modal

export default function CreatePostModal({
  isOpen,
  onClose,
  onPosted,
  userId,
}: CreatePostModalProps) {
  const [images, setImages] = useState<PendingImage[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState<Audience>("Everyone");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  if (!isOpen) return null;

  function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) return;

    const next: PendingImage[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploadedUrl: null,
      uploading: false,
    }));

    setImages((prev) => [...prev, ...next]);
    next.forEach(uploadImage);
  }

  async function uploadImage(image: PendingImage) {
    setImages((prev) =>
      prev.map((img) => (img.id === image.id ? { ...img, uploading: true } : img))
    );

    try {
      const signRes = await fetch(`${SIGNATURE_ENDPOINT}?resourceType=image`);
      const signJson: CloudinarySignaturePayload = await signRes.json();

      if (!signRes.ok || !signJson.success) {
        throw new Error(signJson.message || "Could not get an upload signature");
      }

      const { uploadUrl, signature, apiKey, timestamp, folder } = signJson.data;

      const cloudForm = new FormData();
      cloudForm.append("file", image.file);
      cloudForm.append("api_key", apiKey);
      cloudForm.append("timestamp", String(timestamp));
      cloudForm.append("signature", signature);
      cloudForm.append("folder", folder);
      cloudForm.append("type", "upload");

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: cloudForm,
      });

      if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
      const uploadJson: CloudinaryUploadResponse = await uploadRes.json();

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, uploading: false, uploadedUrl: uploadJson.secure_url }
            : img
        )
      );
    } catch (err) {
      setError("One of your photos couldn't be uploaded. Try removing it and adding it again.");
      setImages((prev) =>
        prev.map((img) => (img.id === image.id ? { ...img, uploading: false } : img))
      );
    }
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function handlePost() {
    setError("");

    if (images.some((img) => img.uploading)) {
      setError("Hang on, your photos are still uploading.");
      return;
    }

    if (!userId) {
      setError("Missing user id — pass the logged-in user's id into CreatePostModal.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(CREATE_POST_ENDPOINT(userId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imgUrls: images.map((img) => img.uploadedUrl).filter(Boolean),
          caption,
          location,
          tags,
          visibility: toVisibility(audience),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.msg ? JSON.stringify(errJson.msg) : "Post failed");
      }
      const data = await res.json();

      setImages([]);
      setCaption("");
      setLocation("");
      setTags([]);
      setAudience("Everyone");
      onPosted?.(data);
      onClose();
    } catch (err) {
      setError("Something went wrong posting your adventure. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream shadow-xl sm:max-w-lg sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <h2 className="text-base font-semibold text-ink mobile-m:text-lg md:text-xl">
            Create a Post
          </h2>
          <IconButton variant="default" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Scrollable body — each field is now one component call */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ImageUploader
            label="Add Photos"
            images={images}
            maxImages={MAX_IMAGES}
            onAdd={handleFiles}
            onRemove={removeImage}
          />

          <TextArea
            label="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write about your adventure..."
            rows={3}
          />

          <TextInput
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add location"
            icon={<LocationIcon />}
          />

          <TagInput label="Tags" tags={tags} onChange={setTags} maxTags={MAX_TAGS} />

          <Dropdown
            label="Audience"
            value={audience}
            options={AUDIENCE_OPTIONS}
            onChange={setAudience}
            icon={<AudienceIcon />}
          />

          {error && (
            <p className="mt-4 rounded-lg bg-clay-light px-3 py-2 text-xs text-clay mobile-m:text-sm">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-sand px-6 py-4">
          <Button variant="outline" size="md" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            loading={submitting}
            disabled={!caption && images.length === 0}
            onClick={handlePost}
            icon={<SendIcon />}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}