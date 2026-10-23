"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Pencil, Trash2, UserRound } from "lucide-react";

import { useAuth } from "@/context/authContext";
import { UserSummary } from "@/types/wanderly";
import { getUserInitials } from "@/utils/utilityFn";
import Button from "@/components/ui/Button";
import EditProfileModal, {
  ProfileFormData,
} from "@/components/EditProfileModal";

type Profile = UserSummary & {
  email?: string;
  totalTours: number;
};

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const isOwner = user?._id === userId;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const profileRes = await fetch(`/api/user-info/${userId}`);

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        throw new Error(profileData.message || "Failed to load profile.");
      }

      const fetchedProfile: Profile = profileData.user;

      setProfile(fetchedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSave(data: ProfileFormData) {
    setSaving(true);
    setError("");

    console.log(data)
    
    try {
      const res = await fetch(`/api/user-info/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update profile.");
      }

      const updatedProfile: Profile = result.user;

      setProfile({...profile, ...updatedProfile});
      setUser(updatedProfile);
      setEditing(false);
      
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete your account permanently?");

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/user-info/${userId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete account.");
      }

      setUser(null);
      router.replace("/register");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream text-sm text-ink-soft">
        Loading profile...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream p-6">
        <p className="text-sm text-clay">{error || "Profile not found."}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm text-ink-muted transition hover:text-forest"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex justify-center items-center min-h-[80vh]">
        <section className="rounded-3xl border border-sand bg-white/70 p-6 shadow-sm sm:p-10 w-full mx-2">
          <div className="flex flex-col items-center justify-center text-center">
            {profile.imgUrl ? (
              <img
                src={profile.imgUrl}
                alt={profile.name}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-forest text-3xl font-semibold text-white shadow-md">
                {getUserInitials(profile.name)}
              </div>
            )}

            <h1 className="mt-5 text-2xl font-bold tracking-tight">
              {profile.name}
            </h1>

            <p className="mt-1 text-sm text-ink-soft">@{profile.userName}</p>

            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-sand bg-cream px-5 py-3">
              <MapPin size={24} className="text-forest" />
              <div className="text-left">
                <p className="text-xs text-ink-soft">Tours posted</p>
                <p className="text-2xl text-center font-bold">{profile.totalTours}</p>
              </div>
            </div>

            {isOwner && (
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Button
                  className="w-full"
                  variant="outline"
                  icon={<Pencil size={16} />}
                  onClick={() => {
                    setError("");
                    setEditing(true);
                  }}
                >
                  Edit profile
                </Button>

                  <Button
                    className="w-full"
                  variant="danger"
                  icon={<Trash2 size={16} />}
                  onClick={handleDelete}
                  loading={deleting}
                  disabled={deleting}
                >
                  Delete account
                </Button>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-4 text-sm text-clay">
                {error}
              </p>
            )}
          </div>
          </section>
        </div>
      </div>

      {editing && (
        <EditProfileModal
          // cant directly pass the profile variable because editing, in the modal will change the original profile variable, so passing a copy
          profile={{
            name: profile.name,
            userName: profile.userName,
            imgUrl: profile.imgUrl ?? "",
          }}
          saving={saving}
          error={error}
          onClose={() => {
            if (!saving) {
              setEditing(false);
              setError("");
            }
          }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
