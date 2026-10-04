"use client";

import { useCallback, useEffect, useState } from "react";
import { Compass, MapPin, Plus } from "lucide-react";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import PlaceCard from "@/components/PlaceCard";
import CreatePostModal from "@/components/Createpostmodal";
import { NavTab, TourPost, UserSummary } from "@/types/wanderly";

const FALLBACK_USERS: UserSummary[] = [
  { _id: "u1", name: "Aarav Sharma", userName: "aarav_travels" },
  { _id: "u2", name: "Meera Nair", userName: "meerawanders" },
  { _id: "u3", name: "Rohan Verma", userName: "rohan_peaks" },
  { _id: "u4", name: "Kabir Joshi", userName: "kabir_trails" },
  { _id: "u5", name: "Ananya Roy", userName: "ananya_nomad" },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [postModalOpen, setPostModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserSummary>({
    _id: "current-user",
    name: "Wanderer",
    userName: "wanderer",
  });

  const [recommendedUsers, setRecommendedUsers] = useState<UserSummary[]>([]);
  const [initialTours, setInitialTours] = useState<TourPost[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  // Place/Location Search State for Middle Feed
  const [locationResults, setLocationResults] = useState<{
    query: string;
    tours: TourPost[];
  } | null>(null);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");

  const [loadingInitials, setLoadingInitials] = useState(true);

  const fetchInitialData = useCallback(async () => {
    setLoadingInitials(true);
    try {
      const res = await fetch("/api/initials");
      if (res.ok) {
        const data = await res.json();
        if (data.currentUser) {
          setCurrentUser({
            _id: String(data.currentUser._id),
            name: data.currentUser.name,
            userName: data.currentUser.userName,
            imgUrl: data.currentUser.imgUrl,
          });
        }
        setRecommendedUsers(
          data.users?.length ? data.users : FALLBACK_USERS,
        );
        if (data.tours?.length) {
          setInitialTours(data.tours);
        }
      } else {
        setRecommendedUsers(FALLBACK_USERS);
      }
    } catch {
      setRecommendedUsers(FALLBACK_USERS);
    } finally {
      setLoadingInitials(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  function handleSelectTab(tab: NavTab) {
    setActiveTab(tab);
    setSelectedUser(null);
    setLocationResults(null);
    setIsSearchingPlaces(false);
    setPlaceSearchQuery("");
  }

  function handleSelectRecommendedUser(user: UserSummary) {
    setSelectedUser(user);
    setLocationResults(null);
    setIsSearchingPlaces(false);
    setPlaceSearchQuery("");
  }

  function handleClearLocationSearch() {
    setLocationResults(null);
    setIsSearchingPlaces(false);
    setPlaceSearchQuery("");
  }

  const feedTitle = isSearchingPlaces
    ? `Searching places for "${placeSearchQuery}"...`
    : locationResults
      ? `Places matching "${locationResults.query}"`
      : selectedUser
        ? `${selectedUser.name}'s Posts`
        : activeTab === "your-posts"
          ? "Your Posts"
          : "Home";

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto flex max-w-7xl justify-center">
        {/* Left Navigation Panel */}
        <LeftPanel
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenPostModal={() => setPostModalOpen(true)}
          currentUser={currentUser}
        />

        {/* Center Main Column: Dynamic Feed and Place Search Results */}
        <main className="min-h-screen w-full max-w-2xl flex-1 border-r border-sand pb-20 md:pb-0">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sand bg-cream/90 px-5 py-4 backdrop-blur-md">
            <div>
              <h1 className="text-lg font-bold text-ink">{feedTitle}</h1>
              {selectedUser && (
                <p className="text-xs text-ink-soft">
                  @{selectedUser.userName}
                </p>
              )}
            </div>

            {(selectedUser || locationResults || isSearchingPlaces) && (
              <button
                type="button"
                onClick={() => handleSelectTab("home")}
                className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-forest hover:bg-sand transition"
              >
                Back to Home
              </button>
            )}
          </header>

          {/* Middle Portion: Dynamic Content State Machine */}
          {isSearchingPlaces ? (
            /* Loading State for Places Search */
            <div className="flex flex-col gap-6 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                <div className="h-2 w-2 rounded-full bg-forest animate-ping" />
                <span>Searching destinations...</span>
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse flex-col rounded-2xl border border-sand bg-white/70 p-5 shadow-xs"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-4 w-36 rounded-md bg-sand" />
                    <div className="h-3 w-20 rounded-md bg-sand/70" />
                  </div>
                  <div className="aspect-[16/10] w-full rounded-xl bg-sand/40" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3.5 w-full rounded-md bg-sand/60" />
                    <div className="h-3.5 w-3/4 rounded-md bg-sand/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : locationResults ? (
            /* Search Results for Places */
            locationResults.tours.length > 0 ? (
              <div className="flex flex-col gap-6 p-5">
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span>
                    Found {locationResults.tours.length}{" "}
                    {locationResults.tours.length === 1 ? "place" : "places"} matching &ldquo;{locationResults.query}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={handleClearLocationSearch}
                    className="font-semibold text-forest hover:underline"
                  >
                    Clear search
                  </button>
                </div>
                {locationResults.tours.map((tour) => (
                  <PlaceCard key={tour._id} tour={tour} />
                ))}
              </div>
            ) : (
              /* Empty State for Place Search */
              <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-forest shadow-xs">
                  <MapPin size={28} />
                </div>
                <h2 className="text-lg font-bold text-ink">No places found</h2>
                <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
                  We couldn&apos;t find any public tours or places matching &ldquo;{locationResults.query}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={handleClearLocationSearch}
                  className="mt-6 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-forest-dark"
                >
                  Clear Search
                </button>
              </section>
            )
          ) : initialTours.length > 0 && activeTab === "home" && !selectedUser ? (
            /* Home Feed with Initial Public Tours */
            <div className="flex flex-col gap-6 p-5">
              {initialTours.map((tour) => (
                <PlaceCard key={tour._id} tour={tour} />
              ))}
            </div>
          ) : (
            /* Default Feed Placeholder Slot */
            <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-forest shadow-xs">
                <Compass size={28} />
              </div>
              <h2 className="text-lg font-bold text-ink">Feed Stream</h2>
              <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
                {selectedUser
                  ? `Viewing posts by ${selectedUser.name}.`
                  : activeTab === "your-posts"
                    ? "Your published travel tours will appear here."
                    : "Center post feed stream. Public tours and stories appear here."}
              </p>

              <button
                type="button"
                onClick={() => setPostModalOpen(true)}
                className="mt-6 flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-forest-dark"
              >
                <Plus size={16} />
                <span>Create a Post</span>
              </button>
            </section>
          )}
        </main>

        {/* Right Discovery & Search Panel */}
        <RightPanel
          recommendedUsers={recommendedUsers}
          loadingInitials={loadingInitials}
          onRetryInitials={fetchInitialData}
          selectedUserId={selectedUser?._id}
          onSelectUser={handleSelectRecommendedUser}
          onLocationResults={(tours, locationQuery) =>
            setLocationResults({ query: locationQuery, tours })
          }
          onClearLocationSearch={handleClearLocationSearch}
          onLocationSearching={(isSearching, locationQuery) => {
            setIsSearchingPlaces(isSearching);
            setPlaceSearchQuery(locationQuery);
          }}
        />
      </div>

      {/* Post Creation Modal */}
      <CreatePostModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        userId={currentUser._id}
        onPosted={() => {
          fetchInitialData();
        }}
      />
    </div>
  );
}