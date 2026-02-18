import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Users, Brain, TrendingUp, Building2, Palette } from "lucide-react";
import { 
  getResponsiveScrollTrigger, 
  getResponsiveDuration,
  getResponsiveStagger,
  setupScrollTriggerRefresh,
  isMobile 
} from '../utils/scrollTriggerConfig';

gsap.registerPlugin(ScrollTrigger, Draggable);

const AboutSection = () => {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const draggableRef = useRef(null);
  const rafIdRef = useRef(null);
  const [activeRailIndex, setActiveRailIndex] = useState(0);
  const [isDraggingRail, setIsDraggingRail] = useState(false);
  const snapTimeoutRef = useRef(null);
  const autoAdvanceRef = useRef(true);
  const scrollAnimationRef = useRef(null);
  const isScrollingRef = useRef(false);
  const lastActiveIndexRef = useRef(0);
  const isUpdatingActiveIndexRef = useRef(false);

  // Use images instead of videos for the draggable rail
  const aboutRailImages = [
    "/features_dragimages/1.png",
    "/features_dragimages/4.2.png",
    "/features_dragimages/Image 4.3.png",
    "/features_dragimages/Version 2.5.png",
    "/features_dragimages/Version 4.1.png"
  ];
  
  const aboutRail = [
    {
      id: 1,
      title: "Real-time Execution Engine",
      stat: "< 50ms sync",
      description: "Every action syncs instantly across teams, boards, and workflows. No refresh. No delay.",
      tag: "Core Engine",
      accent: "violet",
      image: aboutRailImages[0],
    },
    {
      id: 2,
      title: "Unified Startup Workspace",
      stat: "1 platform",
      description: "Tasks, collaboration, planning, and communication live in one continuous system.",
      tag: "Workspace",
      accent: "blue",
      image: aboutRailImages[1],
    },
    {
      id: 3,
      title: "Founder-First Operations",
      stat: "0 context switching",
      description: "Designed for founders who execute fast without juggling disconnected tools.",
      tag: "Operations",
      accent: "emerald",
      image: aboutRailImages[2],
    },
    {
      id: 5,
      title: "AI-Assisted Momentum",
      stat: "Smart workflows",
      description: "AI helps summarize, prioritize, and unblock execution without noise.",
      tag: "AI Layer",
      accent: "pink",
      image: aboutRailImages[3],
    },
    {
      id: 6,
      title: "Scale Without Limits",
      stat: "Infinite growth",
      description: "Built to scale from MVP to unicorn with infrastructure that grows with your ambition.",
      tag: "Scale",
      accent: "amber",
      image: aboutRailImages[4],
    },
  ];

  // Updated feature sections with SF Collab MVP features
  const featureSections = [
    {
      id: 1,
      title: "From Idea to Execution",
      description: "Transform raw ideas into structured business plans, project roadmaps, and investor-ready pitch decks in minutes, not months.",
      stats: ["Business Plan Generator", "AI Pitch Decks", "Smart Roadmaps", "MVP Planning"],
      icon: <Zap className="w-6 h-6" />,
      position: "left",
      color: "gradient",
      img:<img loading="lazy" src="/f1.jpg" alt="" srcSet=""  className=" absolute object-fill h-full" />
    },
    {
      id: 2,
      title: "AI-Powered Business Intelligence",
      description: "Advanced AI tools for market research, competitor analysis, financial modeling, and strategic decision-making.",
      stats: ["Market Analysis AI", "Financial Modeling", "Competitor Intelligence", "Risk Assessment"],
      icon: <Brain className="w-6 h-6" />,
      position: "right",
      color: "silver",
      img:<img loading="lazy" src="/f2.jpg" alt="" srcSet=""  className=" absolute object-fill h-full" />
    },
    {
      id: 3,
      title: "Virtual Economy & Gamification",
      description: "Earn XP, unlock achievements, and exchange SF Coins for premium features. A complete gamified ecosystem for professionals.",
      stats: ["XP System", "SF Coins Economy", "Achievement System", "Reward Marketplace"],
      icon: <TrendingUp className="w-6 h-6" />,
      position: "left",
      color: "platinum",
      img:<img loading="lazy" src="/f3.jpg" alt="" srcSet=""  className=" absolute object-fill h-full" />
    },
    {
      id: 4,
      title: "Complete Startup Infrastructure",
      description: "Everything a startup needs: team collaboration, legal document automation, investor CRM, and performance analytics.",
      stats: ["Team Management", "Legal Automation", "Investor CRM", "KPI Dashboards"],
      icon: <Building2 className="w-6 h-6" />,
      position: "right",
      color: "carbon",
      img:<img loading="lazy" src="/f4.jpg" alt="" srcSet=""  className=" absolute object-fill h-full" />
    },
    {
      id: 5,
      title: "Professional Creative Suite",
      description: "Generate logos, edit images, remove backgrounds, create pitch visuals, and design professional documents.",
      stats: ["Logo Generator", "Image Editor", "Background Remover", "PDF Signing"],
      icon: <Palette className="w-6 h-6" />,
      position: "left",
      color: "graphite",
      img:<img loading="lazy" src="/f5.jpg" alt="" srcSet=""  className=" absolute object-fill h-full" />
    },
    {
      id: 6,
      title: "Smart Collaboration Network",
      description: "Connect with founders, investors, and professionals. Smart matching based on skills, interests, and goals.",
      stats: ["Talent Discovery", "Investor Matching", "Team Formation", "Expert Network"],
      icon: <Users className="w-6 h-6" />,
      position: "right",
      color: "titanium",
      img:<img loading="lazy" src="/f6.jpg" alt="" srcSet=""  className=" absolute object-fill h-full" />
    }
  ];

  // Helper function for gradients
  const getAccentGradient = (color) => {
    const gradients = {
      gradient: "from-white via-gray-200 to-gray-300",
      silver: "from-slate-300 via-gray-200 to-gray-100",
      platinum: "from-gray-200 via-gray-300 to-gray-400",
      carbon: "from-gray-700 via-gray-600 to-gray-500",
      graphite: "from-gray-800 via-gray-700 to-gray-600",
      titanium: "from-gray-900 via-gray-800 to-gray-700"
    };
    return gradients[color] || "from-white to-gray-200";
  };

  // Helper function for text gradients
  const getTextGradient = (color) => {
    const gradients = {
      gradient: "bg-gradient-to-r from-white via-gray-100 to-gray-200",
      silver: "bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100",
      platinum: "bg-gradient-to-r from-gray-400 via-gray-300 to-gray-200",
      carbon: "bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400",
      graphite: "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500",
      titanium: "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600"
    };
    return gradients[color] || "bg-gradient-to-r from-white to-gray-200";
  };

  // Helper function for borders
  const getAccentBorder = (color) => {
    const borders = {
      gradient: "border-white/30",
      silver: "border-gray-300/30",
      platinum: "border-gray-400/30",
      carbon: "border-gray-600/30",
      graphite: "border-gray-700/30",
      titanium: "border-gray-800/30"
    };
    return borders[color] || "border-white/20";
  };

  // Real-time update of active index during drag
  const updateActiveIndex = useCallback((scrollPosition) => {
    if (isUpdatingActiveIndexRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = 300 + 24; // card width + gap
    const scrollLeft = Math.abs(scrollPosition);
    
    // Calculate which card is centered
    const centerPosition = scrollLeft + (container.clientWidth / 2);
    let index = Math.floor(centerPosition / cardWidth);
    
    // Clamp the index
    index = Math.max(0, Math.min(index, aboutRail.length - 1));
    
    // Only update if index changed
    if (index !== lastActiveIndexRef.current) {
      lastActiveIndexRef.current = index;
      setActiveRailIndex(index);
    }
  }, [aboutRail.length]);

  // Optimized snap function
  const snapToCard = useCallback((index) => {
    const container = containerRef.current;
    if (!container || isDraggingRail || index < 0 || index >= aboutRail.length) return;

    // Clear any ongoing animation
    if (scrollAnimationRef.current) {
      scrollAnimationRef.current.kill();
    }

    const cardWidth = 300 + 24; 
    const targetPosition = index * cardWidth;
    
    // Disable auto-advance temporarily
    autoAdvanceRef.current = false;
    isScrollingRef.current = true;
    isUpdatingActiveIndexRef.current = true;
    
    // Kill any existing timeout
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }
    
    // Update active index immediately
    lastActiveIndexRef.current = index;
    setActiveRailIndex(index);
    
    // Use GSAP for smooth scrolling
    scrollAnimationRef.current = gsap.to(container, {
      scrollLeft: targetPosition,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        isScrollingRef.current = false;
        isUpdatingActiveIndexRef.current = false;
        
        // Re-enable auto-advance after a delay
        snapTimeoutRef.current = setTimeout(() => {
          autoAdvanceRef.current = true;
        }, 4000);
      }
    });
  }, [isDraggingRail, aboutRail.length]);

  // Handle click on progress indicator
  const handleProgressClick = useCallback((index) => {
    snapToCard(index);
  }, [snapToCard]);

  // Auto-advance with proper cleanup
  useEffect(() => {
    if (!autoAdvanceRef.current || isDraggingRail || isScrollingRef.current) return;

    const autoAdvance = () => {
      if (!autoAdvanceRef.current || isDraggingRail || isScrollingRef.current) return;
      
      const nextIndex = (activeRailIndex + 1) % aboutRail.length;
      snapToCard(nextIndex);
    };

    // Clear any existing timeout
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }

    // Set auto-advance timeout
    snapTimeoutRef.current = setTimeout(autoAdvance, 5000);

    return () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [activeRailIndex, isDraggingRail, snapToCard, aboutRail.length]);

  useLayoutEffect(() => {
    const mobile = isMobile();
    
    // GSAP animations for all elements
    const ctx = gsap.context(() => {
      // Feature sections animations
      featureSections.forEach((section, index) => {
        const selector = `.feature-section-${section.id}`;
        
        gsap.from(selector, {
          opacity: 0,
          y: mobile ? 30 : 60,
          duration: getResponsiveDuration(1.2),
          ease: "power3.out",
          scrollTrigger: getResponsiveScrollTrigger({
            trigger: selector,
            start: mobile ? "top 90%" : "top 80%",
            end: mobile ? "top 60%" : "top 50%",
            markers: false
          })
        });
      });

      // Rail cards animation
      gsap.from(".rail-card", {
        opacity: 0,
        y: mobile ? 20 : 40,
        stagger: getResponsiveStagger(0.08),
        duration: getResponsiveDuration(0.6),
        ease: "power2.out",
        scrollTrigger: getResponsiveScrollTrigger({
          trigger: containerRef.current,
          start: mobile ? "top 85%" : "top 75%",
          end: mobile ? "bottom 30%" : "bottom 20%",
          markers: false
        })
      });

      // Progress indicator animation
      gsap.from(".progress-item", {
        opacity: 0,
        x: mobile ? -10 : -20,
        stagger: getResponsiveStagger(0.15),
        duration: getResponsiveDuration(0.8),
        ease: "power2.out",
        scrollTrigger: getResponsiveScrollTrigger({
          trigger: ".progress-container",
          start: mobile ? "top 90%" : "top 85%",
          end: mobile ? "top 70%" : "top 60%",
          markers: false
        })
      });

      // Stats animation
      gsap.from(".stat-item", {
        opacity: 0,
        y: mobile ? 15 : 30,
        stagger: getResponsiveStagger(0.1),
        duration: getResponsiveDuration(0.8),
        ease: "power2.out",
        scrollTrigger: getResponsiveScrollTrigger({
          trigger: ".stats-container",
          start: mobile ? "top 90%" : "top 85%",
          end: mobile ? "top 70%" : "top 60%",
          markers: false
        })
      });

    }, sectionRef);

   
    const cleanup = setupScrollTriggerRefresh();

    return () => {
      ctx.revert();
      cleanup();
      
      // Clean up all refs
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
      }
    };
  }, []);

  // Main draggable rail setup - FIXED VERSION
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isUserScrolling = false;
    let scrollEndTimeout;

    const handleScroll = () => {
      if (!isUserScrolling) {
        setIsDraggingRail(true);
        isUserScrolling = true;
        autoAdvanceRef.current = false;
      }

      // Update active index in real-time
      updateActiveIndex(container.scrollLeft);

      // Clear previous timeout
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);

      scrollEndTimeout = setTimeout(() => {
        isUserScrolling = false;
        setIsDraggingRail(false);
        
        // Snap to nearest card after scrolling stops
        const cardWidth = 300 + 24;
        const currentScroll = container.scrollLeft;
        const nearestIndex = Math.round(currentScroll / cardWidth);
        const clampedIndex = Math.max(0, Math.min(nearestIndex, aboutRail.length - 1));
        snapToCard(clampedIndex);
        
        // Re-enable auto-advance after a delay
        setTimeout(() => {
          autoAdvanceRef.current = true;
        }, 3000);
      }, 150);
    };

    // Add scroll listener with passive true for better performance
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize scroll position to first card
    setTimeout(() => {
      if (container && container.scrollLeft === 0) {
        snapToCard(0);
      }
    }, 100);

    // Initialize GSAP Draggable for desktop only
    const setupDraggable = () => {
      if (window.innerWidth >= 768 && !isMobile()) {
        if (draggableRef.current) {
          draggableRef.current.kill();
        }

        // Calculate bounds
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        draggableRef.current = Draggable.create(container, {
          type: "x",
          bounds: {
            minX: -maxScroll,
            maxX: 0
          },
          edgeResistance: 0.85,
          inertia: true,
          zIndexBoost: false,
          lockAxis: true,
          allowNativeTouchScrolling: false,
          dragResistance: 0.1,
          onPress: function() {
            setIsDraggingRail(true);
            autoAdvanceRef.current = false;
            isScrollingRef.current = true;
            isUpdatingActiveIndexRef.current = false; // Allow updates during drag
            
            // Kill any existing animations
            if (scrollAnimationRef.current) {
              scrollAnimationRef.current.kill();
            }
            
            gsap.to(container, { 
              scale: 0.98, 
              duration: 0.2,
              ease: "power2.out" 
            });
          },
          onRelease: function() {
            gsap.to(container, { 
              scale: 1, 
              duration: 0.3,
              ease: "back.out(1.7)" 
            });
            
            setTimeout(() => {
              const cardWidth = 300 + 24;
              const currentX = Math.abs(draggableRef.current[0].x);
              const nearestIndex = Math.round(currentX / cardWidth);
              const clampedIndex = Math.max(0, Math.min(nearestIndex, aboutRail.length - 1));
              snapToCard(clampedIndex);
              setIsDraggingRail(false);
              isScrollingRef.current = false;
            }, 100);
          },
          onDrag: function() {
            if (draggableRef.current) {
              const x = Math.abs(draggableRef.current[0].x);
              container.scrollLeft = x;
              
              // Update active index in real-time during drag
              const cardWidth = 300 + 24;
              const centerPosition = x + (container.clientWidth / 2);
              let index = Math.floor(centerPosition / cardWidth);
              index = Math.max(0, Math.min(index, aboutRail.length - 1));
              
              if (index !== lastActiveIndexRef.current) {
                lastActiveIndexRef.current = index;
                setActiveRailIndex(index);
              }
            }
          },
          onClick: function() {
            // Prevent click when dragging
            if (draggableRef.current[0].isDragging) {
              return false;
            }
          }
        })[0];

        // Prevent vertical page scroll when dragging the rail
        const preventVerticalScroll = (e) => {
          if (draggableRef.current && draggableRef.current.isDragging) {
            e.preventDefault();
          }
        };

        container.addEventListener('wheel', preventVerticalScroll, { passive: false });

        return () => {
          if (draggableRef.current) {
            draggableRef.current.kill();
          }
          container.removeEventListener('wheel', preventVerticalScroll);
        };
      }
    };

    setupDraggable();

    // Handle resize
    const handleResize = () => {
      if (draggableRef.current) {
        draggableRef.current.kill();
        draggableRef.current = null;
      }
      setTimeout(setupDraggable, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (draggableRef.current) {
        draggableRef.current.kill();
      }
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
      }
    };
  }, [updateActiveIndex, snapToCard, aboutRail.length]);

  const getAccentColor = (color) => {
    const colors = {
      violet: "from-violet-500/20 to-violet-600/20",
      blue: "from-blue-500/20 to-blue-600/20",
      emerald: "from-emerald-500/20 to-emerald-600/20",
      cyan: "from-cyan-500/20 to-cyan-600/20",
      pink: "from-pink-500/20 to-pink-600/20",
      amber: "from-amber-500/20 to-amber-600/20",
    };
    return colors[color] || colors.violet;
  };

  // Progress indicators with proper labels
  const progressLabels = [
    { label: "EXECUTION", index: 0 },
    { label: "WORKSPACE", index: 1 },
    { label: "OPERATIONS", index: 2 },
    { label: "AI", index: 3 },
    { label: "SCALE", index: 4 }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-screen text-white overflow-hidden"
      style={{ marginTop: '0', paddingTop: '0' }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        {/* Hero section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm tracking-widest text-white/60 uppercase">
              For Builders Who Ship
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight mb-6">
            The Startup
            <br />
            <span className="bg-gradient-to-br from-gray-800 to-gray-900 bg-clip-text text-transparent">
              Operating System
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-white/80 leading-relaxed mb-8">
            Where ideas meet execution. One platform for everything your startup needs to build, collaborate, and scale.
          </p>
        </motion.div>

        {/* Feature sections  */}
        <div className="space-y-24 md:space-y-40 mb-32">
          {featureSections.map((section) => (
            <div
              key={section.id}
              className={`feature-section-${section.id} flex flex-col lg:flex-row items-center gap-8 md:gap-16 lg:gap-32 ${
                section.position === 'right' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text content */}
              <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 px-4 md:px-0">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-4"
                >
                  <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${getAccentGradient(section.color)} shadow-lg border ${getAccentBorder(section.color)}`}>
                    {React.cloneElement(section.icon, { className: "w-5 h-5 md:w-7 md:h-7 text-gray-900" })}
                  </div>
                  <span className="text-xs md:text-sm font-semibold tracking-widest text-gray-400 uppercase">
                    Feature {section.id.toString().padStart(2, '0')}
                  </span>
                </motion.div>
        
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight"
                >
                  <span className={`bg-clip-text text-transparent ${getTextGradient(section.color)}`}>
                    {section.title}
                  </span>
                </motion.h2>
        
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-base md:text-xl text-gray-400 leading-relaxed"
                >
                  {section.description}
                </motion.p>
        
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-4 md:pt-6"
                >
                  {section.stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      className="group relative p-3 md:p-4 rounded-xl backdrop-blur-sm border border-gray-800/50 bg-gradient-to-b from-gray-900/30 to-gray-900/10 hover:border-gray-700/50 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-300" />
                          <span className="text-sm font-medium text-gray-300">{stat}</span>
                        </div>
                       
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
        
              {/* Visual placeholder */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="w-full lg:w-1/2 relative px-4 md:px-0"
              >
                <div className="relative">
                  {/* Background gradient effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl opacity-70" />
                  
                  {/* Main card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, rotateY: 2 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-2xl overflow-hidden border border-gray-800/50 bg-gradient-to-br from-gray-900 to-black p-1 backdrop-blur-sm"
                  >
                    {section.img}
                  
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                    
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                      {/* Grid pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px),
                                           linear-gradient(to bottom, #fff 1px, transparent 1px)`,
                          backgroundSize: '40px 40px',
                        }} />
                      </div>
                      
                      {/* Animated dots */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-white/20"
                            style={{
                              left: `${10 + (i * 7)}%`,
                              top: `${20 + (i * 5)}%`,
                            }}
                            animate={{
                              y: [0, -10, 0],
                              opacity: [0.2, 0.8, 0.2],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.1,
                              repeat: Infinity,
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                          className="text-center mb-8"
                        >
                          <div className="text-6xl font-bold mb-4 px-3 bg-black/70 backdrop-blur-sm rounded-tl-2xl rounded-br-2xl">
                            {section.stats[0].split(' ')[0]}
                          </div>
                          <div className="text-gray-400 px-3 bg-black/70 backdrop-blur-sm rounded-tl-2xl rounded-br-2xl text-sm uppercase tracking-widest">
                            {section.title.split(' ').slice(0, 2).join(' ')}
                          </div>
                        </motion.div>
                        {/* Feature indicators */}
                        <div className="flex flex-wrap gap-3 justify-center">
                          {section.stats.slice(1).map((stat, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.9 + idx * 0.1 }}
                              className="px-3 py-1.5 rounded-full border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm"
                            >
                              <span className="text-xs text-gray-400">{stat}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-gray-700/50 rounded-tl-xl" />
                      <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-gray-700/50 rounded-tr-xl" />
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-gray-700/50 rounded-bl-xl" />
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-gray-700/50 rounded-br-xl" />
                    </div>
                  </motion.div>
                  
                  {/* Floating elements */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-2xl"
                  >
                    <div className="absolute inset-2 border border-gray-700/30 rounded-lg flex items-center justify-center">
                      <div className="text-2xl font-bold text-gray-500">SF</div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    animate={{
                      y: [0, 10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-2xl"
                  >
                    <div className="absolute inset-2 border border-gray-700/30 rounded-lg flex items-center justify-center">
                      <div className="text-xl font-bold text-gray-600">{section.id}</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Horizontal media rail - Fixed header synchronization */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl lg:text-3xl font-medium">How It Works</h3>
              <p className="text-white/60 mt-2">The execution flow of every successful startup</p>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              <span className="text-sm text-white/40">Drag to explore →</span>
            </div>
          </div>

          {/* Progress Indicator - Now syncs properly with drag */}
          <div className="progress-container mb-12">
            <div className="mt-10 flex justify-center text-xs text-white/40 tracking-widest space-x-8">
              {progressLabels.map((item) => (
                <motion.div
                  key={item.index}
                  className="progress-item relative cursor-pointer select-none px-3 py-2"
                  animate={{ 
                    color: item.index === activeRailIndex ? "#ffffff" : "rgba(255,255,255,0.4)",
                    scale: item.index === activeRailIndex ? 1.1 : 1
                  }}
                  transition={{ 
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                  onClick={() => handleProgressClick(item.index)}
                >
                  {item.label}
                  {item.index === activeRailIndex && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-500 to-white"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Active card title */}
            <motion.div 
              key={activeRailIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mt-6"
            >
              <h4 className="text-xl font-medium mb-2">
                {aboutRail[activeRailIndex]?.title || "Loading..."}
              </h4>
              <p className="text-white/60 text-sm">
                {aboutRail[activeRailIndex]?.description || ""}
              </p>
            </motion.div>
          </div>

          {/* Draggable rail */}
          <div 
            ref={containerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide overflow-y-hidden cursor-grab active:cursor-grabbing no-scrollbar pb-6 select-none"
            style={{
              scrollBehavior: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain',
              touchAction: 'pan-x pinch-zoom',
              willChange: 'transform',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0,0,0)'
            }}
          >
            {aboutRail.map((item, index) => (
              <motion.div
                key={item.id}
                className="rail-card flex-shrink-0 w-[300px] lg:w-[380px] h-[360px] lg:h-[440px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0f0f0f] to-black group hover:border-white/20 transition-all duration-300 relative"
                whileHover={{ y: -8 }}
                animate={{ 
                  opacity: index === activeRailIndex ? 1 : 0.7,
                  scale: index === activeRailIndex ? 1.02 : 1
                }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                style={{
                  willChange: 'transform, opacity'
                }}
              >
                <div className="relative h-full">
                  {/* Image background */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    style={{
                      imageRendering: 'auto',
                      willChange: 'transform'
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm bg-black/30">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" />
                        <span className="text-xs font-medium">{item.tag}</span>
                      </div>
                      <span className="text-sm text-white/40">{index + 1}/{aboutRail.length}</span>
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                    <div className="text-2xl font-bold mb-3">
                      {item.stat}
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Edge accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${getAccentColor(item.accent)}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats section */}
          <div className="stats-container mt-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="stat-item p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span className="font-mono text-2xl lg:text-3xl font-bold">0.05s</span>
                </div>
                <p className="text-sm text-white/50">Sync latency</p>
              </div>
              
              <div className="stat-item p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span className="font-mono text-2xl lg:text-3xl font-bold">24/7</span>
                </div>
                <p className="text-sm text-white/50">Live collaboration</p>
              </div>
              
              <div className="stat-item p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span className="font-mono text-2xl lg:text-3xl font-bold">∞</span>
                </div>
                <p className="text-sm text-white/50">Canvas scale</p>
              </div>
              
              <div className="stat-item p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span className="font-mono text-2xl lg:text-3xl font-bold">100%</span>
                </div>
                <p className="text-sm text-white/50">Uptime SLA</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto pt-16"
        >
          <h2 className="text-3xl lg:text-4xl font-semibold mb-6">
            Ready to Build Your Startup's Foundation?
          </h2>
          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            Join thousands of founders who use SFCollab to execute faster, collaborate better, and scale smarter.
          </p>
          
          <motion.button 
            onClick={() => window.location.href = '/waitlist'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-gray-600 to-white-600 hover:from-white-500 hover:to-gray-500 transition-all duration-300 font-medium text-lg overflow-hidden"
          >
            <span>JOIN THE WAIT LIST</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </motion.button>
          
          <p className="mt-6 text-sm text-white/40">
            No credit card required • Full platform access • Cancel anytime
          </p>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        /* Custom scrollbar for the rail */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Optimize animations */
        .rail-card {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Prevent tap highlights on mobile */
        @media (max-width: 768px) {
          .rail-card {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;