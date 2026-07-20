/**
 * Mobile-optimized ScrollTrigger configuration
 * Provides responsive settings for better mobile experience
 */

export const isMobile = () => window.innerWidth < 768;
export const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;

/**
 * Get responsive ScrollTrigger config
 * @param {Object} options - Custom options to override defaults
 * @returns {Object} ScrollTrigger configuration
 */
export const getResponsiveScrollTrigger = (options = {}) => {
  const mobile = isMobile();
  const tablet = isTablet();

  const defaults = {
    // More relaxed triggers for mobile
    start: mobile ? "top 85%" : tablet ? "top 80%" : "top 75%",
    end: mobile ? "top 50%" : tablet ? "top 45%" : "top 40%",
    toggleActions: "play none none reverse",
    // Disable scrub on mobile for better performance
    scrub: mobile ? false : options.scrub !== undefined ? options.scrub : false,
    // Disable pin on mobile to prevent layout issues
    pin: mobile ? false : options.pin !== undefined ? options.pin : false,
    anticipatePin: mobile ? 0 : 1,
    // Add markers for debugging (remove in production)
    // markers: true,
  };

  return {
    ...defaults,
    ...options,
  };
};

/**
 * Get responsive animation duration
 * Faster animations on mobile for snappier feel
 */
export const getResponsiveDuration = (desktopDuration = 1.2) => {
  return isMobile() ? desktopDuration * 0.7 : desktopDuration;
};

/**
 * Get responsive stagger value
 * Reduced stagger on mobile to speed up animations
 */
export const getResponsiveStagger = (desktopStagger = 0.15) => {
  return isMobile() ? desktopStagger * 0.5 : desktopStagger;
};

/**
 * Refresh ScrollTrigger on orientation change
 * Prevents layout issues on mobile rotation
 */
export const setupScrollTriggerRefresh = () => {
  let timeoutId;
  
  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    }, 250);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    clearTimeout(timeoutId);
  };
};

/**
 * Check if animations should be disabled (for very slow devices)
 */
export const shouldReduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
