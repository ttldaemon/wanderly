import { SearchMode } from "@/types/wanderly";

/**
 * Constructs the backend search endpoint according to whether the search mode is
 * "users" or "places".
 * 
 * - In "users" mode: queries `/api/search?userName=<query>`
 * - In "places" mode: queries `/api/search?location=<query>`
 */
export function buildSearchEndpoint(rawQuery: string, mode: SearchMode = "users"): string | null {
  const trimmed = rawQuery ? rawQuery.trim() : "";
  if (!trimmed) return null;

  if (mode === "places") {
    return `/api/search?location=${encodeURIComponent(trimmed)}`;
  }

  if (trimmed.startsWith("@")) {
    const cleanUser = trimmed.slice(1).trim();
    return cleanUser ? `/api/search?userName=${encodeURIComponent(cleanUser)}` : null;
  }

  return `/api/search?userName=${encodeURIComponent(trimmed)}`;
}
