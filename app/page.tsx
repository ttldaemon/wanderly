"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import CreatePostModal from "@/components/Createpostmodal";
import Button from "@/components/ui/Button";
import { NavTab, TourPost, UserSummary } from "@/types/wanderly";

const FALLBACK_USERS: UserSummary[] = [
  { _id: "u1", name: "Aarav Sharma", userName: "aarav_travels" },
  { _id: "u2", name: "Meera Nair", userName: "meerawanders" },
  { _id: "u3", name: "Rohan Verma", userName: "rohan_peaks" },
  { _id: "u4", name: "Kabir Joshi", userName: "kabir_trails" },
  { _id: "u5", name: "Ananya Roy", userName: "ananya_nomad" },
];

const FALLBACK_TOURS: TourPost[] = [
  {
    _id: "t1",
    userId: "u1",
    imgUrls: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    ],
    caption:
      "Golden hour across the valley in Spiti. The silence up here at 14,000 ft feels like another planet altogether.",
    location: "Spiti Valley, Himachal Pradesh",
    tags: ["mountains", "himachal", "roadtrip"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "t2",
    userId: "u2",
    imgUrls: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    ],
    caption:
      "Early morning boat ride along the backwaters before the mist cleared. Best filter coffee right by the pier.",
    location: "Alleppey, Kerala",
    tags: ["kerala", "backwaters", "sunrise"],
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
];

