import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getResponsiveScrollTrigger, getResponsiveDuration, isMobile } from './utils/scrollTriggerConfig';
import MediaLinks from "../../utils/MediaLinks";
import { Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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
      className="relative bg-[#0b0b0b]/80 backdrop-blur-md text-gray-300 py-16 px-6 lg:px-20 border-t border-purple-500/20"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">SFCollab</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            A startup operating system unifying execution, collaboration, operations, and AI-assisted workflows into one continuous platform.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {[
              { name: "Home", href: "/" },
              { name: "Platform", href: "/about" },
              { name: "Startups", href: "/startuppage" },
              { name: "Explore", href: "/explore_section" },
              { name: "Team", href: "/team" },
              { name: "Contact", href: "/contact" },
            ].map((link, i) => (
              <li key={i}>
                <Link
                  to={link.href}
                  className="hover:text-purple-400 transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Resources</h3>
          <ul className="space-y-2">
            <li><Link to="/waitlist" className="hover:text-purple-400">Join Waitlist</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-purple-400">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="hover:text-purple-400">Terms of Service</Link></li>
            <li><Link to="/data-collection-and-tracking" className="hover:text-purple-400">Data Collection Policy</Link></li>
            <li><Link to="/contact" className="hover:text-purple-400">Help & Support</Link></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Connect</h3>
          <div className="flex items-center gap-4 mb-4">
            <MediaLinks />
          </div>
          <p className="flex items-center gap-3 text-sm text-gray-400">
            <Mail className="w-5 h-5 text-gray-400" />
            <a href="mailto:sfcollab333@gmail.com" className="hover:text-purple-400 transition">
              sfcollab333@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-purple-500/20 mt-10 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SFCollab · Built for seamless startup collaboration · All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
