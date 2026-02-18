import React, { Suspense, lazy, useEffect } from 'react'
import Hero from '../Home/Hero'
import NavBar from '../Navbar'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// Lazy BELOW THE FOLD
const AboutSection = lazy(() => import('../Home/AboutSection'))
const Explore = lazy(() => import('../Home/Explore'))
const Products = lazy(() => import('../Home/Products'))
const Roadmap = lazy(() => import('../Home/Roadmap'))
const StartUp = lazy(() => import('../Home/StartUp'))
const Contact = lazy(() => import('./Contact'))
const Footer = lazy(() => import('../Footer'))

import 'lenis/dist/lenis.css'

const Home = () => {
  const navigate = useNavigate()
  const { user, access_token } = useSelector((state) => state.auth)

  // 🔹 Redirect early (before heavy stuff runs)
  useEffect(() => {
    if (user && access_token) {
      navigate('/dashboard')
    }
  }, [user, access_token, navigate])

  // 🔹 Ultra-optimized Lenis loading
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4

    const shouldDisableLenis = isMobile || prefersReducedMotion || lowCPU || lowMemory
    if (shouldDisableLenis) return

    let lenis
    let rafId

    const loadLenis = () => {
      import('lenis').then(({ default: Lenis }) => {
        lenis = new Lenis()

        const raf = (time) => {
          lenis.raf(time)
          rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)
      })
    }

    // 👇 Espera a que el browser esté idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadLenis)
    } else {
      setTimeout(loadLenis, 1000)
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (lenis) lenis.destroy()
    }
  }, [])

  return (
    <div className="md:w-full w-screen">
      <NavBar />

      {/* HERO no lazy (LCP optimizado) */}
      <Hero />

      {/* Below the fold */}
      <section className="flex flex-col overflow-x-hidden">

        <Suspense fallback={null}>
          <AboutSection />
        </Suspense>

        <Suspense fallback={null}>
          <Explore />
        </Suspense>

        <Suspense fallback={null}>
          <Products />
        </Suspense>

        <Suspense fallback={null}>
          <Roadmap />
        </Suspense>

        <Suspense fallback={null}>
          <StartUp />
        </Suspense>

        <Suspense fallback={null}>
          <Contact />
        </Suspense>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>

      </section>
    </div>
  )
}

export default Home
