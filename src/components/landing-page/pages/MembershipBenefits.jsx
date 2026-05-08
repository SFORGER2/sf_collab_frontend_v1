import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NavBar from '../Navbar';
import Footer from '../Footer';
gsap.registerPlugin(ScrollTrigger);

export default function MembershipBenefits() {
  const main = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.benefit-card');
      
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'bottom 45%',
            },
          }
        );
      });

      gsap.fromTo(
        '.benefits-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        }
      );
    }, main);

    return () => ctx.revert();
  }, []);

  const benefits = [
    {
      title: 'Democratized Access to High Level Technology',
      subtitle: 'Without Barriers',
      description: 'At SFcollab, financial limitations should never stop innovation. That\'s why SFcollab and our suite of tools are free for early-stage founders who need them most. We invest in your potential, so you can focus on building, not budgeting.',
      quote: 'Innovation shouldn\'t depend on privilege. It should depend on drive.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    },
    {
      title: 'Instant Matchmaking',
      description: 'SFcollab intelligently connects you with the right projects, founders, or contributors based on your skills, goals, and potential fit. It\'s not just networking, it\'s meaningful collaboration built for real progress.',
      quote: 'Right people. Right purpose. Real impact.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    },
    {
      title: 'Mentors & Investors-Ready Ecosystem',
      description: 'SFcollab bridges the gap between vision and validation. Founders gain access to seasoned mentors, verified investors, and a framework built to accelerate readiness for real opportunities. Our ecosystem is supported by secure digital infrastructure ensuring trust and efficiency in every connection.',
      quote: 'Grow with guidance. Fund with confidence.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    },
    {
      title: 'AI-Driven Acceleration',
      description: 'SFcollab integrates AI technology to simplify, optimize, and elevate the way you work. From daily operations to long-term planning, our intelligent systems adapt to your needs, helping your startup move faster, stay focused, and scale with confidence.',
      quote: 'Less friction. More focus. Smarter growth.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    },
  ];

  return (
    <>
      <NavBar />
      <div ref={main} className="bg-[#0b0b0b] text-white min-h-screen py-20 px-6 lg:px-20">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="benefits-header text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Your membership benefits
            </h1>
          </div>

          {/* Benefits Grid */}
          <div className="space-y-16">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className={`benefit-card flex flex-col lg:flex-row items-center gap-12 py-12 lg:py-16 border-t border-gray-800 ${
                  idx === 0 ? 'border-t-0' : ''
                }`}
              >
                <div className={`flex-1 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img
                    src={benefit.image}
                    alt={benefit.title}
                    className="rounded-2xl shadow-2xl w-full object-cover h-80"
                  />
                </div>
                <div className={`flex-1 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h2 className="text-3xl lg:text-4xl font-semibold text-white">
                    {benefit.title}
                    {benefit.subtitle && (
                      <span className="block text-2xl lg:text-3xl text-gray-300 mt-1">
                        {benefit.subtitle}
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {benefit.description}
                  </p>
                  <blockquote className="text-xl font-semibold text-indigo-400 italic border-l-4 border-indigo-400 pl-6 py-4">
                    "{benefit.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
