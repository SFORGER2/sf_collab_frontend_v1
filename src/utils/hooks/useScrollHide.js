import { useRef, useState, useCallback } from "react";

/**
 * useScrollHide
 * Toggles isHidden when the user scrolls down/up, with jitter thresholds.
 * Attach the returned onScroll to any scrollable container.
 */
export default function useScrollHide(options = {}) {
    const { deltaThreshold = 4, topReveal = 10 } = options;

    const [isHidden, setIsHidden] = useState(false);
    const lastScrollTopRef = useRef(0);
    const tickingRef = useRef(false);

    const onScroll = useCallback((e) => {
        const currentTop = e.currentTarget?.scrollTop ?? 0;

        if (!tickingRef.current) {
            window.requestAnimationFrame(() => {
                const delta = currentTop - lastScrollTopRef.current;
                const isScrollingDown = delta > deltaThreshold;
                const isScrollingUp = delta < -deltaThreshold;

                if (currentTop <= topReveal) {
                    setIsHidden(false);
                } else if (isScrollingDown) {
                    setIsHidden(true);
                } else if (isScrollingUp) {
                    setIsHidden(false);
                }

                lastScrollTopRef.current = currentTop <= 0 ? 0 : currentTop;
                tickingRef.current = false;
            });
            tickingRef.current = true;
        }
    }, [deltaThreshold, topReveal]);

    return { isHidden, setIsHidden, onScroll };
} 