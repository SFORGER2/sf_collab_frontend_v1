
import React, { useRef, useEffect } from 'react'

const lerp = (start, end, factor) => start + (end - start) * factor

const ParallaxImage = ({ src, alt, className = '' }) => {
  const imageRef = useRef(null)
  const bounds = useRef(null)
  const currentTranslateY = useRef(0)
  const targetTranslateY = useRef(0)
  const rafId = useRef(null)

  useEffect(() => {
    const updateBounds = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect()
        const scrollY = window.scrollY || window.pageYOffset
        bounds.current = {
          top: rect.top + scrollY,
          height: rect.height,
        }
      }
    }

    updateBounds()
    window.addEventListener('resize', updateBounds)

    const animate = () => {
      if (imageRef.current) {
        currentTranslateY.current = lerp(
          currentTranslateY.current,
          targetTranslateY.current,
          0.1
        )

        imageRef.current.style.transform = `translateY(${currentTranslateY.current}px) scale(1.25)`
      }

      rafId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', updateBounds)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!bounds.current) return
      const scrollY = window.scrollY || window.pageYOffset
      const relativeScroll = scrollY - bounds.current.top
      targetTranslateY.current = relativeScroll * 0.2
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      className={`w-full h-full rounded-lg object-cover ${className}`}
      style={{
        willChange: 'transform',
        transform: 'translateY(0) scale(1.25)',
      }}
    />
  )
}

export default ParallaxImage