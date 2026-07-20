import React, { useRef, useEffect, useState } from 'react'
import ParallaxImage from '../ParallaxImage'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { AboutAssets } from '../utils'

gsap.registerPlugin(Draggable)

const About = () => {
  const containerRef = useRef(null)
  const slidesRef = useRef([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const autoSlideRef = useRef(null)
  const draggableRef = useRef(null)

  // Initialize GSAP Draggable and auto-slide
  useEffect(() => {
    if (!containerRef.current || slidesRef.current.length === 0) return

    const container = containerRef.current
    const slides = slidesRef.current
    const slideWidth = slides[0]?.offsetWidth || 0
    const gap = 12
    const totalWidth = (slideWidth + gap) * slides.length

    // Set container width
    gsap.set(container, { width: totalWidth })

    // Initialize Draggable
    draggableRef.current = Draggable.create(container, {
      type: 'x',
      bounds: {
        minX: -(totalWidth - window.innerWidth * 0.85),
        maxX: 0
      },
      inertia: true,
      onDrag: function() {
        const progress = -this.x / totalWidth
        const newSlide = Math.round(progress * slides.length)
        setCurrentSlide(Math.max(0, Math.min(newSlide, slides.length - 1)))
        resetAutoSlide()
      },
      onThrowUpdate: function() {
        const progress = -this.x / totalWidth
        const newSlide = Math.round(progress * slides.length)
        setCurrentSlide(Math.max(0, Math.min(newSlide, slides.length - 1)))
      }
    })[0]

    // Auto-slide functions
    const goToSlide = (slideIndex) => {
      if (!draggableRef.current) return
      
      const targetX = -(slideIndex * (slideWidth + gap))
      gsap.to(container, {
        x: targetX,
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          draggableRef.current.update()
        },
        onComplete: () => {
          setCurrentSlide(slideIndex)
        }
      })
    }

    const startAutoSlide = () => {
      autoSlideRef.current = setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length
        goToSlide(nextSlide)
      }, 4000)
    }

    const resetAutoSlide = () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
      startAutoSlide()
    }

    const pauseAutoSlide = () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
    }

    const resumeAutoSlide = () => {
      if (!autoSlideRef.current) {
        startAutoSlide()
      }
    }

    // Start auto-slide
    startAutoSlide()

    // Event listeners
    container.addEventListener('mouseenter', pauseAutoSlide)
    container.addEventListener('mouseleave', resumeAutoSlide)
    container.addEventListener('touchstart', pauseAutoSlide)
    container.addEventListener('touchend', resumeAutoSlide)

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
      if (draggableRef.current) {
        draggableRef.current.kill()
      }
      container.removeEventListener('mouseenter', pauseAutoSlide)
      container.removeEventListener('mouseleave', resumeAutoSlide)
      container.removeEventListener('touchstart', pauseAutoSlide)
      container.removeEventListener('touchend', resumeAutoSlide)
    }
  }, [currentSlide])

  const addToSlidesRef = (el, index) => {
    if (el && !slidesRef.current.includes(el)) {
      slidesRef.current[index] = el
    }
  }

  const goToSlide = (slideIndex) => {
    if (!containerRef.current || !draggableRef.current) return
    
    const slides = slidesRef.current
    const slideWidth = slides[0]?.offsetWidth || 0
    const gap = 12
    const targetX = -(slideIndex * (slideWidth + gap))
    
    gsap.to(containerRef.current, {
      x: targetX,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        setCurrentSlide(slideIndex)
        draggableRef.current.update()
      }
    })
  }

  const contentData = [
    {
      title: 'Execution, Not Just Ideation',
      text: 'SFCollab is a startup operating system. Ship work faster with tasks, docs, chat, and operations in one continuous environment.',
      image: `${AboutAssets.aboutimgOne}`,
    },
    {
      title: 'Replace the Tool Stack',
      text: 'One platform replaces planning tools, task boards, docs, and communication. Fewer tabs. Zero context switching.',
      image: `${AboutAssets.aboutimgTwo}`,
    },
    {
      title: 'AI-Assisted Workflows',
      text: 'AI summarizes threads, prioritizes tasks, and unblocks work. Guidance when it matters, never noise.',
      image: `${AboutAssets.aboutimgThree}`,
    },
    {
      title: 'Founder-First Operations',
      text: 'Live presence across teams, real-time updates, and aligned execution. Built for how startups actually work.',
      image: `${AboutAssets.aboutimgFour}`,
    },
  ]

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden p-3">
      {/* CONTENT SECTION */}
      <div className='w-full lg:w-[90%] mx-auto'>
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {contentData.map((item, index) => (
            <div key={index} className="h-screen w-full flex items-center justify-center">
              <div className={`w-full h-full flex items-center gap-10 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}>
                <div className="w-[500px] h-full rounded-2xl overflow-hidden">
                  <ParallaxImage
                    src={item.image}
                    alt={item.title}
                    className="rounded-xl w-full h-full object-cover"
                  />
                </div>
                <div
                  className={`w-[500px] flex flex-col space-y-5 ${
                    index % 2 === 0
                      ? 'text-left items-start'
                      : 'text-right items-end'
                  }`}
                >
                  <h1 className="font-medium text-3xl w-full bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text text-transparent">
                    {item.title}
                  </h1>
                  <p className="font-medium">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Layout - GSAP Draggable with Auto-slide */}
        <div className="lg:hidden flex flex-col items-center w-full h-screen overflow-hidden">
          {/* Slides Container */}
          <div className="relative w-full h-3/4 overflow-hidden">
            <div
              ref={containerRef}
              className="flex absolute top-0 left-0 h-full gap-3 cursor-grab active:cursor-grabbing"
              style={{ 
                willChange: 'transform',
                userSelect: 'none'
              }}
            >
              {contentData.map((item, index) => (
                <div
                  key={index}
                  ref={el => addToSlidesRef(el, index)}
                  className="flex-shrink-0 w-[85vw] h-full"
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden relative">
                    <ParallaxImage
                      src={item.image}
                      alt={item.title}
                      className="rounded-xl w-full h-full object-cover"
                    />
                    {/* Text Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 rounded-b-2xl">
                      <div className="flex flex-col space-y-3 text-white">
                        <h1 className="font-medium text-xl bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">
                          {item.title}
                        </h1>
                        <p className="font-medium text-sm text-white">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {contentData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-violet-500 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
