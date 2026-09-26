"use client";

import { useState } from "react";
import CreatePostModal from "@/components/Createpostmodal"; // adjust path if needed

/**
 * Test page — save as app/test-post/page.tsx, then visit /test-post
 * to try the modal against your real backend (cloudinary + tours routes).
 */
export default function TestPostPage() {
  const [open, setOpen] = useState(false);
  const [lastPost, setLastPost] = useState<unknown>(null);

  // Swap this for the real logged-in user's id (e.g. from your auth
  // context, a session hook, or the /api/initials response) once you
  // wire this page up to a logged-in session.
  const currentUserId = "REPLACE_WITH_LOGGED_IN_USER_ID";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold text-ink">Share Your Journey</h1>
        <p className="mb-6 text-sm text-ink-soft">Create beautiful posts and inspire others.</p>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-forest px-6 py-3 text-sm font-medium text-white transition hover:bg-forest-dark"
        >
          Create a Post
        </button>

        {lastPost != null && (
          <pre className="mt-6 max-w-md overflow-auto rounded-lg bg-white p-4 text-left text-xs text-ink">
            {JSON.stringify(lastPost, null, 2)}
          </pre>
        )}
      </div>

      <CreatePostModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onPosted={(data) => setLastPost(data)}
        userId={currentUserId}
      />
    </div>
  );
}