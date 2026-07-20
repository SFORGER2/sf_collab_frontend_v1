import { useEffect, useRef } from "react";

export default function useInfiniteObserver({
  targetRef,
  onIntersect,
  enabled = true,
  root = null,
  rootMargin = "400px",
  threshold = 0.1,
}) {
  const observerRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      observerRef.current?.disconnect();
      return;
    }

    if (!targetRef?.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && enabled) {
          onIntersect();
        }

      },
      { root, rootMargin, threshold }
    );

    observerRef.current.observe(targetRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enabled, targetRef, onIntersect, root, rootMargin, threshold]);
}
