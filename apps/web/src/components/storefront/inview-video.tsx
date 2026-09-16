"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted/looped ambient video (hero, featured, store) that only starts
 * fetching and playing once it's near the viewport, so it never competes
 * with the hero for bandwidth on first load.
 */
export function InViewVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string | null;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView) {
      el.play().catch(() => {
        // Autoplay can be blocked in rare cases; poster remains visible.
      });
    } else {
      el.pause();
    }
  }, [inView]);

  return (
    <video
      ref={ref}
      poster={poster ?? undefined}
      muted
      loop
      playsInline
      preload="none"
      className={className}
      src={inView ? src : undefined}
    />
  );
}
