"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import SearchBar, {
  SearchUser,
  SearchTour,
} from "../../components/SearchBar";

type Post = {
  id: string;
  author: string;
  handle: string;
  place: string;
  time: string;
  caption: string;
  image: string;
  likes: number;
  comments: number;
};

type ApiTour = {
  _id: string;
  imgUrls: string[];
  caption: string;
  location: string;
  createdAt: string;
  author?: {
    name: string;
    userName: string;
  };
};

type Person = {
  _id: string;
  name: string;
  userName: string;
};

const styles = {
  dashboard:
    "min-h-screen grid grid-cols-[minmax(0,1fr)_288px] bg-cream text-ink max-[1050px]:block",
  main: "min-w-0 p-6",
  topbar: "mb-4 flex items-center gap-4",
  iconButton:
    "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sand bg-white text-ink",
  avatar:
    "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-sm font-semibold text-white",
  postList: "mt-5 grid gap-5",
  post: "rounded-xl border border-sand bg-white p-4",
  postHeader: "mb-3 flex items-center justify-between",
  postAuthor: "font-semibold text-ink",
  postHandle: "text-xs text-ink-faint",
  postPlace: "text-xs font-medium text-forest",
  postImage:
    "mt-3 aspect-[16/10] w-full rounded-lg object-cover bg-sand",
  postCaption: "mt-3 text-sm leading-6 text-ink",
  postActions: "mt-4 flex items-center gap-5 text-xs text-ink-faint",
  aside:
    "border-l border-sand bg-white p-5 max-[1050px]:border-l-0 max-[1050px]:border-t",
  asideTitle: "text-sm font-semibold text-ink",
  personList: "mt-3 grid gap-3",
  person: "flex items-center gap-3",
  personAvatar:
    "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand text-xs font-semibold text-ink",
  personName: "text-sm font-medium text-ink",
  personHandle: "text-xs text-ink-faint",
  destinationList: "mt-3 grid gap-2",
  destination:
    "rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink",
};

function Icon({ name }: { name: string }) {
  if (name === "bell") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }

  return null;
}

function formatTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();

  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
}

