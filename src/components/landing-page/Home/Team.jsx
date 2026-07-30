import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaLinkedin, FaTwitter, FaFacebook } from "react-icons/fa";
import { 
  getResponsiveScrollTrigger, 
  getResponsiveDuration,
  setupScrollTriggerRefresh,
  isMobile 
} from '../utils/scrollTriggerConfig';
import Navbar from "../Navbar";
import Footer from "../Footer";
// Images
import OskarImg from "../../../assets/imgs/Oskar K (Founder & CEO).jpg";
import FatimaImg from "../../../assets/imgs/Fatima Abba (Backend Developer).png";
import ChinmayImg from "../../../assets/imgs/Chinmay Bharadwaj (Developer).jpg";
import KrystianImg from "../../../assets/imgs/Krystian Śledziewski (cybersecurity)_.jpg";
import RazeenImg from "../../../assets/imgs/Razeen Iqbal ( product Manager).jpg";
import ShreyImg from "../../../assets/imgs/Shrey Dikshant (AI_ML Engineer).jpg";
import VarunImg from "../../../assets/imgs/Varun.png (Frontend Developer & AI researcher).jpg"; // ✅ renamed file
import IvanImg from "../../../assets/imgs/Ivan Gomez (Cloud & Software Developer).jpg";
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
    name: "Fatima Abba",
    role: "Backend Developer",
    img: FatimaImg,
    desc: "Architecting robust and scalable backend solutions.",
  },
  {
    name: "Chinmay Bharadwaj",
    role: "Full Stack Developer",
    img: ChinmayImg,
    desc: "Building performant and scalable web applications.",
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
  },
];

const Team = () => {
  const main = useRef(null);

  useEffect(() => {
    const mobile = isMobile();
    
    const ctx = gsap.context((self) => {
      const cards = self.selector(".team-card");
      const grid = self.selector(".team-grid");
      const header = self.selector(".team-header");

      gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: "top top",
          end: () => "+=" + cards.length * 200,
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
        },
      });

      cards.forEach((card) => {
        tl.to(
          card,
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
          "-=0.5"
        );
      });
    }, main);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Navbar />
    <section
      ref={main}
      className="bg-[#0b0b0b] text-white py-20 px-6 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent">
            Meet Our Team
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            The people behind SFCollab building the future of digital innovation.
          </p>
        </div>

        {/* Team Grid */}
        <div className="team-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-screen items-center">
          {teamMembers.map((person, i) => (
            <div
              key={i}
              className="team-card bg-[#111] rounded-2xl p-6 flex flex-col items-center text-center border border-transparent hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-300"
            >
              <img
                src={person.img}
                alt={person.name}
                className="w-32 h-32 rounded-full object-cover mb-5 border-2 border-purple-400/30"
              />
              <h3 className="text-xl font-semibold">{person.name}</h3>
              <p className="text-purple-400 font-medium mb-2">
                {person.role}
              </p>
              <p className="text-gray-400 text-sm">{person.desc}</p>
              {person.socials &&
                <div className="flex gap-4 mt-4">
                  <a className="text-gray-500 hover:text-white" href={person.socials.linkedin}>
                    <FaLinkedin size={20} />
                  </a>
                  <a className="text-gray-500 hover:text-white" href={person.socials.twitter}>
                    <FaTwitter size={20} />
                  </a>
                  <a className="text-gray-500 hover:text-white" href={person.socials.facebook}>
                    <FaFacebook size={20} />
                  </a>
                </div>
              }
            </div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default Team;
