import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const StartUp = () => {
  
  // const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.to(imageRef.current, {
          y: 120,
          scale: 1.25,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.to(imageRef.current, {
          y: 60,
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      });

      /* -------------------------
         CONTENT ENTRANCE
      -------------------------- */
      const contentTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      contentTl
        .from(".startup-tagline", { opacity: 0, y: 20, duration: 0.5 })
        .from(".startup-title", { opacity: 0, y: 30, duration: 0.6 }, "-=0.3")
        .from(".startup-description", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
        .from(".startup-cta", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3");
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={sectionRef} className="w-full flex items-center justify-center lg:min-h-screen md:min-h-[90vh] min-h-[95vh] relative overflow-hidden">
        {/* Background Image with enhanced mobile positioning */}
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            className="w-full h-full lg:object-cover md:object-cover object-cover lg:brightness-[0.35] md:brightness-[0.4] brightness-[0.45] lg:object-center md:object-center object-[60%_center]"
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1600"
            alt="Startup workspace background"
            style={{
              willChange: "transform",
              transform: "translateY(0) scale(1.25)",
            }}
          />
          {/* Multi-layer gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 lg:from-black/50 lg:via-transparent lg:to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent lg:from-black/30" />
        </div>

        {/* Main Content Container - Better spacing and alignment */}
        <div className="relative z-10 w-full h-full flex items-center lg:items-center md:items-center items-end lg:pb-0 md:pb-0 pb-20">
          <div className="w-full lg:max-w-7xl md:max-w-5xl mx-auto lg:px-20 md:px-12 px-6">
            {/* Content Grid for better desktop layout */}
            <div className="grid lg:grid-cols-12 md:grid-cols-1 grid-cols-1 gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 md:col-span-1 flex flex-col lg:space-y-8 md:space-y-6 space-y-5 text-white">
                {/* Tagline with icon */}
                <div className="startup-tagline flex items-center gap-2 lg:gap-3">
                  <Sparkles className="lg:w-5 lg:h-5 md:w-4 md:h-4 w-3.5 h-3.5 text-purple-400" />
                  <span className="lg:text-sm md:text-xs text-[11px] uppercase tracking-[0.2em] text-purple-300/90 font-semibold">
                    For Builders Who Ship
                  </span>
                </div>
                
                {/* Main Heading - More dramatic on desktop */}
                <div className="startup-title flex flex-col lg:space-y-3 md:space-y-2 space-y-1">
                  <h1 className="lg:text-8xl md:text-6xl text-5xl font-bold drop-shadow-2xl lg:leading-[1.1] md:leading-tight leading-tight">
                    The Startup
                  </h1>
                  <h1 className="lg:text-8xl md:text-6xl text-5xl font-bold drop-shadow-2xl bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent lg:leading-[1.1] md:leading-tight leading-tight">
                    Operating System
                  </h1>
                </div>
                
                {/* Description - Better readability */}
                <p className="startup-description lg:text-2xl md:text-xl text-lg lg:tracking-tight md:tracking-tight tracking-normal lg:leading-relaxed md:leading-relaxed leading-relaxed lg:max-w-2xl md:max-w-xl max-w-md drop-shadow-lg text-white/95 lg:font-normal md:font-normal font-light">
                  Where ideas meet execution. One platform for everything your startup needs to build, collaborate, and scale.
                </p>
                
                {/* CTA Buttons - Enhanced with icon */}
                <div className="startup-cta flex flex-col sm:flex-row gap-4 lg:pt-4 md:pt-2 pt-2">
                  <Link
                    className="group lg:py-5 md:py-4 py-3.5 lg:px-8 md:px-7 px-6 bg-white text-zinc-900 font-bold lg:text-lg md:text-base text-sm hover:bg-purple-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl flex items-center justify-center gap-2 shadow-xl"
                    to="https://sfcollab.com/login"
                    target='_blank'
                  >
                    <span>Request Access</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  {/* Secondary CTA - Desktop/Tablet only */}
                  <a
                    href="#features"
                    className="hidden sm:flex group lg:py-5 md:py-4 py-3.5 lg:px-8 md:px-7 px-6 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold lg:text-lg md:text-base text-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300 rounded-2xl items-center justify-center gap-2"
                  >
                    <span>Explore Features</span>
                  </a>
                </div>
                
                {/* Stats or trust indicators - Desktop only */}
                <div className="hidden lg:flex items-center gap-8 pt-4 text-white/70">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">500+</span>
                    <span className="text-sm">Startups Building</span>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">Real-time</span>
                    <span className="text-sm">Collaboration</span>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">AI-Powered</span>
                    <span className="text-sm">Workflows</span>
                  </div>
                </div>
              </div>
              
              {/* Right side spacer for balance on desktop */}
              <div className="lg:col-span-5 hidden lg:block"></div>
            </div>
          </div>
        </div>
        
        {/* Branding Watermark - Responsive sizing */}
        <div className="absolute lg:bottom-12 lg:right-12 md:bottom-8 md:right-8 bottom-6 right-6 text-white/[0.08] font-extrabold pointer-events-none select-none">
          <span className="lg:text-[10rem] md:text-[7rem] text-[3rem] uppercase tracking-tighter drop-shadow-2xl">
            SF
          </span>
        </div>
        
        {/* Decorative elements - Desktop only */}
        <div className="hidden lg:block absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="hidden lg:block absolute bottom-40 left-20 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-300"></div>
      </section>
    </>
  );
};

export default StartUp;
