import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  getResponsiveScrollTrigger, 
  getResponsiveDuration,
  isMobile 
} from './utils/scrollTriggerConfig';
import MediaLinks from "../../utils/MediaLinks";
import { Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Custom TikTok Icon Component
const TikTokIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const el = footerRef.current;
    const mobile = isMobile();
    
    gsap.fromTo(
      el,
      { opacity: 0, y: mobile ? 30 : 60 },
      {
        opacity: 1,
        y: 0,
        duration: getResponsiveDuration(1.2),
        ease: "power3.out",
        scrollTrigger: getResponsiveScrollTrigger({
          trigger: el,
          start: mobile ? "top 95%" : "top bottom",
        }),
      }
    );
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#0b0b0b] z-999999999999 text-gray-300 py-16 px-6 lg:px-20 border-t border-white/10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/*Brand*/}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">SFCollab</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            A startup operating system that unifies execution, collaboration, operations, and AI-assisted workflows into one continuous platform.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {[
              { name: "Home", href: "/" },
              { name: "Platform", href: "/about" },
              { name: "Startups", href: "/startuppage" },
              { name: "Explore", href: "/explore_section" },
              { name: "Newsletters", href: "/newsletters" },
              { name: "Team", href: "/team" },
              { name: "Contact", href: "/contact" },
            ].map((link, i) => (
              <li key={i}>
                <Link
                  to={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Resources</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/waitlist" className="hover:text-white">
                Join Waitlist
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-and-conditions" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/data-collection-and-tracking" className="hover:text-white">
                Data Collection Policy
              </Link>
            </li>
            <li>
              <Link to="/unsubscribe" className="hover:text-white">
                Unsubscribe
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Help & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Connect</h3>
          <div className="flex items-center gap-4 mb-4">
            <MediaLinks />
          </div>
          <p className="flex items-center gap-4 text-sm text-gray-400">
            <Mail className="w-5 h-5 text-gray-400" />
              <a
                href="mailto:sfcollab333@gmail.com"
                className="hover:text-white transition"
              >
                sfcollab333@gmail.com
              </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 mt-10 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SFCollab. Built for seamless startup collaboration. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
