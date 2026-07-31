import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import Footer from '../Footer';
import Navbar from '../Navbar';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProjects() {
  const MOCK_PROJECTS = [
    {
      id: 1,
      title: 'ClimateFlow',
      pitch: 'Real-time carbon tracking for supply chains',
      stage: 'Beta',
      roles: ['Backend Dev', 'Data Scientist', 'DevOps'],
      metrics: '50k+ users',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'MindFlow',
      pitch: 'AI-powered mental wellness platform',
      stage: 'Prototype',
      roles: ['Frontend Dev', 'ML Engineer', 'Product Manager'],
      metrics: '$100k pilot',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'BuildChain',
      pitch: 'Decentralized project management for teams',
      stage: 'Idea',
      roles: ['Full Stack Dev', 'Smart Contract Dev'],
      metrics: '5k beta testers',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    },
  ];

  const StageBadge = ({ stage }) => {
    const colors = {
      'Idea': 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-sm',
      'Prototype': 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-sm',
      'Beta': 'bg-green-500/20 text-green-300 border-green-500/30 shadow-sm',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${colors[stage]}`}>
        {stage}
      </span>
    );
  };

  const ProjectCard = ({ project, onApply }) => {
    return (
      <div className="bg-[#111111]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
        <img loading="lazy" src={project.image} alt={project.title} className="w-full h-48 object-cover" />
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-white flex-1">{project.title}</h3>
            <StageBadge stage={project.stage} />
          </div>
          <p className="text-gray-300 text-sm mb-4">{project.pitch}</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Roles Needed</p>
            <div className="flex flex-wrap gap-2">
              {project.roles.map((role, i) => (
                <span key={i} className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 px-2 py-1 rounded-full text-xs border border-gray-600/40">
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-700 flex items-center justify-between">
            <span className="text-sm text-purple-400 font-medium">{project.metrics}</span>
            <button
              onClick={() => onApply(project.id)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-md"
            >
              Apply <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const carouselRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.projects-header', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.project-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  const scroll = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 400;
    const newPos = direction === 'left'
      ? carouselRef.current.scrollLeft - scrollAmount
      : carouselRef.current.scrollLeft + scrollAmount;
    carouselRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
  };

  const handleApply = (projectId) => {
    console.log('Apply clicked for project:', projectId);
  };

  return (
    <>
      <Navbar />
      <section ref={mainRef} className="bg-[#0b0b0b] text-white py-20 px-6 lg:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="projects-header text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Explore projects changing the game.
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
              From productivity platforms to climate tech, each SFcollab project is mission-driven and ready for impact. 
              Browse current opportunities, apply to join or nominate a project yourself.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-6 scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {projects.map((project) => (
                <div key={project.id} className="project-card flex-shrink-0 w-full sm:w-80">
                  <ProjectCard project={project} onApply={handleApply} />
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-3">
                <button
                  onClick={() => scroll('left')}
                  className="p-3 bg-gray-800 hover:bg-purple-600/40 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-3 bg-gray-800 hover:bg-purple-600/40 rounded-full transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              <a
                href="/projects"
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2 transition-colors"
              >
                View all projects <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />  
    </>
  );
}
