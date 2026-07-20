import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const HIDE_THRESHOLD = 120;

export function useDashboardNavHide() {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const isScrollingDown = currentScroll > lastScrollYRef.current;

      if (!isScrollingDown || currentScroll < 60) {
        setIsHidden(false);
      } else if (currentScroll > HIDE_THRESHOLD) {
        setIsHidden(true);
      }

      lastScrollYRef.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isHidden;
}

export default function DashboardTopNav({
  links = [],
  isHidden = false,
  className = "",
}) {
  const location = useLocation();

  if (!links.length) {
    return null;
  }

  return (
    <div
      className={`fixed inset-x-0 top-0 z-30 transform-gpu transition-transform duration-300 ease-in-out ${
        isHidden
          ? "-translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      } ${className}`}
    >
      <div className="mx-auto w-full px-3 py-3 sm:px-4">
        <nav
          className="flex items-center gap-2 rounded-full border border-white/10 bg-linear-to-r from-white/10 to-white/5 px-1 py-1 text-xs sm:text-sm shadow-2xl backdrop-blur"
          aria-label="dashboard navigation"
        >
          {links.map(({ href, icon: Icon, label }) => {
            const isActive =
              location.pathname === href ||
              (href !== "/" && location.pathname.startsWith(href));

            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
