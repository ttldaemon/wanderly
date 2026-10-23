"use client"
import { useState } from "react"

export type SearchUser={
    _id: string;
    name: string;
    userName: string;
    imgUrl?: string;
}
export type SearchTour={
    _id: string;
    userId: string;
    imgUrls: string[];
    caption: string;
    location: string;
    tags: string[];
    createdAt: string;
}
type SearchBarProps = {
    onResults: (
        userOrTour: SearchUser[] | SearchTour[],
        isUserData: boolean
    ) => void;
};

export default function SearchBar({ onResults }: SearchBarProps) {
const [error, setError] = useState("");
const [searchType, setSearchType] =
    useState<"userName" | "location">("location");
const [query, setQuery] = useState("");
const [isLoading, setIsLoading] = useState(false);
async function handleSearch() {
    if (!query.trim()) {
        return;
    }
    setError("");
    setIsLoading(true);

    try {
        const params = new URLSearchParams();
        params.set(searchType, query.trim());

        const response = await fetch(`/api/search?${params.toString()}`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.msg);
        }

        onResults(payload.data, payload.isUsersData);
    } catch (error) {
         setError(
        error instanceof Error
            ? error.message
            : "Something went wrong while searching."
    );
    } finally {
        setIsLoading(false);
    }
}
return (
    <form
        onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
        }}
        className="w-full max-w-xl "
    >
        <div className="flex items-center gap-2">
        <select
            value={searchType}
            onChange={(event) =>
                setSearchType(
                    event.target.value as "userName" | "location"
                )
            }
            className="rounded-md border border-sand bg-white px-3 py-2.5 text-xs font-semibold text-ink outline-none transition focus:border-forest"
        >
            <option value="location">Places</option>
            <option value="userName">People</option>
        </select>

        <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
                searchType === "userName"
                    ? "Search people..."
                    : "Search places..."
            }
            className="flex-1 rounded-md border border-sand bg-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint transition focus:border-forest"
        />
        <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-forest px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isLoading ? "Searching..." : "Search"}
        </button>
        </div>

        {error && (
        <p className="mt-2 text-xs text-clay">
        {error}
        </p>
)}
    </form>
    
);
}