function asPost(tour: ApiTour): Post {
  return {
    id: tour._id,
    author: tour.author?.name ?? "Traveller",
    handle: tour.author?.userName
      ? `@${tour.author.userName}`
      : "@traveller",
    place: tour.location,
    time: formatTime(tour.createdAt),
    caption: tour.caption,
    image: tour.imgUrls?.[0] ?? "",
    likes: 0,
    comments: 0,
  };
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    userName: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isComposerOpen, setComposerOpen] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");

  const [visibility, setVisibility] = useState<"public" | "private">(
    "public",
  );

  const [formError, setFormError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  // Search state
  const [searchResults, setSearchResults] = useState<
    SearchUser[] | SearchTour[]
  >([]);

  const [isUserSearch, setIsUserSearch] = useState(false);

  // Important:
  // [] can mean either "no search yet" OR "search returned no results".
  // This state lets us distinguish between those two cases.
  const [hasSearched, setHasSearched] = useState(false);

  function handleSearchResults(
    results: SearchUser[] | SearchTour[],
    isUserData: boolean,
  ) {
    setSearchResults(results);
    setIsUserSearch(isUserData);
    setHasSearched(true);
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await fetch("/api/initials");

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.msg || "Failed to load dashboard");
        }

        setPosts((payload.tours ?? []).map(asPost));
        setPeople(payload.people ?? []);
        setCurrentUser(payload.currentUser ?? null);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function toggleLike(id: string) {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    setFiles(Array.from(event.target.files));
  }

  async function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!caption.trim()) {
      setFormError("Please add a caption.");
      return;
    }

    if (!location.trim()) {
      setFormError("Please add a location.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("caption", caption.trim());
      formData.append("location", location.trim());
      formData.append("visibility", visibility);

      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/tours", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.msg || "Failed to publish post.");
      }

      if (payload.data) {
        setPosts((current) => [asPost(payload.data), ...current]);
      }

      setCaption("");
      setLocation("");
      setFiles([]);
      setVisibility("public");
      setComposerOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong while publishing.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const destinations = Array.from(
    new Set(posts.map((post) => post.place).filter(Boolean)),
  ).slice(0, 5);

  return (
    <div className={styles.dashboard}>
      <main className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <SearchBar onResults={handleSearchResults} />

          <button className={styles.iconButton} aria-label="Notifications">
            <Icon name="bell" />
          </button>

          <div className={styles.avatar}>
            {currentUser?.userName?.slice(0, 2).toUpperCase() ?? "JS"}
          </div>
        </header>

        {/* Create post */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Your Feed</h1>

            <p className="mt-1 text-sm text-ink-faint">
              Discover travel memories and share your own.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setComposerOpen(true);
              setFormError("");
            }}
            className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            + Create post
          </button>
        </div>

        {/* Search results / normal feed */}
        <section className={styles.postList}>
          {isLoading && (
            <div className="rounded-xl border border-sand bg-white p-6 text-sm text-ink-faint">
              Loading your feed...
            </div>
          )}

          {!isLoading && loadError && (
            <div className="rounded-xl border border-red-200 bg-white p-6 text-sm text-clay">
              {loadError}
            </div>
          )}

          {!isLoading && !loadError && hasSearched && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  {isUserSearch ? "People" : "Places"}
                </h2>

                <span className="text-xs text-ink-faint">
                  {searchResults.length} result
                  {searchResults.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* No search results */}
              {searchResults.length === 0 && (
                <div className="rounded-xl border border-sand bg-white p-8 text-center">
                  <p className="text-sm font-medium text-ink">
                    No results found.
                  </p>

                  <p className="mt-1 text-xs text-ink-faint">
                    Try searching for something else.
                  </p>
                </div>
              )}

              {/* User search results */}
              {isUserSearch &&
                (searchResults as SearchUser[]).map((user) => (
                  <article
                    key={user._id}
                    className="flex items-center gap-4 rounded-xl border border-sand bg-white p-4"
                  >
                    {user.imgUrl ? (
                      <img
                        src={user.imgUrl}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sand text-sm font-semibold text-ink">
                        {user.name?.slice(0, 1).toUpperCase() ?? "U"}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-ink">{user.name}</p>

                      <p className="text-sm text-ink-faint">
                        @{user.userName}
                      </p>
                    </div>
                  </article>
                ))}

              {/* Location search results */}
              {!isUserSearch &&
                (searchResults as SearchTour[]).map((tour) => (
                  <article key={tour._id} className={styles.post}>
                    <div className={styles.postHeader}>
                      <div>
                        <p className={styles.postAuthor}>Travel memory</p>

                        <p className={styles.postHandle}>
                          {formatTime(tour.createdAt)}
                        </p>
                      </div>

                      <span className={styles.postPlace}>
                        {tour.location}
                      </span>
                    </div>

                    {tour.imgUrls?.[0] && (
                      <img
                        src={tour.imgUrls[0]}
                        alt={tour.location}
                        className={styles.postImage}
                      />
                    )}

                    <p className={styles.postCaption}>{tour.caption}</p>

                    {tour.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tour.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-cream px-2.5 py-1 text-xs text-ink-faint"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
            </>
          )}

          {/* Normal feed */}
          {!isLoading && !loadError && !hasSearched && (
            <>
              {posts.length === 0 && (
                <div className="rounded-xl border border-sand bg-white p-8 text-center">
                  <p className="text-sm font-medium text-ink">
                    No posts yet.
                  </p>

                  <p className="mt-1 text-xs text-ink-faint">
                    Create your first travel memory.
                  </p>
                </div>
              )}

              {posts.map((post) => {
                const isLiked = liked.includes(post.id);

                return (
                  <article key={post.id} className={styles.post}>
                    <div className={styles.postHeader}>
                      <div>
                        <p className={styles.postAuthor}>{post.author}</p>

                        <p className={styles.postHandle}>
                          {post.handle} · {post.time}
                        </p>
                      </div>

                      <span className={styles.postPlace}>
                        {post.place}
                      </span>
                    </div>

                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.place}
                        className={styles.postImage}
                      />
                    )}

                    <p className={styles.postCaption}>{post.caption}</p>

                    <div className={styles.postActions}>
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        className={isLiked ? "font-semibold text-clay" : ""}
                      >
                        ♥ {post.likes + (isLiked ? 1 : 0)}
                      </button>

                      <button type="button">
                        💬 {post.comments}
                      </button>
                    </div>
                  </article>
                );
              })}
            </>
          )}
        </section>
      </main>

      {/* Sidebar */}
      <aside className={styles.aside}>
        <section>
          <h2 className={styles.asideTitle}>People you may know</h2>

          <div className={styles.personList}>
            {people.map((person) => (
              <div key={person._id} className={styles.person}>
                <div className={styles.personAvatar}>
                  {person.name.slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className={styles.personName}>{person.name}</p>

                  <p className={styles.personHandle}>
                    @{person.userName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className={styles.asideTitle}>Popular destinations</h2>

          <div className={styles.destinationList}>
            {destinations.map((destination) => (
              <div key={destination} className={styles.destination}>
                {destination}
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* Create post modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-sand bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Create a post</h2>

                <p className="mt-1 text-xs text-ink-faint">
                  Share your travel memory.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="text-xl text-ink-faint"
              >
                ×
              </button>
            </div>

            <form onSubmit={publishPost} className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Caption
                </label>

                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  rows={4}
                  placeholder="Tell people about your trip..."
                  className="w-full resize-none rounded-lg border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Goa, India"
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Images
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  className="w-full text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Visibility
                </label>

                <select
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(
                      event.target.value as "public" | "private",
                    )
                  }
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-forest"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {formError && (
                <p className="text-xs text-clay">{formError}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="rounded-lg border border-sand px-4 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}