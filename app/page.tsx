"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Plus, Compass } from "lucide-react";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import PlaceCard from "@/components/PlaceCard";
import CreatePostModal from "@/components/Createpostmodal";
import { NavTab, TourPost, UserSummary } from "@/types/wanderly";
import { useAuth } from "@/context/authContext";
import EmptyLocationResult from "@/components/ui/EmptyLocationResult";
import SkeletonLocSearch from "@/components/ui/SkeletonLocSearch";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [postModalOpen, setPostModalOpen] = useState(false);

  const { user } = useAuth();
  const [recommendedUsers, setRecommendedUsers] = useState<UserSummary[]>([]);
  const [initialTours, setInitialTours] = useState<TourPost[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  const [locationResults, setLocationResults] = useState<{
    query: string;
    tours: TourPost[];
  } | null>(null);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");

  const router = useRouter();
  const [loadingInitials, setLoadingInitials] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      const res = await fetch("/api/initials");

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        setRecommendedUsers(data.users?.length ? data.users : []);
        setInitialTours(data.tours?.length ? data.tours : [])
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

  const handleClearLocationSearch = useCallback(() => {
    setLocationResults(null);
    setIsSearchingPlaces(false);
    setPlaceSearchQuery("");
  }, [])

  const handleLocationSearching = useCallback(
    (isSearching: boolean, locationQuery: string) => {
      setIsSearchingPlaces(isSearching);
      setPlaceSearchQuery(locationQuery);
    },
    [],
  );

  const handleLocationResults = useCallback(
    (tours: TourPost[], locationQuery: string) => {
      setLocationResults({ query: locationQuery, tours });
    },
    [],
  );


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
          currentUser={user}
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

          {/* Middle Portion*/}
          {isSearchingPlaces ? <SkeletonLocSearch /> : locationResults ? (
            /* Search Results for Places */
            locationResults.tours.length > 0 ? (
              <div className="flex flex-col gap-6 p-5">
                {locationResults.tours.map((tour) => (
                  <PlaceCard key={tour._id} tour={tour} />
                ))}
              </div>
            ) : <EmptyLocationResult query={locationResults.query} handleClearLocationSearch={handleClearLocationSearch} />
          ) : initialTours.length > 0 &&
            activeTab === "home" &&
            !selectedUser ? (
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
          onLocationResults={handleLocationResults}
          onClearLocationSearch={handleClearLocationSearch}
          onLocationSearching={handleLocationSearching}
        />
      </div>

      {/* Post Creation Modal */}
      {user && (
        <CreatePostModal
          isOpen={postModalOpen}
          onClose={() => setPostModalOpen(false)}
          userId={user._id}
          onPosted={() => {
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
}
