"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryItem = {
  id: string;
  kind: "video" | "photo";
  url: string;
  posterUrl: string | null;
};

function thumbSrc(item: GalleryItem) {
  return item.kind === "video" ? item.posterUrl : item.url;
}

/**
 * Main viewer + thumbnails. The primary video is the default item but is only
 * fetched at preload="metadata" (poster shown) until played, and thumbnails
 * are small optimised images, so the page never pulls more video than the one
 * being viewed.
 */
export function ProductGallery({
  items,
  name,
}: {
  items: GalleryItem[];
  name: string;
}) {
  const [index, setIndex] = useState(0);

  if (items.length === 0) {
    return <div className="aspect-[4/5] w-full bg-store-tint" />;
  }

  const current = items[index];
  const many = items.length > 1;
  const go = (delta: number) =>
    setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-store-tint">
        {current.kind === "video" ? (
          <video
            key={current.id}
            className="h-full w-full bg-black object-cover"
            src={current.url}
            poster={current.posterUrl ?? undefined}
            controls
            preload="metadata"
            playsInline
          />
        ) : (
          <Image
            key={current.id}
            src={current.url}
            alt={name}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
          />
        )}

        {many && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-store-ink shadow transition-colors hover:bg-white"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-store-ink shadow transition-colors hover:bg-white"
            >
              →
            </button>
          </>
        )}
      </div>

      {many && (
        <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto">
          {items.map((item, i) => {
            const src = thumbSrc(item);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.kind} ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`relative h-20 w-16 shrink-0 overflow-hidden bg-store-tint outline-2 transition-opacity ${
                  i === index
                    ? "outline outline-brand"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                {src && (
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
                {item.kind === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
