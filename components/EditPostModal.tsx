
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X, MapPin, Users } from "lucide-react";
import Button, { IconButton } from "./ui/Button";
import { TextInput, TextArea } from "./ui/TextInput";
import { Dropdown } from "./ui/Dropdown";
import { TagInput } from "./ui/TagInput";
import type { TourFeed } from "@/types/wanderly";
import { useAuth } from "@/context/authContext";

type Visibility = "public" | "private";

interface EditTourModalProps {
  tourId: string;
  isOpen: boolean;
  onClose: () => void;
  tour: TourFeed;
  onUpdated?: () => void;
}

const MAX_TAGS = 8;

const VISIBILITY_OPTIONS: Visibility[] = ["public", "private"]

export default function EditPostModal({
  tourId,
  isOpen,
  onClose,
  tour,
  onUpdated,
}: EditTourModalProps) {
  const [caption, setCaption] = useState(tour.caption ?? "");
  const [location, setLocation] = useState(tour.location ?? "");
  const [tags, setTags] = useState<string[]>(tour.tags ?? []);
  const [visibility, setVisibility] = useState<Visibility>(tour.visibility ?? "public");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {user} = useAuth()

  useEffect(() => {
    if (!isOpen) return;

    console.log(tour)

    setCaption(tour.caption ?? "");
    setLocation(tour.location ?? "");
    setTags(tour.tags ?? []);
    setVisibility(tour.visibility);
    setError("");
  }, [isOpen, tour]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!location.trim()) {
      setError("Location is required.");
      return;
    }

    setSaving(true);

    try {
      // Assumes this endpoint accepts a tour ID and updates the tour.
      const res = await fetch(`/api/tours/${user?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId,
          caption: caption.trim(),
          location: location.trim(),
          tags,
          visibility,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.msg || "Failed to update tour.");
      }

      onClose();
      onUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-tour-title"
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream shadow-xl sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <div>
            <h2 id="edit-tour-title" className="text-lg font-semibold text-ink">
              Edit your adventure
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Update the details without changing your photos.
            </p>
          </div>

          <IconButton
            variant="default"
            aria-label="Close"
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <TextArea
              label="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write about your adventure..."
              rows={4}
            />

            <TextInput
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              icon={<MapPin size={16} className="text-ink-soft" />}
              required
            />

            <TagInput
              label="Tags"
              tags={tags}
              onChange={setTags}
              maxTags={MAX_TAGS}
            />

            <Dropdown
              label="Visibility"
              value={visibility}
              options={VISIBILITY_OPTIONS}
              onChange={setVisibility}
              icon={<Users size={16} className="text-ink-soft" />}
            />

            {error && (
              <p role="alert" className="rounded-lg bg-clay-light px-3 py-2 text-sm text-clay">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 border-t border-sand px-6 py-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={saving}
              disabled={saving || !location.trim()}
            >
              Save changes
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
