import type { Transition } from "framer-motion"

/**
 * Shared scale+fade animation used for feature tag buttons and chips.
 * Elements fade in and scale up from 0.85 → 1.
 */
export const scaleFadeIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.85 },
} as const

/**
 * Returns a transition config with a staggered delay based on the item's index.
 * Each item cascades in 40ms after the previous one.
 */
export function getScaleFadeTransition(index: number): Transition {
  return {
    duration: 0.18,
    delay: index * 0.04,
    ease: "easeOut",
  }
}
