import React from 'react';

/**
 * SkipToContent component provides a skip link for keyboard users
 * to bypass navigation and jump directly to main content.
 * 
 * This link is visually hidden until focused, making it invisible
 * to mouse users but accessible to keyboard users.
 */
const SkipToContent = () => {
  const handleSkip = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-9999 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
