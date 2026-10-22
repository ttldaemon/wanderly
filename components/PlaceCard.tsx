"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { TourFeed } from "@/types/wanderly";
import Image from "next/image";
import UserAvatar from "./ui/UserAvatar";
import { useAuth } from "@/context/authContext";
import EditPostModal from "./EditPostModal";

interface PlaceCardProps {
  tour: TourFeed;
  onTourChanged?: () => void | Promise<void>; // only be triggered when delete or edit is successful
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

export default function PlaceCard({ tour, onTourChanged }: PlaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = tour.imgUrls && tour.imgUrls.length > 0 ? tour.imgUrls : [];
  
  const { user } = useAuth();

  function nextImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  }

  function prevImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tour? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeleting(true);
    setDeleteError("");

    try {
      // passing tourId as search params 
      const res = await fetch(`/api/tours/${user?._id}?tourId=${tour._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.msg || "Failed to delete tour.");
      }

      await onTourChanged?.()
      
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete tour.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isOwner = user?._id === tour.userId;

  return (
    <article
      className="flex flex-col overflow-hidden rounded-2xl border border-sand bg-white/85 shadow-xs transition hover:border-sand-dark hover:bg-white"
    >
      {/* Card Header: Location & Timestamp */}
      <div className="flex items-center justify-between border-b border-sand/60 bg-cream/30 px-5 py-3.5">
        <UserAvatar user={tour.author} />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Calendar size={13} />
            <time dateTime={tour.createdAt}>{formatDate(tour.createdAt)}</time>
          </div>

          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Edit tour"
                title="Edit tour"
                onClick={() => setIsEditOpen(true)}
                disabled={deleting}
                className="rounded-lg p-2 text-ink-muted transition hover:bg-forest/10 hover:text-forest disabled:opacity-50"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                aria-label="Delete tour"
                title="Delete tour"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg p-2 text-ink-muted transition hover:bg-clay-light hover:text-clay disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Media Section */}
      {images.length > 0 ? (
        <div className="relative aspect-16/10 w-full overflow-hidden bg-sand/30">
          <Image
            src={images[currentImageIndex]}
            alt={`${tour.location} snapshot ${currentImageIndex + 1}`}
            className="h-full w-full object-cover transition duration-300"
            fill
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
        <div className="flex aspect-video w-full flex-col items-center justify-center bg-cream-100/50 text-ink-muted">
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

        <div className="flex items-center gap-2 text-forest">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest/10">
            <MapPin size={16} className="text-forest" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">
            {tour.location}
          </span>
        </div>

        {/* Tags */}
        {tour.tags && tour.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
        {deleteError && (
          <p role="alert" className="px-5 pb-3 text-sm text-clay">
            {deleteError}
          </p>
        )}

        {isOwner && (
          <EditPostModal
            tourId={tour._id}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            tour={tour}
            onUpdated={async () => {
              await onTourChanged?.()
            }}
          />
        )}
      </div>
    </article>
  );
}
