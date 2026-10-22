
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Camera, X } from "lucide-react";

import { UserSummary } from "@/types/wanderly";
import { TextInput } from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import ProfileImageUploader from "@/components/ui/ProfileImageUploader";

export interface ProfileFormData {
  name: string;
  userName: string;
  imgUrl: string;
}

interface EditProfileModalProps {
  profile: ProfileFormData;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (data: ProfileFormData) => Promise<void>;
}

export default function EditProfileModal({
  profile,
  saving,
  error,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [form, setForm] = useState<ProfileFormData>(profile);
  const [uploading, setUploading] = useState<boolean>(false)

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim() || !form.userName.trim()) return;

    await onSave({
      name: form.name.trim(),
      userName: form.userName.trim(),
      imgUrl: form.imgUrl,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="w-full max-w-md rounded-3xl border border-sand bg-cream p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              id="edit-profile-title"
              className="text-xl font-bold text-ink"
            >
              Edit profile
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Update your Wanderly profile.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close edit profile"
            className="rounded-full p-2 text-ink-muted transition hover:bg-cream-200 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <ProfileImageUploader
            value={form.imgUrl}
            onChange={(imgUrl) => (
              
              setForm((prev) => ({ ...prev, imgUrl })))
            }
            onUploadingChange={setUploading}
            disabled={saving}
          />

          <TextInput
            label="Name"  
            name="name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Your name"
            required
          />

          <TextInput
            label="Username"
            name="userName"
            value={form.userName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, userName: e.target.value }))
            }
            placeholder="Your username"
            required
          />

          {error && (
            <p role="alert" className="text-sm text-clay">
              {error}
            </p>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="w-full"
            >
              Cancel
            </Button>

            <Button className="w-full" type="submit" loading={saving} disabled={saving || uploading}>
              Save changes
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
