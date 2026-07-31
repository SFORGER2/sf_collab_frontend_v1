// landingpage/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { heroAssest, mainsong } from './utils';
import MediaLinks from '../../utils/MediaLinks';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef(null);
  const linksRef = useRef([]);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const navbarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef(null);
  const barRefs = useRef([]);
  const barTimeline = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    audioRef.current = new Audio(mainsong.mainAudio);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    audioRef.current.preload = 'auto';

    barTimeline.current = gsap.timeline({ repeat: -1, paused: true })
      .to(barRefs.current[0], { scaleY: 2, duration: 0.4 })
      .to(barRefs.current[1], { scaleY: 1.8, duration: 0.3 }, '-=0.3')
      .to(barRefs.current[2], { scaleY: 2.2, duration: 0.5 }, '-=0.2')
      .to(barRefs.current, { scaleY: 1, duration: 0.4, stagger: 0.1 }, '+=0.2');

    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (barTimeline.current) barTimeline.current.kill();
    };
  }, []);

  const toggleMusic = () => {
    if (!userInteracted) setUserInteracted(true);
    isPlaying ? handleStopMusic() : handlePlayMusic();
  };

  const handlePlayMusic = async () => {
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      barTimeline.current.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const handleStopMusic = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    barTimeline.current.pause();
    gsap.to(barRefs.current, { scaleY: 1, duration: 0.3 });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowNavbar(!(currentScroll > lastScrollY.current && currentScroll > 100));
      lastScrollY.current = currentScroll;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!overlayRef.current) return;
    if (isOpen) {
      gsap.set(overlayRef.current, { display: 'flex', pointerEvents: 'auto' });
      gsap.fromTo(overlayRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5 });
      gsap.fromTo(linksRef.current, { x: -100, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, delay: 0.2 });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.4,
        onComplete: () => gsap.set(overlayRef.current, { display: 'none', pointerEvents: 'none' }),
      });
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const navlink = [
    { href: '/', name: 'Home' },
    { href: '/about', name: 'Platform' },
    { href: '/pricing', name: 'Pricing' },
    { href: '/explore_section', name: 'Explore' },
    { href: '/discover-startups', name: 'Startups' },
    { href: '/team', name: 'Team' },
    { href: '/contact', name: 'Contact' },
  ];

  return (
    <>
      {/* Overlay Menu */}
      <div ref={overlayRef} className="fixed inset-0 z-40 hidden bg-[#0f0f0f]/95 backdrop-blur-md text-white items-center justify-center">
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between p-6">
          <div className="flex flex-col gap-6 lg:w-1/2">
            {navlink.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                ref={(el) => (linksRef.current[index] = el)}
                className="lg:text-5xl text-2xl font-semibold hover:text-purple-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex gap-3 mt-6">
              <Link to="/signup" onClick={() => setIsOpen(false)} className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors">
                Get Started
              </Link>
              <Link to="/login" onClick={() => setIsOpen(false)} className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors">
                Login
              </Link>
            </div>
            <div className="mt-8">
              <MediaLinks />
            </div>
          </div>
          <div className="hidden lg:flex w-1/2 justify-end">
            <video muted autoPlay loop playsInline className="rounded-2xl shadow-xl max-w-[600px]">
              <source src={heroAssest.herovideoOne} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

      {/* Top Navbar */}
      <div ref={navbarRef} className={`fixed top-0 z-50 w-full h-16 lg:h-20 flex items-center justify-between px-6 transition-transform ${showNavbar ? 'translate-y-0' : '-translate-y-full'} bg-[#0f0f0f]/70 backdrop-blur-md`}>
        {/* Logo */}
        <Link to="/" className="flex items-center h-full">
          <img src="/logo_white.svg" alt="sf collab" className="h-10" />
        </Link>

        {/* Music Bars */}
        <button onClick={toggleMusic} className="flex items-center gap-1 h-8 hover:opacity-80 transition-opacity relative">
          <span ref={el => barRefs.current[0] = el} className="w-1 bg-white h-3 origin-bottom" />
          <span ref={el => barRefs.current[1] = el} className="w-1 bg-white h-4 origin-bottom" />
          <span ref={el => barRefs.current[2] = el} className="w-1 bg-white h-2 origin-bottom" />
          {!userInteracted && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>}
        </button>

        {/* Menu Toggle */}
        <button onClick={toggleMenu} className="rounded-full p-2 bg-[#2A2725] hover:bg-purple-600 transition-colors">
          {isOpen ? <X className="text-white size-5" /> : <Menu className="text-white size-5" />}
        </button>
      </div>
    </>
  );
};

export default Navbar;
