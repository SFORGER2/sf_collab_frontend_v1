// Images
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaLinkedin, FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { 
  getResponsiveScrollTrigger, 
  getResponsiveDuration,
  setupScrollTriggerRefresh,
  isMobile 
} from '../../utils/scrollTriggerConfig';
import OskarImg from "@/assets/imgs/Oskar K (Founder & CEO).jpg";
import FatimaImg from "@/assets/imgs/Fatima Abba (Backend Developer).png";
import ChinmayImg from "@/assets/imgs/Chinmay Bharadwaj (Developer).jpg";
import KrystianImg from "@/assets/imgs/Krystian Śledziewski (cybersecurity)_.jpg";
import RazeenImg from "@/assets/imgs/RazzinJpeg.jpeg";
import ShreyImg from "@/assets/imgs/Shrey Dikshant (AI_ML Engineer).jpg";
import VarunImg from "@/assets/imgs/Varun.png (Frontend Developer & AI researcher).jpg"; // ✅ renamed file
import IvanImg from "@/assets/imgs/Ivan Gomez (Cloud & Software Developer).jpg";

gsap.registerPlugin(ScrollTrigger);

// Team Data
const teamMembers = [
  {
    name: "Oskar K",
    role: "Founder & CEO",
    img: OskarImg,
    desc: "Driving the company's vision and strategy with a passion for innovation.",
  },
  {
    name: "Chinmay Bharadwaj",
    role: "Full Stack Developer",
    img: ChinmayImg,
    desc: "Building performant and scalable web applications.",
  },
    {
    name: "Fatima Abba",
    role: "Backend Developer",
    img: FatimaImg,
    desc: "Architecting robust and scalable backend solutions.",
  },
  {
    name: "Krystian Śledziewski",
    role: "Cybersecurity Specialist",
    img: KrystianImg,
    desc: "Ensuring system security, privacy, and resilience.",
  },
    {
    name: "Ivan Gomez",
    role: "Cloud & Software Developer",
    img: IvanImg,
    desc: "Building scalable cloud solutions and robust software applications.",
  },
  {
    name: "Razeen Iqbal",
    role: "Product Manager",
    img: RazeenImg,
    desc: "Aligning product vision with user and business needs.",
  },
  {
    name: "Shrey Dikshant",
    role: "AI / ML Engineer",
    img: ShreyImg,
    desc: "Designing intelligent systems powered by machine learning.",
  },
  {
    name: "Varun",
    role: "Frontend Developer & AI Researcher",
    img: VarunImg,
    desc: "Crafting intuitive interfaces and researching AI-driven solutions.",
  }
];

export default function TeamComponent() {
  const main = useRef(null);

    




  return (
      <section
      ref={main}
      className="relative bg-gradient-to-b from-[#0b0b0b] via-[#0e0e0e] to-black text-white py-24 px-6 lg:px-20 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-white bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            The people behind{" "}
            <span className="text-white font-medium">SFCollab</span> building the
            future of digital innovation.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {teamMembers.map((person, i) => (
            <div
              key={i}
              className="group relative bg-gradient-to-b from-[#141414] to-[#0f0f0f]
                         rounded-2xl p-7 flex flex-col items-center text-center
                         border border-white/5 hover:border-purple-500/40
                         transition-all duration-300 hover:-translate-y-2
                         hover:shadow-[0_20px_60px_rgba(139,92,246,0.25)]"
            >
              {/* Avatar */}
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src={person.img}
                  alt={person.name}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover
                             border-2 border-purple-400/30 group-hover:border-purple-400
                             transition-all duration-300 filter grayscale"
                />
              </div>

              {/* Info */}
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
                {person.name}
              </h3>

              <p className="text-purple-400 font-medium text-sm mb-2">
                {person.role}
              </p>

              <p className="text-gray-400 text-sm leading-relaxed">
                {person.desc}
              </p>

              {person.socials && (
                <div className="flex gap-4 mt-5">
                  {person.socials.linkedin && (
                    <a
                      href={person.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-purple-400 transition-colors"
                    >
                      <FaLinkedin size={18} />
                    </a>
                  )}
                  {person.socials.twitter && (
                    <a
                      href={person.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-purple-400 transition-colors"
                    >
                      <FaTwitter size={18} />
                    </a>
                  )}
                  {person.socials.facebook && (
                    <a
                      href={person.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-purple-400 transition-colors"
                    >
                      <FaFacebook size={18} />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
};