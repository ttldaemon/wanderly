import { MapPin } from "lucide-react";

interface EmptyLocationResultProps {
  query: string;
  handleClearLocationSearch: () => void;
}

export default function EmptyLocationResult({query, handleClearLocationSearch}: EmptyLocationResultProps) {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-forest shadow-xs">
        <MapPin size={28} />
      </div>
      <h2 className="text-lg font-bold text-ink">No places found</h2>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
        We couldn&apos;t find any public tours or places matching
        &ldquo;{query}&rdquo;.
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
}