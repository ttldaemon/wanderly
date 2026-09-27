"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

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
  author?: { name: string; userName: string };
};
type Person = { _id: string; name: string; userName: string };
const navItems = ["Home", "My Trips", "Explore", "People", "Saved"];
const destinations = [
  [
    "Ladakh",
    "13.5K posts",
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=160&q=80",
  ],
  [
    "Goa",
    "8.7K posts",
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=160&q=80",
  ],
  [
    "Spiti",
    "11.4K memories",
    "https://images.unsplash.com/photo-1626621331169-c578f5fbcb24?auto=format&fit=crop&w=160&q=80",
  ],
];
const styles = {
  dashboard:
    "min-h-screen grid grid-cols-[245px_minmax(480px,1fr)_288px] bg-cream text-ink max-[1050px]:grid-cols-[205px_minmax(0,1fr)] max-[700px]:block",
  sidebar:
    "min-h-screen flex flex-col bg-forest-deep bg-[linear-gradient(rgba(13,59,42,.93),rgba(27,75,55,.96)),url('https://images.unsplash.com/photo-1443632864897-14973fa006cf?auto=format&fit=crop&w=1000&q=80')] bg-cover p-5 pt-8 text-cream max-[700px]:min-h-0",
  brand:
    "pb-9 text-[28px] font-bold italic font-display text-white no-underline",
  navActive:
    "w-full rounded-lg bg-cream-100 px-3 py-3 text-left text-sm font-bold text-forest-deep",
  navItem: "w-full rounded-lg px-3 py-3 text-left text-sm hover:bg-white/10",
  icon: "mr-2 inline-block w-5 text-center text-lg",
  sidebarBottom: "mt-auto border-t border-white/15 pt-4 text-[11px] text-cream",
  logout: "mt-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-white/10",
  feed: "mx-auto w-full max-w-[820px] border-r border-sand px-7 pt-5 pb-12 max-[700px]:border-0 max-[700px]:p-4",
  topbar: "mb-4 flex items-center gap-4",
  search:
    "flex h-10 flex-1 items-center rounded-lg border border-sand bg-white px-3",
  iconButton: "border-0 bg-transparent text-xl",
  avatar:
    "grid h-[34px] w-[34px] place-items-center rounded-full bg-linear-to-br from-amber-300 to-amber-900 text-[11px] font-bold text-white",
  composer:
    "flex w-full items-center gap-3 rounded-t-xl border border-b-0 border-sand bg-white px-4 py-3 text-left",
  composerActions:
    "flex items-center gap-5 rounded-b-xl border border-sand bg-white px-4 py-2.5 text-xs text-ink-muted [&>button]:ml-auto [&>button]:rounded-md [&>button]:bg-forest [&>button]:px-5 [&>button]:py-2 [&>button]:text-white",
  postList: "mt-5 grid gap-5",
  post: "rounded-xl border border-sand bg-white p-4",
  postHeader:
    "flex items-center gap-2.5 [&>button]:ml-auto [&>button]:border-0 [&>button]:bg-transparent",
  authorAvatar:
    "grid h-[33px] w-[33px] place-items-center rounded-full bg-forest text-xs font-bold text-white",
  caption: "my-3 text-[13px]",
  postImage: "h-[258px] w-full rounded-lg object-cover",
  postFooter:
    "flex items-center gap-5 pt-3 text-[11px] text-ink-muted [&>button]:border-0 [&>button]:bg-transparent",
  liked: "text-red-600",
  share: "ml-auto",
  empty: "p-7 text-center text-ink-faint",
  error: "p-5 text-center text-xs text-clay",
  discover: "discover bg-cream px-6 pt-8 max-[1050px]:hidden",
  sectionHeading:
    "mb-4 flex items-center justify-between [&>h2]:text-[13px] [&>button]:border-0 [&>button]:bg-transparent [&>button]:text-[10px] [&>button]:font-bold [&>button]:text-forest",
  person:
    "my-3 flex items-center gap-2 [&>div:nth-child(2)]:flex-1 [&>button]:rounded-md [&>button]:border [&>button]:border-sand [&>button]:bg-transparent [&>button]:px-2 [&>button]:py-1 [&>button]:text-[9px] [&>button]:text-forest",
  personAvatar:
    "grid h-[29px] w-[29px] place-items-center rounded-full bg-amber-700 text-[10px] font-bold text-white",
  trending: "mt-9 border-t border-sand pt-7",
  destination:
    "my-3 flex items-center gap-2.5 [&>img]:h-10 [&>img]:w-[42px] [&>img]:rounded-md [&>img]:object-cover",
  overlay: "fixed inset-0 z-20 grid place-items-center bg-black/70 p-5",
  modal:
    "w-full max-w-[480px] rounded-xl bg-cream p-6 shadow-modal [&>header]:flex [&>header]:items-center [&>header]:justify-between [&>header>button]:border-0 [&>header>button]:bg-transparent",
  fieldLabel:
    "mt-5 grid gap-2 text-[11px] font-bold [&_textarea]:h-20 [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-sand [&_textarea]:bg-white [&_textarea]:p-3 [&_input]:rounded-md [&_input]:border [&_input]:border-sand [&_input]:bg-white [&_input]:p-3 [&_select]:rounded-md [&_select]:border [&_select]:border-sand [&_select]:bg-white [&_select]:p-3",
  uploadArea:
    "relative grid min-h-[105px] place-content-center justify-items-center gap-1 rounded-lg border border-dashed border-sand-dark text-ink-soft [&>input]:absolute [&>input]:inset-0 [&>input]:cursor-pointer [&>input]:opacity-0",
  fileNames:
    "mt-2 flex flex-wrap gap-2 [&>span]:rounded-full [&>span]:bg-cream-100 [&>span]:px-2 [&>span]:py-1 [&>span]:text-[10px]",
  formError: "mt-3 text-xs text-clay",
  cancel: "rounded-md border border-sand bg-white px-4 py-2 text-xs",
  publish:
    "ml-auto rounded-md bg-forest px-6 py-2.5 text-xs font-semibold text-white disabled:opacity-70",
};
function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    Home: "⌂",
    "My Trips": "◫",
    Explore: "◈",
    People: "♧",
    Saved: "♡",
    search: "⌕",
    bell: "♧",
    photo: "▧",
    pin: "⌖",
    globe: "◎",
    heart: "♥",
    comment: "◌",
    bookmark: "♢",
    share: "↗",
    close: "×",
    upload: "⇧",
  };
  return (
    <span aria-hidden="true" className={styles.icon}>
      {icons[name]}
    </span>
  );
}
function asPost(tour: ApiTour, own = false): Post {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(tour.createdAt).getTime()) / 60000),
  );
  return {
    id: tour._id,
    author: own ? "You" : (tour.author?.name ?? "Fellow traveller"),
    handle: own ? "@your.journey" : `@${tour.author?.userName ?? "wanderly"}`,
    place: tour.location,
    time: minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`,
    caption: tour.caption,
    image: tour.imgUrls[0] ?? "",
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
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/initials");
        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(data.msg ?? "Could not load your dashboard.");
        setPosts((data.tours as ApiTour[]).map((tour) => asPost(tour)));
        setPeople(data.users as Person[]);
        setCurrentUser(data.currentUser);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load your dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);
  function onFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []).slice(0, 4));
  }
  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser)
      return setFormError("Your session has expired. Please sign in again.");
    if (!files.length)
      return setFormError("Add at least one photo to publish a memory.");
    setSubmitting(true);
    setFormError("");
    try {
      const signature = await fetch("/api/cloudinary");
      const signed = await signature.json();
      if (!signature.ok || !signed.success)
        throw new Error(signed.message ?? "Could not prepare image upload.");
      const imgUrls = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("api_key", signed.data.apiKey);
          data.append("timestamp", String(signed.data.timestamp));
          data.append("folder", signed.data.folder);
          data.append("type", "upload");
          data.append("signature", signed.data.signature);
          const response = await fetch(signed.data.uploadUrl, {
            method: "POST",
            body: data,
          });
          const payload = await response.json();
          if (!response.ok || !payload.secure_url)
            throw new Error(payload.error?.message ?? "Image upload failed.");
          return payload.secure_url as string;
        }),
      );
      const response = await fetch(`/api/tours/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imgUrls,
          caption,
          location,
          tags: [],
          visibility,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.msg ?? "Could not publish your memory.");
      setPosts((current) => [
        asPost(payload.data as ApiTour, true),
        ...current,
      ]);
      setCaption("");
      setLocation("");
      setFiles([]);
      setComposerOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not publish your memory.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  const visiblePosts = posts.filter((post) =>
    `${post.author} ${post.place} ${post.caption}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/dashboard">
          Wanderly <span>⌁</span>
        </a>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              className={item === "Home" ? styles.navActive : styles.navItem}
              key={item}
            >
              <Icon name={item} />
              {item}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <p>☼</p>
          <div>
            <strong>Collect beautiful</strong>
            <br />
            memories, one journey at a time.
          </div>
        </div>
        <button className={styles.logout}>↪ Log out</button>
      </aside>
      <section className={styles.feed}>
        <header className={styles.topbar}>
          <label className={styles.search}>
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search memories, places, people..."
            />
          </label>
          <button className={styles.iconButton} aria-label="Notifications">
            <Icon name="bell" />
          </button>
          <div className={styles.avatar}>JS</div>
        </header>
        <button
          className={styles.composer}
          onClick={() => setComposerOpen(true)}
        >
          <div className={styles.avatar}>JS</div>
          <span>What adventure are you sharing today?</span>
          <Icon name="photo" />
        </button>
        <div className={styles.composerActions}>
          <span>
            <Icon name="photo" /> Photo
          </span>
          <span>
            <Icon name="pin" /> Location
          </span>
          <span>
            <Icon name="globe" /> Everyone
          </span>
          <button onClick={() => setComposerOpen(true)}>Post</button>
        </div>
        <div className={styles.postList}>
          {isLoading && <p className={styles.empty}>Loading memories…</p>}
          {loadError && <p className={styles.error}>{loadError}</p>}
          {!isLoading &&
            !loadError &&
            visiblePosts.map((post) => {
              const isLiked = liked.includes(post.id);
              return (
                <article className={styles.post} key={post.id}>
                  <header className={styles.postHeader}>
                    <div className={styles.authorAvatar}>
                      {post.author.slice(0, 1)}
                    </div>
                    <div>
                      <strong>{post.author}</strong>
                      <p>
                        {post.handle} · {post.time} ·{" "}
                        <span>
                          <Icon name="pin" /> {post.place}
                        </span>
                      </p>
                    </div>
                    <button aria-label="More options">•••</button>
                  </header>
                  <p className={styles.caption}>{post.caption}</p>
                  <img
                    src={post.image}
                    alt={`Memory from ${post.place}`}
                    className={styles.postImage}
                  />
                  <footer className={styles.postFooter}>
                    <button
                      className={isLiked ? styles.liked : ""}
                      onClick={() =>
                        setLiked((current) =>
                          isLiked
                            ? current.filter((id) => id !== post.id)
                            : [...current, post.id],
                        )
                      }
                    >
                      <Icon name="heart" /> {post.likes + (isLiked ? 1 : 0)}
                    </button>
                    <button>
                      <Icon name="comment" /> {post.comments}
                    </button>
                    <button>
                      <Icon name="bookmark" /> Save
                    </button>
                    <button className={styles.share}>
                      <Icon name="share" /> Share
                    </button>
                  </footer>
                </article>
              );
            })}
          {!isLoading && !loadError && visiblePosts.length === 0 && (
            <p className={styles.empty}>No memories match that search.</p>
          )}
        </div>
      </section>
      <aside className={styles.discover}>
        <section>
          <div className={styles.sectionHeading}>
            <h2>People you may like</h2>
            <button>See all</button>
          </div>
          {people.map((person) => (
            <div className={styles.person} key={person._id}>
              <div className={styles.personAvatar}>
                {person.name.slice(0, 1)}
              </div>
              <div>
                <strong>{person.name}</strong>
                <p>@{person.userName}</p>
              </div>
              <button>Follow</button>
            </div>
          ))}
        </section>
        <section className={styles.trending}>
          <div className={styles.sectionHeading}>
            <h2>Trending Destinations</h2>
            <button>See all</button>
          </div>
          {destinations.map(([name, detail, image]) => (
            <div className={styles.destination} key={name}>
              <img src={image} alt="" />
              <div>
                <strong>{name}</strong>
                <p>{detail}</p>
              </div>
            </div>
          ))}
        </section>
      </aside>
      {isComposerOpen && (
        <div
          className={styles.overlay}
          role="presentation"
          onMouseDown={() => setComposerOpen(false)}
        >
          <form
            className={styles.modal}
            onSubmit={publish}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <h1>Create a post</h1>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                aria-label="Close"
              >
                <Icon name="close" />
              </button>
            </header>
            <label className={styles.fieldLabel}>
              Add photos
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFilesSelected}
                />
                <Icon name="upload" />
                <strong>Upload photos</strong>
                <span>or drag and drop</span>
              </div>
            </label>
            {files.length > 0 && (
              <div className={styles.fileNames}>
                {files.map((file) => (
                  <span key={file.name}>{file.name}</span>
                ))}
              </div>
            )}
            <label className={styles.fieldLabel}>
              Caption
              <textarea
                required
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Write about your adventure..."
              />
            </label>
            <label className={styles.fieldLabel}>
              Location
              <input
                required
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="⌖  Add location"
              />
            </label>
            <label className={styles.fieldLabel}>
              Audience
              <select
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as "public" | "private")
                }
              >
                <option value="public">◎ Everyone</option>
                <option value="private">◉ Only me</option>
              </select>
            </label>
            {formError && <p className={styles.formError}>{formError}</p>}
            <footer>
              <button
                type="button"
                className={styles.cancel}
                onClick={() => setComposerOpen(false)}
              >
                Cancel
              </button>
              <button
                className={styles.publish}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing…" : "↗ Post"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </main>
  );
}
