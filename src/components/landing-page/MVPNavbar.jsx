// landingpage/navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {  Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { heroAssest, mainsong } from './utils';
import MediaLinks from '../../utils/MediaLinks';

export default function MVPNavBar() {
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
      .to(barRefs.current[0], { scaleY: 2, duration: 0.4, ease: 'power2.inOut' })
      .to(barRefs.current[1], { scaleY: 1.8, duration: 0.3, ease: 'power2.inOut' }, '-=0.3')
      .to(barRefs.current[2], { scaleY: 2.2, duration: 0.5, ease: 'power2.inOut' }, '-=0.2')
      .to(barRefs.current, { scaleY: 1, duration: 0.4, stagger: 0.1, ease: 'power2.inOut' }, '+=0.2');

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

  useEffect(() => setUserInteracted(false), []);

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

      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.4,
        onComplete: () => {
          gsap.set(overlayRef.current, { display: 'none', pointerEvents: 'none' });
        },
      });
      document.body.classList.remove('menu-open');
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const navlink = [
    { href: '/', name: 'Home' },
    { href: '/about', name: 'Platform' },
    { href: '/membership-benefits', name: 'Membership benefits' },
    { href: '/implementation-plans', name: 'Implementation Plans' },
    { href: '/featured-projects', name: 'Featured Projects' },
    { href: '/team', name: 'Our Team' },
    { href: '/contact', name: 'Contact' },
  ];

  return (
    <>
      {/* Menu Overlay */}
      <div ref={overlayRef} className='fixed inset-0 z-40 hidden bg-[#0f0f0f] text-white items-center justify-center'>
        <div className='w-full h-full flex items-center lg:pt-5 pt-10 justify-between p-4'>

          {/* Left Menu */}
          <div className='lg:w-1/2 h-full w-full flex flex-col gap-10 lg:justify-between py-10'>
            <div className='flex flex-col gap-4 px-3 lg:px-8'>
              {navlink.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  ref={(el) => (linksRef.current[index] = el)}
                  className='lg:text-6xl md:text-5xl text-2xl font-medium Messina hover:text-zinc-400 transition-all'
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className='flex gap-2'>
                <Link to="/waitlist" onClick={() => setIsOpen(false)}
                  className='lg:mb-6 mb-3 text-lg font-semibold bg-white text-black px-6 py-3 rounded-full'>
                  Join Waitlist
                </Link>
                <Link to="/login" onClick={() => setIsOpen(false)}
                  className='lg:mb-6 mb-3 text-lg font-semibold bg-white text-black px-6 py-3 rounded-full'>
                  Login
                </Link>
              </div>
            </div>

            <div className='px-3 lg:px-8 flex items-center gap-12'>
              <div className='flex gap-2'>
                <MediaLinks />
              </div>
            </div>
          </div>

          {/* Right Video */}
          {/* Right Video */}
{/* Right Video */}
<div className="w-[65%] h-full hidden md:flex lg:flex items-center justify-end pr-10">
  <div className="relative w-full max-w-[800px] h-[450px] rounded-2xl overflow-hidden bg-black shadow-xl">
    <video
      src={heroAssest.herovideoOne}
      muted
      autoPlay
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-contain"
    />
  </div>
</div>



        </div>
      </div>
      <div 
        ref={navbarRef}
        className='fixed z-40 flex justify-between items-center w-full px-4 h-12 lg:h-20 transition-transform'
      >
        
        <div className="md:pt-0 pt-4 h-full flex items-center">
          <Link to="/" className='w-full h-full'>
            <img loading="lazy" src="/logo_white.svg" className="h-full md:left-0 left-1" alt="sf collab" />
            </Link>
          </div>

        <div className="flex-1 flex justify-center items-center">
          <button
            onClick={toggleMusic}
            className="flex items-center justify-center gap-1 h-8 hover:opacity-80 transition-opacity group"
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            <span 
              ref={el => barRefs.current[0] = el}
              className="w-1 bg-white h-3 origin-bottom transform transition-all group-hover:bg-zinc-900"
            />
            <span 
              ref={el => barRefs.current[1] = el}
              className="w-1 bg-white h-4 origin-bottom transform transition-all group-hover:bg-zinc-700"
            />
            <span 
              ref={el => barRefs.current[2] = el}
              className="w-1 bg-white h-2 origin-bottom transform transition-all group-hover:bg-zinc-700"
            />
            
            {!userInteracted && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"></div>
            )}
          </button>
        </div>

        <div className="flex-1 flex justify-end pt-4 md:pt-0">
          <button
            onClick={toggleMenu}
            className='flex gap-2 items-center justify-center rounded-full transition-all duration-300 hover:scale-105'
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <span className='bg-[#2A2725] p-2 rounded-full hover:bg-zinc-900 transition-colors'>
              {isOpen ? <X className='text-white size-5' /> : <Menu className='text-white size-5' />}
            </span>
          </button>
        </div>

      </div>
    </>
  );
};

