import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export default function Explore() {
  const sectionRef = useRef(null);
  const mainCardRef = useRef(null);
  const leftCardsRef = useRef(null);
  const rightCardsRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const mainCard = mainCardRef.current;
    const leftCards = leftCardsRef.current;
    const rightCards = rightCardsRef.current;

    if (!section || !mainCard) return;

    gsap.set([leftCards, rightCards], { opacity: 0, y: 40 });
    gsap.set(mainCard, { scale: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * 0.8),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        markers: false,
      },
    });
    tl.to(mainCard, {
      scale: 0.82,
      width: "520px",
      maxWidth: "520px",
      height: "320px",
      ease: "power3.inOut",
    });

    tl.to(
      leftCards,
      {
        opacity: 1,
        y: 0,
        x: -15,
        ease: "power3.out",
      },
      "<"
    ).to(
      rightCards,
      {
        opacity: 1,
        y: 0,
        x: 15,
        ease: "power3.out",
      },
      "<"
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="relative bg-black text-white overflow-hidden">
      <section
        ref={sectionRef}
        className="relative flex items-center justify-center w-full h-screen overflow-hidden z-[30]"
      >
        <div
          ref={leftCardsRef}
          className="absolute hidden lg:flex left-[8%] top-1/2 -translate-y-1/2 gap-5 pointer-events-none"
        >
          {[
            "https://images.unsplash.com/photo-1755997234962-931d86bee287?w=600&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1755838692094-49a97b9fb9ab?w=600&auto=format&fit=crop&q=60",
          ].map((src, i) => (
            <div
              key={i}
              className="w-[220px] h-[150px] overflow-hidden rounded-xl shadow-lg border border-white/6 bg-[#111]"
            >
              <img
                src={src}
                alt={`left ${i}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        {/* Central Main Card */}
        <div
          ref={mainCardRef}
          className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/10 bg-[#111] flex items-center justify-center text-white z-[40]"
          style={{ width: "90%", height: "78vh", maxWidth: "900px" }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight px-6">
            Replace Your Stack With One Operating System
          </h1>
        </div>

        {/* Right Cards */}
        <div
          ref={rightCardsRef}
          className="absolute hidden lg:flex right-[8%] top-1/2 -translate-y-1/2 gap-5 pointer-events-none"
>
          {[
            "https://plus.unsplash.com/premium_photo-1756137116378-ac4e7baeabdf?w=600&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1755895757151-82cb82b9a635?w=600&auto=format&fit=crop&q=60",
          ].map((src, i) => (
            <div
              key={i}
              className="w-[220px] h-[150px] overflow-hidden rounded-xl shadow-lg border border-white/6 bg-[#111]"
            >
              <img
                src={src}
                alt={`right ${i}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </section>
      <section className="relative z-[10] bg-black text-center px-6 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl lg:text-4xl font-semibold leading-snug">
            Built for serious teams. Calm, fast, and continuous.
          </h2>
          <p className="text-gray-400 text-base lg:text-lg leading-relaxed">
            Sf Collab unifies execution, real-time collaboration, operations, and AI-assisted workflows. It’s infrastructure for building, not a chat app.
          </p>
          <Link
            to="https://sfcollab.com/login"
            className="inline-block mt-4 text-lg font-medium border-b border-white hover:text-white/80 transition-all"
          >
            See The Platform →
          </Link>
        </div>
      </section>

    </div>
  );
};