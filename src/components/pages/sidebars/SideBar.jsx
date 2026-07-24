import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { getAllRoutes, getCurrentContext } from "./sidebar/links";
import DesktopSidebarContent from "./DesktopSidebarContent";
import MobileSidebarContent from "./MobileSidebarContent";
import { filterOutLauncherApps } from '@/utils/appLauncherUtils';


export default function SideBar({ isOpen, setIsOpen, isAdmin, links = [] }) {
  const location = useLocation();

  const [expandedItems, setExpandedItems] = useState({});
  const [userToggledItems, setUserToggledItems] = useState(new Set());
  const prevContextIdRef = useRef(null);

  const currentContextId = useMemo(
    () => getCurrentContext(location.pathname, links),
    [location.pathname, links]
  );

  // Auto-expand active context ONLY if user hasn't manually toggled it
  // AND don't collapse other sections
  useEffect(() => {
    if (currentContextId && currentContextId !== 1) {
      // Only proceed if the context has actually changed
      if (prevContextIdRef.current !== currentContextId) {
        setExpandedItems(prev => {
          // Only auto-expand if user has never manually toggled this item
          if (!userToggledItems.has(currentContextId)) {
            // Don't collapse other items, just add this one
            return { ...prev, [currentContextId]: true };
          }
          // If user has toggled it, don't change anything
          return prev;
        });
        prevContextIdRef.current = currentContextId;
      }
    }
  }, [currentContextId, userToggledItems]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const toggleExpand = (linkId) => {
    // Mark this item as manually toggled by user
    setUserToggledItems(prev => new Set(prev).add(linkId));
    setExpandedItems(prev => ({ ...prev, [linkId]: !prev[linkId] }));
  };

  const handleMobileLinkClick = () => setIsOpen(false);

  const hasSubItems = (link) => {
    return Array.isArray(link.subItems) && link.subItems.length > 0;
  };

  const shouldShowSubItems = (link) => {
    return getAllRoutes(link).includes(location.pathname);
  };

  // Swipe-to-close: track touch start X, close if swiped left ≥ 60px
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    if (deltaX > 60) setIsOpen(false);
    touchStartX.current = null;
  };

  // Filter out launcher apps if utility is available
  const filteredLinks = typeof filterOutLauncherApps === 'function'
    ? filterOutLauncherApps(links)
    : links;

  return (
    <>
      {/* Desktop Sidebar — below navbar (top-16), hidden on mobile */}
      <DesktopSidebarContent
        links={filteredLinks}
        currentContextId={currentContextId}
        expandedItems={expandedItems}
        toggleExpand={toggleExpand}
        hasSubItems={hasSubItems}
        shouldShowSubItems={shouldShowSubItems}
        isAdmin={isAdmin}
      />

      {/* Mobile Sidebar Drawer */}
      <div
        className={`lg:hidden fixed inset-0 transition-all duration-300 ease-in-out ${
          isOpen ? "visible" : "invisible pointer-events-none"
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Backdrop */}
        <button
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close sidebar"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`absolute left-0 top-0 h-[100dvh] w-[280px] max-w-[85vw] bg-[#1A1A1A] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drawer header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800 shrink-0">
            <span className="text-white font-semibold text-sm">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable nav content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <MobileSidebarContent
              onLinkClick={handleMobileLinkClick}
              links={links}
              currentContextId={currentContextId}
              expandedItems={expandedItems}
              toggleExpand={toggleExpand}
              isAdmin={isAdmin}
              hasSubItems={hasSubItems}
              shouldShowSubItems={shouldShowSubItems}
              callback={() => setIsOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Desktop spacer — keeps main content from going under the collapsed sidebar */}
      <div className="hidden lg:block w-[60px] shrink-0" />
    </>
  );
};