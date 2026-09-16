import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only after client-side hydration. Uses useSyncExternalStore (server
 * snapshot false, client snapshot true) instead of a setState-in-effect
 * guard, so there's no extra render pass or lint violation for state
 * that's read from localStorage and would otherwise mismatch SSR output.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