function FeedPostItem({
  post,
  author,
}: {
  post: TourPost;
  author?: UserSummary;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const displayName = author?.name || "Wanderer";
  const handle = author?.userName || `traveler_${post.userId.slice(-4)}`;
  const isLongCaption = post.caption.length > 140;
  const visibleCaption =
    !expanded && isLongCaption
      ? `${post.caption.slice(0, 140)}...`
      : post.caption;

  const images = post.imgUrls || [];

  return (
    <article className="border-b border-sand px-5 py-5 transition hover:bg-cream-100/30">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-semibold text-white">
          {displayName.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">{displayName}</p>
              <p className="text-xs text-ink-soft">@{handle}</p>
            </div>
            {post.location && (
              <span className="flex items-center gap-1 rounded-full bg-cream-200 px-2.5 py-1 text-xs font-medium text-forest">
                <MapPin size={12} />
                {post.location}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink">
            {visibleCaption}
            {isLongCaption && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="ml-1.5 font-semibold text-forest hover:underline"
              >
                {expanded ? "see less" : "see more"}
              </button>
            )}
          </p>

          {post.tags?.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-forest/90"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <div className="relative mt-3.5 overflow-hidden rounded-2xl border border-sand bg-cream-100">
              <img
                src={images[imgIndex]}
                alt={post.location || "Tour photo"}
                className="max-h-96 w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  {imgIndex > 0 && (
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => setImgIndex((i) => i - 1)}
                      className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  {imgIndex < images.length - 1 && (
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setImgIndex((i) => i + 1)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [postModalOpen, setPostModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserSummary>({
    _id: "current-user",
    name: "Wanderer",
    userName: "wanderer",
  });

  const [recommendedUsers, setRecommendedUsers] = useState<UserSummary[]>([]);
  const [homeTours, setHomeTours] = useState<TourPost[]>([]);
  const [userTours, setUserTours] = useState<TourPost[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [locationResults, setLocationResults] = useState<{
    query: string;
    tours: TourPost[];
  } | null>(null);

  const router = useRouter();
  const [loadingInitials, setLoadingInitials] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const fetchInitialData = useCallback(async () => {
    setLoadingInitials(true);
    try {
      const res = await fetch("/api/initials");
      if (res.status === 401) {
        router.push("/register");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.currentUser) {
          setCurrentUser({
            _id: String(data.currentUser._id),
            name: data.currentUser.name,
            userName: data.currentUser.userName,
            imgUrl: data.currentUser.imgUrl,
          });
        } else {
          router.push("/register");
          return;
        }
        setRecommendedUsers(
          data.users?.length ? data.users : FALLBACK_USERS,
        );
        setHomeTours(data.tours?.length ? data.tours : FALLBACK_TOURS);
      } else {
        router.push("/register");
        return;
      }
    } catch {
      router.push("/register");
    } finally {
      setLoadingInitials(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  async function fetchToursForUser(userId: string) {
    setLoadingFeed(true);
    try {
      const res = await fetch(`/api/tours/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserTours(data.tours || []);
      } else {
        setUserTours(
          homeTours.filter((tour) => tour.userId === userId),
        );
      }
    } catch {
      setUserTours(homeTours.filter((tour) => tour.userId === userId));
    } finally {
      setLoadingFeed(false);
    }
  }

  function handleSelectTab(tab: NavTab) {
    setActiveTab(tab);
    setSelectedUser(null);
    setLocationResults(null);
    if (tab === "your-posts") {
      fetchToursForUser(currentUser._id);
    }
  }

  function handleSelectRecommendedUser(user: UserSummary) {
    setSelectedUser(user);
    setLocationResults(null);
    fetchToursForUser(user._id);
  }

  const usersById = new Map(
    [currentUser, ...recommendedUsers].map((u) => [u._id, u]),
  );

  const displayedTours = locationResults
    ? locationResults.tours
    : selectedUser || activeTab === "your-posts"
      ? userTours
      : homeTours;

  const feedTitle = locationResults
    ? `Places matching "${locationResults.query}"`
    : selectedUser
      ? `${selectedUser.name}'s Posts`
      : activeTab === "your-posts"
        ? "Your Posts"
        : "Home";

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto flex max-w-7xl justify-center">
        <LeftPanel
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenPostModal={() => setPostModalOpen(true)}
          currentUser={currentUser}
        />

        <main className="min-h-screen w-full max-w-2xl flex-1 pb-20 md:pb-0">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sand bg-cream/90 px-5 py-4 backdrop-blur-md">
            <div>
              <h1 className="text-lg font-bold text-ink">{feedTitle}</h1>
              {selectedUser && (
                <p className="text-xs text-ink-soft">
                  @{selectedUser.userName}
                </p>
              )}
            </div>

            {(selectedUser || locationResults) && (
              <button
                type="button"
                onClick={() => handleSelectTab("home")}
                className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-forest hover:bg-sand"
              >
                Back to Home
              </button>
            )}
          </header>

          {loadingInitials || loadingFeed ? (
            <div className="divide-y divide-sand">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="animate-pulse space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-sand" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-32 rounded bg-sand" />
                      <div className="h-2.5 w-20 rounded bg-sand/70" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 rounded bg-sand/80" />
                  <div className="h-52 w-full rounded-2xl bg-cream-100" />
                </div>
              ))}
            </div>
          ) : displayedTours.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <p className="text-base font-semibold text-ink">
                No posts to show yet
              </p>
              <p className="mt-1 mb-5 max-w-xs text-xs text-ink-soft">
                Share where you have traveled recently and inspire fellow wanderers.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={() => setPostModalOpen(true)}
              >
                Create a Post
              </Button>
            </div>
          ) : (
            <div>
              {displayedTours.map((post) => (
                <FeedPostItem
                  key={post._id}
                  post={post}
                  author={usersById.get(post.userId)}
                />
              ))}
            </div>
          )}
        </main>

        <RightPanel
          recommendedUsers={recommendedUsers}
          loadingInitials={loadingInitials}
          onRetryInitials={fetchInitialData}
          selectedUserId={selectedUser?._id}
          onSelectUser={handleSelectRecommendedUser}
          onLocationResults={(tours, locationQuery) =>
            setLocationResults({ query: locationQuery, tours })
          }
          onClearLocationSearch={() => setLocationResults(null)}
        />
      </div>

      <CreatePostModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        userId={currentUser._id}
        onPosted={(response: any) => {
          const created = response?.data;
          if (created) {
            setHomeTours((prev) => [created, ...prev]);
            setUserTours((prev) => [created, ...prev]);
          }
        }}
      />
    </div>
  );
}