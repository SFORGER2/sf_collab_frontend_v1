import React, { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef(null);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      // The scrollable container is in the Layout, not in this component
      // We need to find it by traversing up the DOM tree
      const scrollableContainer = document.querySelector(
        "div.overflow-y-auto.overflow-x-hidden"
      );
      const containerScrollTop = scrollableContainer?.scrollTop || 0;

      // Show button if container has scrolled
      setShowScrollTop(containerScrollTop > 100);
    };

    // Wait for the DOM to be ready
    const timer = setTimeout(() => {
      const scrollableContainer = document.querySelector(
        "div.overflow-y-auto.overflow-x-hidden"
      );
      if (scrollableContainer) {
        scrollableContainer.addEventListener("scroll", handleScroll);
        scrollContainerRef.current = scrollableContainer;
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    // Use the ref if available
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    // Fallback: find the container again
    const scrollableContainer = document.querySelector(
      "div.overflow-y-auto.overflow-x-hidden"
    );
    if (scrollableContainer) {
      scrollableContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {showScrollTop && (
        <button
          style={{zIndex:999999999999999}}
          className="fixed bottom-25 right-6 w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 "
          onClick={scrollToTop}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
