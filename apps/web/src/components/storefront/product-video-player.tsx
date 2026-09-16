"use client";

export function ProductVideoPlayer({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string | null;
  posterUrl: string | null;
}) {
  if (!videoUrl) {
    return (
      <div className="aspect-[3/4] w-full bg-warm-grey-light sm:aspect-[4/5]" />
    );
  }

  return (
    <video
      className="aspect-[3/4] w-full bg-ink object-cover sm:aspect-[4/5]"
      src={videoUrl}
      poster={posterUrl ?? undefined}
      controls
      preload="metadata"
      playsInline
    />
  );
}
