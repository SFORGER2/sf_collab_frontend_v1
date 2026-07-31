import React, { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef(null);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollableContainer = document.getElementById("main-content");
      const containerScrollTop = scrollableContainer?.scrollTop || 0;
      setShowScrollTop(containerScrollTop > 100);
    };

    const timer = setTimeout(() => {
      const scrollableContainer = document.getElementById("main-content");
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const scrollableContainer = document.getElementById("main-content");
    if (scrollableContainer) {
      scrollableContainer.scrollTo({ top: 0, behavior: "smooth" });
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
