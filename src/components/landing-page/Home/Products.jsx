import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const Products = () => {
  const sectionRef = useRef(null);
  const imageRefs = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const projects = [
    {
      id: 1,
      year: "System",
      title: "Execution Engine",
      desc: "Tasks, docs, and decisions in one place. Real-time updates across teams.",
      img: "/landing_page/1.2.png",
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

  useEffect(() => {
    let mounted = true;
    const loadImages = async () => {
      try {
        const loadPromises = projects.map((project) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = project.img;
            img.onload = resolve;
            img.onerror = reject;
            img.decoding = "async";
          });
        });

        // Load images in batches to prevent network congestion
        const batchSize = 2;
        for (let i = 0; i < projects.length; i += batchSize) {
          const batch = loadPromises.slice(i, i + batchSize);
          await Promise.all(batch);
          if (!mounted) return;
        }

        if (mounted) {
          setImagesLoaded(true);
          
          setTimeout(() => {
            ScrollTrigger.refresh();
            requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });
          }, 100);
        }
      } catch (error) {
        console.warn("Some images failed to load:", error);
        if (mounted) {
          setImagesLoaded(true);
          setTimeout(() => ScrollTrigger.refresh(), 100);
        }
      }
    };

    loadImages();

    return () => {
      mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!imagesLoaded) return;

    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(".products-title", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "top 60%",
          once: true,
        },
      });

      // Card animations with staggered timing
      const cards = gsap.utils.toArray(".product-card");
      
      cards.forEach((card, index) => {
        requestAnimationFrame(() => {
          gsap.from(card, {
            opacity: 0,
            y: 60,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 50%",
              once: true,
              markers: false, 
            },
            onStart: () => {
              gsap.set(card, { 
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              });
            },
          });
        });
      });

      cards.forEach((card, index) => {
        const img = card.querySelector("img");
        if (img) {
          gsap.set(img, {
            scale: 1.05,
            transformOrigin: "center center"
          });
          
          gsap.to(img, {
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              end: "top 30%",
              scrub: 0.5,
              once: true,
            }
          });
        }
      });

    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger && trigger.trigger.closest(".product-card")) {
          trigger.kill();
        }
      });
    };
  }, [imagesLoaded]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-auto p-4 lg:p-8 space-y-10 overflow-hidden"
      style={{
        transform: 'translate3d(0,0,0)',
        willChange: 'transform',
      }}
    >
      {!imagesLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
        </div>
      )}

      <div className="text-center space-y-2">
        <h2 className="products-title text-2xl lg:text-4xl font-semibold text-white tracking-wide">
          Core Systems
        </h2>
        <p className="text-gray-400 text-sm lg:text-base">
          The operating system that replaces fragmented tools with a single,
          continuous platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="product-card relative rounded-xl overflow-hidden bg-[#111] shadow-lg will-change-transform"
            style={{
              aspectRatio: "16/10",
              transform: 'translate3d(0,0,0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            ref={el => imageRefs.current[index] = el}
          >
            <div 
              className="relative w-full h-full overflow-hidden"
              style={{
                willChange: 'transform',
                transform: 'translate3d(0,0,0)',
              }}
            >
              <motion.img
                src={project.img}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.05 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { 
                    duration: 0.6,
                    ease: [0.25, 0.1, 0.25, 1] 
                  } 
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                loading={imagesLoaded ? "eager" : "lazy"}
                draggable={false}
                decoding="async"
                style={{
                  imageRendering: 'auto',
                  willChange: 'transform',
                  transform: 'translate3d(0,0,0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitTransform: 'translate3d(0,0,0)',
                  transformStyle: 'preserve-3d',
                }}
              />
              
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"
                style={{
                  willChange: 'opacity',
                  transform: 'translate3d(0,0,0)',
                }}
              />
            </div>

            <div 
              className="absolute bottom-4 left-4 left-4 text-white space-y-1 z-10"
              style={{
                willChange: 'transform',
                transform: 'translate3d(0,0,0)',
              }}
            >
              <span className="text-sm text-gray-300 block">
                {project.year}
              </span>
              <h3 className="text-lg lg:text-xl font-medium">
                {project.title}
              </h3>
              <p className="text-xs lg:text-sm text-gray-400">
                {project.desc}
              </p>
            </div>

            <div className="absolute inset-0 z-0 md:hidden" />
          </div>
        ))}
      </div>

      <style jsx global>{`
        /* Enable smooth scrolling on the whole page */
        html {
          scroll-behavior: smooth;
        }
        
        /* Optimize scrolling performance */
        .product-card {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          contain: layout style paint; /* CSS containment */
        }
        
        /* Prevent iOS rubber band effect */
        .product-card img {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* Optimize paint performance */
        @media (prefers-reduced-motion: no-preference) {
          .product-card {
            animation: none; /* Prevent conflicting animations */
          }
        }
        
        /* Fix for WebKit browsers */
        @supports (-webkit-overflow-scrolling: touch) {
          .product-card {
            -webkit-overflow-scrolling: touch;
          }
        }
        
        /* Prevent tap highlights on mobile */
        @media (max-width: 768px) {
          .product-card {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </section>
  );
};

export default Products;