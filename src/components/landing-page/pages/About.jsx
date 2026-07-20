import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NavBar from "../Navbar";
import Footer from "../Footer";
import JoinSection from "../../../components/JoinSection";
import { 
  getResponsiveScrollTrigger, 
  getResponsiveDuration,
  setupScrollTriggerRefresh,
  isMobile 
} from '../utils/scrollTriggerConfig';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const main = useRef();

  useEffect(() => {
    const mobile = isMobile();
    
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".animated-section");

      sections.forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0, y: mobile ? 30 : 60 },
          {
            opacity: 1,
            y: 0,
            duration: getResponsiveDuration(1.2),
            ease: "power3.out",
            scrollTrigger: getResponsiveScrollTrigger({
              trigger: sec,
              start: mobile ? "top 90%" : "top 85%",
              end: mobile ? "bottom 60%" : "bottom 45%",
            }),
          }
        );
      });

      // Parallax background motion - desktop only
      if (!mobile) {
        gsap.to(".parallax-bg", {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: main.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Floating blob animations
      gsap.to(".blob", {
        y: "+=25",
        repeat: -1,
        yoyo: true,
        duration: 5,
        ease: "sine.inOut",
      });
    }, main);

    const cleanup = setupScrollTriggerRefresh();

    return () => {
      ctx.revert();
      cleanup();
    };
  }, []);

  return (
    <>
      <NavBar/>
      <div ref={main} className="bg-[#0b0b0b] text-white relative overflow-hidden">
        {/* Floating Blobs Background */}
        <div className="parallax-bg absolute inset-0 -z-10">
          <div className="blob absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-indigo-600/30 to-purple-700/30 rounded-full blur-3xl"></div>
          <div className="blob absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-r from-pink-600/20 to-blue-600/20 rounded-full blur-3xl"></div>
          <div className="blob absolute top-1/2 right-1/4 w-56 h-56 bg-gradient-to-r from-yellow-600/20 to-red-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <section className="animated-section flex flex-col justify-center items-center text-center py-32 px-6 lg:px-20 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Where Builders Create Real Products Together
          </h1>
          <p className="text-gray-300 max-w-2xl leading-relaxed text-lg">
            SFcollab is where builders, operators, and founders come together to create real products — with clarity, fairness, and shared upside.
          </p>
        </section>

        {/* The SF Way */}
        <section className="animated-section flex flex-col lg:flex-row items-center gap-12 py-20 px-6 lg:px-20 relative z-10">
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Collaboration"
              className="rounded-2xl shadow-2xl w-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              The SF Way
            </h2>
            <p className="text-gray-300 leading-relaxed">
              SFcollab changes how work comes together.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-1">→</span>
                <span>Instead of temporary gigs, you build <strong className="text-white">long-term collaborations</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-1">→</span>
                <span>Instead of scattered tools, everything lives in <strong className="text-white">one shared system</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-1">→</span>
                <span>Instead of working for someone, you work <strong className="text-white">with them</strong>.</span>
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              SFcollab is built for people who want to build, not just deliver.
            </p>
          </div>
        </section>

        {/* How It Works - 3 Steps */}
        <section className="animated-section py-24 px-6 lg:px-20 bg-[#111111]/60 backdrop-blur-md relative z-10">
          <h2 className="text-center text-3xl lg:text-4xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Simple, not technical. Three steps to building something real.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Start with People",
                desc: "Share an idea or join one. Meet founders, builders, designers, and thinkers — all in one place. No pitching. No pressure. Just collaboration.",
              },
              {
                step: "02",
                title: "Do the Work",
                desc: "Tasks are clear. Progress is visible. Effort is tracked. You always know what needs to be done, who's doing it, and how value is created.",
              },
              {
                step: "03",
                title: "Get Rewarded Fairly",
                desc: "Work turns into value. That value turns into pay, ownership, reputation, and opportunity. No empty promises. It's built into the system.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#1a1a1a] p-8 rounded-2xl hover:scale-105 transition-transform duration-500 shadow-xl border border-gray-800"
              >
                <span className="text-5xl font-bold text-indigo-500/30">{item.step}</span>
                <h3 className="text-2xl font-semibold mb-4 mt-2 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Features */}
        <section className="animated-section py-24 px-6 lg:px-20 relative z-10">
          <h2 className="text-center text-3xl lg:text-4xl font-semibold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            What You Get
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Benefits built for builders.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full mx-auto">
            {[
              {
                title: "Clarity",
                desc: "Always know what you're building and why.",
              },
              {
                title: "Fair Ownership",
                desc: "Your effort translates into real upside.",
              },
              {
                title: "Strong Teams",
                desc: "Work with people who are aligned, not random.",
              },
              {
                title: "Less Noise",
                desc: "Everything in one place, nothing scattered.",
              },
              {
                title: "Momentum",
                desc: "Build once, grow continuously.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#111111] p-6 rounded-2xl text-center hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-500 border border-gray-800"
              >
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold mb-2 text-indigo-300">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Tools */}
        <section className="animated-section py-24 px-6 lg:px-20 bg-[#111111]/60 backdrop-blur-md relative z-10">
          <h2 className="text-center text-3xl lg:text-4xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            AI-Powered Tools
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Let AI handle the busy work so you can focus on building.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Generate Logos",
                desc: "Create professional brand assets in seconds.",
              },
              {
                title: "Draft Pitch Decks",
                desc: "Build investor-ready presentations with AI assistance.",
              },
              {
                title: "Market Research",
                desc: "Run competitive analysis and market insights automatically.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#1a1a1a] p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-500 shadow-xl border border-gray-800"
              >
                <span className="text-5xl mb-4 block">{item.icon}</span>
                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust & Security */}
        <section className="animated-section py-24 px-6 lg:px-20 relative z-10">
          <h2 className="text-center text-3xl lg:text-4xl font-semibold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Trust & Security
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Built on simple principles: Transparency over hype. Long-term value over short-term wins. People over platforms.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Enterprise-Grade Encryption",
                desc: "Your data is protected with industry-leading security standards.",
              },
              {
                title: "Proof of Collaboration",
                desc: "Blockchain-backed verification of your contributions and ownership.",
              },
              {
                title: "You Own Your IP",
                desc: "Always. No exceptions. What you create belongs to you.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#111111] p-8 rounded-2xl text-center hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-500 border border-gray-800"
              >
                <span className="text-5xl mb-4 block">{item.icon}</span>
                <h3 className="text-xl font-semibold mb-2 text-indigo-300">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <JoinSection 
          text="Your first project is waiting to be born. Start for free. Build with AI. Win together."
          title="The world has enough talkers. It needs more builders."
          ref={null} 
        />
      </div>
      <Footer />
    </>
  );
};

export default About;
