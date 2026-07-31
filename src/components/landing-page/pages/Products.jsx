import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "../Footer";
import Navbar from "../Navbar";
import { 
  getResponsiveScrollTrigger, 
  getResponsiveDuration,
  getResponsiveStagger,
  setupScrollTriggerRefresh,
  isMobile 
} from '../utils/scrollTriggerConfig';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    year: "System",
    title: "Execution Engine",
    desc: "Tasks, docs, and decisions in one place. Real-time updates across teams.",
    img: "/landing_page/1.1.png",
  },
  {
    id: 2,
    year: "System",
    title: "Collaboration Infrastructure",
    desc: "Live presence, async workflows, timezone-aware. Built for distributed teams.",
    img: "/landing_page/2.1.png",
  },
  {
    id: 3,
    year: "System",
    title: "Operational Layer",
    desc: "Permissions, governance, and continuity across projects without friction.",
    img: "/landing_page/3.1.png",
  },
  {
    id: 4,
    year: "System",
    title: "Founder Dashboard",
    desc: "Momentum metrics, priorities, and decisions — surfaced when they matter.",
    img: "/landing_page/4.4.png",
  },
  {
    id: 5,
    year: "System",
    title: "AI Workflows",
    desc: "Summaries, prioritization, and unblockers woven into real work, not popups.",
    img: "/landing_page/5.5.png",
  },
  {
    id: 6,
    year: "System",
    title: "Integrations",
    desc: "Connect critical tools without breaking continuity or adding noise.",
    img: "/landing_page/6.4.png",
  },
];

const Products = () => {
  const main = useRef();

  useEffect(() => {
    const mobile = isMobile();
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".product-card",
        { opacity: 0, y: mobile ? 30 : 50 },
        {
          opacity: 1,
          y: 0,
          duration: getResponsiveDuration(0.8),
          ease: "power3.out",
          stagger: getResponsiveStagger(0.15),
          scrollTrigger: getResponsiveScrollTrigger({
            trigger: ".products-grid",
            start: mobile ? "top 90%" : "top 85%",
          }),
        }
      );
    }, main);

    // Setup refresh on resize/orientation change
    const cleanup = setupScrollTriggerRefresh();

    return () => {
      ctx.revert();
      cleanup();
    };
  }, []);

  return (
    <>
      <Navbar  />
    <div ref={main} className="landing-page bg-[#0b0b0b] py-20 px-6 lg:px-20">
      <div className="text-center space-y-2 mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Core Systems
        </h2>
        <p className="text-gray-400 text-sm lg:text-base max-w-2xl mx-auto">
          The operating system that replaces fragmented tools with a single, continuous platform.
        </p>
      </div>

      <div className="products-grid grid grid-cols-1 md:grid-cols-2 gap-8 w-full mx-auto">
        {projects.map((project) => (
          <div key={project.id} className="product-card group rounded-xl overflow-hidden bg-[#111] shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
            <div className="relative h-64 lg:h-80 overflow-hidden bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
              <img loading="lazy" 
                src={project.img} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                onLoad={(e) => {
                  console.log(`✅ Image loaded: ${project.img}`);
                }}
                onError={(e) => {
                  console.error(`❌ Failed to load image: ${project.img}`);
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'flex flex-col items-center justify-center h-full text-gray-500 p-6';
                  fallback.innerHTML = `
                    <svg class="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm">${project.title}</p>
                  `;
                  e.target.parentElement.appendChild(fallback);
                }}
              />
              {/* Gradient overlay on images */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>
            <div className="p-6">
              <div className="text-xs text-purple-400 mb-2 font-medium uppercase tracking-wider">{project.year}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{project.desc}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
      <Footer />
      </>
  );
};

export default Products;
