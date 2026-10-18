"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Compass, MapPin, RotateCcw, Search, Users, X } from "lucide-react";
import { SearchMode, TourPost, UserSummary } from "@/types/wanderly";
import { buildSearchEndpoint } from "@/utils/search";

export { buildSearchEndpoint };

interface RightPanelProps {
  recommendedUsers: UserSummary[];
  loadingInitials: boolean;
  initialsError?: string | null;
  onRetryInitials?: () => void;
  selectedUserId?: string | null;
  onSelectUser: (user: UserSummary) => void;
  onLocationResults?: (tours: TourPost[], locationQuery: string) => void;
  onClearLocationSearch?: () => void;
  onLocationSearching?: (isSearching: boolean, locationQuery: string) => void;
}

function getUserInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "W";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function RightPanel({
  recommendedUsers,
  loadingInitials,
  initialsError,
  onRetryInitials,
  selectedUserId,
  onSelectUser,
  onLocationResults,
  onClearLocationSearch,
  onLocationSearching,
}: RightPanelProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("users");
  const [searchedUsers, setSearchedUsers] = useState<UserSummary[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Reference to abort controller for in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    // If query is empty, reset search state immediately
    if (!trimmed) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setSearchedUsers(null);
      setSearchError(null);
      setSearching(false);
      onLocationSearching?.(false, "");
      onClearLocationSearch?.();
      return;
    }

    const endpoint = buildSearchEndpoint(trimmed, mode);
    if (!endpoint) {
      setSearchedUsers(null);
      setSearchError(null);
      setSearching(false);
      onLocationSearching?.(false, "");
      return;
    }

    // Indicate searching state immediately while debouncing
    setSearching(true);
    setSearchError(null);
    if (mode === "places") {
      onLocationSearching?.(true, trimmed);
    }

    // 1.5-second (1500ms) debounce delay
    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        const payload = await res.json();

        if (!res.ok || !payload.success) {
          setSearchError(payload.msg || "Could not complete search");
          if (mode === "places") {
            onLocationResults?.([], trimmed);
          }
          return;
        }

        if (payload.isUsersData) {
          setSearchedUsers(payload.data || []);
        } else {
          onLocationResults?.(payload.data || [], trimmed);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setSearchError("Network error while searching");
        if (mode === "places") {
          onLocationResults?.([], trimmed);
        }
      } finally {
        setSearching(false);
        if (mode === "places") {
          onLocationSearching?.(false, trimmed);
        }
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [query, mode, onLocationResults, onClearLocationSearch, onLocationSearching]);

  function handleClearSearch() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setQuery("");
    setSearchedUsers(null);
    setSearchError(null);
    setSearching(false);
    onLocationSearching?.(false, "");
    onClearLocationSearch?.();
  }

  function handleModeChange(newMode: SearchMode) {
    if (newMode === mode) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMode(newMode);
    setSearchError(null);

    if (newMode === "places") {
      // Switching to places: reset searched users so recommended box shows recommended users
      setSearchedUsers(null);
    } else {
      // Switching to users: clear center location results
      onClearLocationSearch?.();
      onLocationSearching?.(false, "");
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  const displayedUsers =
    mode === "users" && searchedUsers !== null
      ? searchedUsers
      : recommendedUsers;

  const isUsersLoading =
    loadingInitials || (searching && mode === "users" && query.trim().length > 0);

  return (
    <aside
      aria-label="Search and Discovery"
      className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col gap-5 overflow-y-auto border-l border-sand bg-cream px-5 py-6 lg:flex xl:w-96"
    >
      <div className="flex flex-col gap-3">
        {/* Search Bar with 1.5s Debounce */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2.5 rounded-full border border-sand bg-white/80 px-4 py-2.5 transition focus-within:border-forest focus-within:bg-white focus-within:shadow-xs"
        >
          <Search size={18} className="shrink-0 text-ink-soft" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "users" ? "Search users by username..." : "Search places or destinations..."
            }
            aria-label="Search Wanderly"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={handleClearSearch}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-muted hover:bg-sand transition"
            >
              <X size={12} />
            </button>
          )}
        </form>

        {/* Segmented Toggle Control: Users vs Places */}
        <div
          role="radiogroup"
          aria-label="Search target mode"
          className="relative flex w-full items-center rounded-full border border-sand bg-cream-100/70 p-1 shadow-xs"
        >
          <button
            type="button"
            role="radio"
            aria-checked={mode === "users"}
            onClick={() => handleModeChange("users")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition-all duration-200 ${
              mode === "users"
                ? "bg-forest text-white shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Users size={13} />
            <span>Users</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={mode === "places"}
            onClick={() => handleModeChange("places")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition-all duration-200 ${
              mode === "places"
                ? "bg-forest text-white shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <MapPin size={13} />
            <span>Places</span>
          </button>
        </div>

        {/* Hint banner when searching places */}
        {mode === "places" && query.trim() && (
          <div className="flex items-center gap-2 rounded-xl bg-forest/5 border border-forest/15 px-3 py-2 text-xs text-forest">
            <Compass size={14} className="shrink-0 animate-spin-slow" />
            <span className="truncate">
              {searching
                ? `Searching places for "${query.trim()}"...`
                : `Place results are displayed in the center feed`}
            </span>
          </div>
        )}
      </div>

      {/* Recommended / Searched Users Box */}
      <section className="flex flex-col rounded-2xl border border-sand bg-cream-100/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-ink">
              {mode === "users" && searchedUsers !== null
                ? "Search results"
                : "Recommended users"}
            </h2>
            {mode === "users" && searching && (
              <span className="h-2 w-2 rounded-full bg-forest animate-ping" />
            )}
          </div>

          {mode === "users" && searchedUsers !== null && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-medium text-forest hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search or Initials Error Message */}
        {(initialsError || (mode === "users" && searchError)) && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-clay-light px-3 py-2.5 text-xs text-clay">
            <span>{searchError || initialsError}</span>
            {onRetryInitials && !searchError && (
              <button
                type="button"
                onClick={onRetryInitials}
                className="ml-2 flex items-center gap-1 font-semibold hover:underline"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            )}
          </div>
        )}

        {/* User List: Loading Skeletons */}
        {isUsersLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-3 rounded-xl p-2"
              >
                <div className="h-10 w-10 shrink-0 rounded-full bg-sand" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 rounded bg-sand" />
                  <div className="h-2.5 w-20 rounded bg-sand/70" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-ink-muted">No users found</p>
            <p className="mt-1 text-xs text-ink-soft">
              {searchedUsers !== null
                ? "Try searching with a different username."
                : "New travelers will appear here soon."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {displayedUsers.map((user) => {
              const isSelected = selectedUserId === user._id;
              return (
                <li key={user._id}>
                  <button
                    type="button"
                    onClick={() => onSelectUser(user)}
                    className={[
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                      isSelected
                        ? "bg-cream-200 ring-1 ring-forest/30"
                        : "hover:bg-cream-200/70",
                    ].join(" ")}
                  >
                    {user.imgUrl ? (
                      <img
                        src={user.imgUrl}
                        alt={user.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-semibold text-white">
                        {getUserInitials(user.name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-ink-soft">
                        @{user.userName}
                      </p>
                    </div>

                    <span className="rounded-full border border-sand-dark bg-white/80 px-3 py-1 text-xs font-medium text-ink transition group-hover:border-forest">
                      View
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}
