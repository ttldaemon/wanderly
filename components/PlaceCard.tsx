"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Image as ImageIcon, MapPin, Tag } from "lucide-react";
import { TourPost } from "@/types/wanderly";

interface PlaceCardProps {
  tour: TourPost;
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export default function PlaceCard({ tour }: PlaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = tour.imgUrls && tour.imgUrls.length > 0 ? tour.imgUrls : [];

  function nextImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  }

  function prevImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }

  return (
    <article
      aria-label={`Tour in ${tour.location}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-sand bg-white/85 shadow-xs transition hover:border-sand-dark hover:bg-white"
    >
      {/* Card Header: Location & Timestamp */}
      <div className="flex items-center justify-between border-b border-sand/60 px-5 py-3.5 bg-cream/30">
        <div className="flex items-center gap-2 text-forest">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest/10">
            <MapPin size={16} className="text-forest" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">
            {tour.location}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-ink-soft">
          <Calendar size={13} />
          <time dateTime={tour.createdAt}>{formatDate(tour.createdAt)}</time>
        </div>
      </div>

      {/* Card Media Section */}
      {images.length > 0 ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand/30">
          <img
            src={images[currentImageIndex]}
            alt={`${tour.location} snapshot ${currentImageIndex + 1}`}
            className="h-full w-full object-cover transition duration-300"
            loading="lazy"
          />

          {images.length > 1 && (
            <>
              {/* Carousel navigation buttons */}
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-white backdrop-blur-xs transition hover:bg-ink/70"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-white backdrop-blur-xs transition hover:bg-ink/70"
              >
                <ChevronRight size={18} />
              </button>

              {/* Counter Indicator badge */}
              <div className="absolute bottom-2.5 right-2.5 rounded-full bg-ink/70 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full flex-col items-center justify-center bg-cream-100/50 text-ink-muted">
          <ImageIcon size={32} className="opacity-40" />
          <span className="mt-2 text-xs">No photos attached</span>
        </div>
      )}

      {/* Card Content & Details */}
      <div className="flex flex-col gap-3 p-5">
        {tour.caption && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
            {tour.caption}
          </p>
        )}

        {/* Tags */}
        {tour.tags && tour.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Tag size={13} className="mr-0.5 text-ink-soft" />
            {tour.tags.map((tag, idx) => {
              const cleanTag = tag.trim().replace(/^#/, "");
              if (!cleanTag) return null;
              return (
                <span
                  key={idx}
                  className="rounded-full bg-cream-200/90 px-2.5 py-0.5 text-xs font-medium text-ink-muted transition hover:bg-sand"
                >
                  #{cleanTag}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
