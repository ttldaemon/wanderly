"use client";

import { FormEvent, useEffect, useState } from "react";
import { MapPin, RotateCcw, Search, Users, X } from "lucide-react";
import { SearchMode, TourPost, UserSummary } from "@/types/wanderly";

interface RightPanelProps {
  recommendedUsers: UserSummary[];
  loadingInitials: boolean;
  initialsError?: string | null;
  onRetryInitials?: () => void;
  selectedUserId?: string | null;
  onSelectUser: (user: UserSummary) => void;
  onLocationResults?: (tours: TourPost[], locationQuery: string) => void;
  onClearLocationSearch?: () => void;
}

function getUserInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "W";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function buildSearchEndpoint(rawQuery: string, mode: SearchMode = "users") {
  const trimmed = rawQuery.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("@")) {
    const cleanUser = trimmed.slice(1).trim();
    return cleanUser ? `/api/search?userName=${encodeURIComponent(cleanUser)}` : null;
  }

  const param = mode === "places" ? "location" : "userName";
  return `/api/search?${param}=${encodeURIComponent(trimmed)}`;
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
}: RightPanelProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("users");
  const [searchedUsers, setSearchedUsers] = useState<UserSummary[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const endpoint = buildSearchEndpoint(query, mode);
    if (!endpoint) {
      setSearchedUsers(null);
      setSearchError(null);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);

      try {
        const res = await fetch(endpoint);
        const payload = await res.json();

        if (!res.ok || !payload.success) {
          setSearchError(payload.msg || "Could not complete search");
          return;
        }

        if (payload.isUsersData) {
          setSearchedUsers(payload.data || []);
        } else if (onLocationResults) {
          onLocationResults(payload.data || [], query.trim());
        }
      } catch {
        setSearchError("Network error while searching");
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, mode]);

  function handleClearSearch() {
    setQuery("");
    setSearchedUsers(null);
    setSearchError(null);
    onClearLocationSearch?.();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  const displayedUsers = searchedUsers !== null ? searchedUsers : recommendedUsers;
  const isLoading = loadingInitials || (searching && mode === "users");

  return (
    <aside
      aria-label="Search and Recommended Users"
      className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col gap-5 overflow-y-auto border-l border-sand bg-cream px-5 py-6 lg:flex xl:w-96"
    >
      <div className="flex flex-col gap-2.5">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2.5 rounded-full border border-sand bg-white/80 px-4 py-2.5 transition focus-within:border-forest focus-within:bg-white"
        >
          <Search size={18} className="shrink-0 text-ink-soft" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "users" ? "Search users..." : "Search places..."
            }
            aria-label="Search Wanderly"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={handleClearSearch}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-cream-200 text-ink-muted hover:bg-sand"
            >
              <X size={12} />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => {
              setMode("users");
              onClearLocationSearch?.();
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
              mode === "users"
                ? "bg-forest text-white"
                : "bg-cream-100 text-ink-muted hover:bg-cream-200"
            }`}
          >
            <Users size={12} />
            <span>Users</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("places");
              setSearchedUsers(null);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
              mode === "places"
                ? "bg-forest text-white"
                : "bg-cream-100 text-ink-muted hover:bg-cream-200"
            }`}
          >
            <MapPin size={12} />
            <span>Places</span>
          </button>
        </div>
      </div>

      <section className="flex flex-col rounded-2xl border border-sand bg-cream-100/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            {searchedUsers !== null ? "Search results" : "Recommended users"}
          </h2>
          {searchedUsers !== null && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-medium text-forest hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {(initialsError || searchError) && (
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

        {isLoading ? (
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
