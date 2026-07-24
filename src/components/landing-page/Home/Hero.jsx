// landingpages/home/hero.jsx
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, X ,ArrowRight} from 'lucide-react';

import { heroAssest } from '../utils';
import { motion } from 'framer-motion';
import { ShineButton } from '../../lightswind/shine-button';
import { useNavigate } from 'react-router-dom';
import { 
  getResponsiveScrollTrigger, 
  getResponsiveDuration, 
  setupScrollTriggerRefresh,
  isMobile 
} from '../utils/scrollTriggerConfig';
import ShinyText from '@/components/ui/ShinyText';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const popupRef = useRef(null);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const backgroundMetricsRef = useRef(null);
  const mainHeadingRef = useRef(null);
  const liveStatsRef = useRef(null);
  const navigate=useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Main scroll animation controller
 useLayoutEffect(() => {
  if (!contentRef.current || !sectionRef.current) return;

  const mobile = isMobile();

  const ctx = gsap.context(() => {

    const introTargets = [
      mainHeadingRef.current,
      backgroundMetricsRef.current,
      liveStatsRef.current,
    ].filter(Boolean);

    gsap.from(introTargets, {
      opacity: 0,
      y: mobile ? 20 : 40,
      duration: getResponsiveDuration(1.2),
      ease: "power3.out",
      stagger: mobile ? 0.1 : 0.2,
      delay: 0.3,
    });

    if (!mobile) {
      gsap.fromTo(
        contentRef.current,
        { scale: 1, opacity: 1 },
        {
          scale: 1.5,
          opacity: 0,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        }
      );

     
      gsap.to(backgroundMetricsRef.current, {
        y: -40,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(liveStatsRef.current, {
        opacity: 0,
        y: 20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(imageRef.current, {
        scale: 1.2,
        opacity: 0.3,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    } else {
      
      gsap.to(contentRef.current, {
        opacity: 0.8,
        scrollTrigger: getResponsiveScrollTrigger({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        }),
      });
    }

  }, sectionRef);

  const cleanup = setupScrollTriggerRefresh();

  return () => {
    ctx.revert();
    cleanup();
  };
}, []);

  const openPopup = () => {
    setIsPopupOpen(true);
    gsap.fromTo(
      popupRef.current,
      { 
        opacity: 0, 
        scale: 0.95,
        display: 'flex'
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log("Video play failed:", e));
          }
        },
      }
    );
  };

  const closePopup = () => {
    gsap.to(popupRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: 'power3.in',
      onComplete: () => {
        gsap.set(popupRef.current, { display: 'none' });
        setIsPopupOpen(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      },
    });
  };

  // Close popup on ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isPopupOpen) {
        closePopup();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isPopupOpen]);

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isPopupOpen && popupRef.current && 
          !popupRef.current.contains(e.target) && 
          !e.target.closest('button[onclick]')) {
        closePopup();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isPopupOpen]);

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Content Container */}
      <div
        ref={contentRef}
        className="h-screen w-full relative flex flex-col items-center justify-center z-20 overflow-hidden  md:px-8"
      >
        {/* Layer 1 — Background Metrics (Massive, Subtle) */}
        <div 
          ref={backgroundMetricsRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-[15vw] md:text-[18vw] lg:text-[20vw] font-black uppercase opacity-[0.06] tracking-tight leading-none whitespace-nowrap font-mono">
            <div className="translate-y-[-5%]">
              SF COLLAB
            </div>
          </div>
        </div>

        {/* Layer 2 — Main Authority Statement */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 bg-black/10 backdrop-blur-sm rounded-lg py-6 md:py-10">
        <div className="relative z-10 text-center">
          <h1 
            ref={mainHeadingRef}
            className="text-[12vw] sm:text-[10vw] md:text-[9vw] lg:text-[8vw] font-semibold uppercase text-white tracking-tight leading-[0.9]"
          >
             <ShinyText
                  text="COLLABORATION" 
                  // disabled={false} 
                  speed={3} 
                  className='custom-title opacity-95' 
                />
              
            <br />
            <ShinyText 
                  text="without" 
                  // disabled={false} 
                  speed={3} 
                  className='custom-title opacity-95 md:text-7xl text-5xl'
                />
              
            <br />
            <ShinyText 
                  text="friction" 
                  // disabled={false} 
                  speed={3} 
                  className='custom-title opacity-95 md:text-7xl text-4xl' 
                />
              
          </h1>
        </div>

        {/* Layer 3 — Proof-Driven Subline */}
        <div className="relative z-10 mt-4 md:mt-6 max-w-xl md:max-w-2xl px-4 md:text-auto text- text-center">
          <p className="text-base md:text-lg lg:text-xl text-white/85 font-light tracking-wide leading-relaxed">
            The real-time canvas where distributed teams build, think, and create in syncing.
            <span className="block mt-2 text-sm md:text-base text-white/50 md:pt-0 pt-6 font-normal">
              Sub-50ms sync • Infinite workspace • Enterprise-grade
            </span>
          </p>
        </div>
      </div>
        

        {/* Animated Metric Ticker */}
        <div 
        ref={liveStatsRef}
        className="absolute bottom-4 md:bottom-8 left-4 md:right-0 px-4">
          <div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12 opacity-80">
            <ShineButton
            onClick={()=>navigate('/waitlist')}
            label='Join Waitlist'
            icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              className="group cursor-pointer relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all duration-300 font-medium text-lg overflow-hidden"
            >
            </ShineButton>
          </div>
        </div>

        {/* Interactive CTA */}
            <div className="absolute bottom-4 left-4 md:bottom-6 md:right-6 z-20">
          <button
            onClick={openPopup}
            className=" group flex items-center justify-center gap-2 w-12 h-12 md:w-auto md:h-auto px-0 py-0 md:px-5 md:py-2.5 rounded-full bg-transparent md:bg-transparent backdrop-blur-sm border border-white/20 font-medium cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <span className="hidden md:inline text-sm md:text-base">
              Experience Live
              </span>
            <div
              className="w-10 h-10 md:w-7 md:h-7 rounded-full bg-black md:bg-white flex items-center justify-center"
            >
              <Play className="w-4 h-4 md:w-4 md:h-4 fill-white md:fill-black text-white md:text-black" />
            </div>
          </button>
        </div>
      </div>

      {/* Background video */}
      <div className="absolute inset-0 w-full h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 z-10"></div>
        <video
          ref={imageRef}
          src={heroAssest.herovideoFour}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Popup Modal */}
      <div
        ref={popupRef}
        style={{ display: isPopupOpen ? 'flex' : 'none' }}
        className="fixed inset-0 items-center justify-center bg-black/90 backdrop-blur-sm z-50 p-4 hidden"
      >
        <div className="relative w-full max-w-4xl lg:w-full aspect-video rounded-lg md:rounded-xl overflow-hidden bg-black shadow-2xl">
          <video
            ref={videoRef}
            src={heroAssest.herovideoOne}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
          />
          
          <button
            onClick={closePopup}
            className="absolute top-3 left-3 md:top-4 md:left-4 z-50 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all backdrop-blur-sm"
            aria-label="Close video"
          >
            <X className="text-white w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
