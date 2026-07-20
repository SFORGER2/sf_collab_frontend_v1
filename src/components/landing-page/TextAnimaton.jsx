import React, { useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(SplitText, ScrollTrigger)

const TextAnimation = ({ children, animateOnScroll = true, delay = 0 }) => {
  const containerRef = useRef(null)
  const elementRef = useRef([])
  const splitRef = useRef([])
  const lines = useRef([])

  useGSAP(() => {
    if (!containerRef.current) return

    splitRef.current = []
    elementRef.current = []
    lines.current = []

    let elements = []

    if (containerRef.current.hasAttribute('data-copy-wrapper')) {
      elements = Array.from(containerRef.current.children)
    } else {
      elements = [containerRef.current]
    }

    elements.forEach((element) => {
      elementRef.current.push(element)

      const split = SplitText.create(element, {
        type: 'lines',
        mask: 'lines',
        lineClass: 'line++'
      })

      splitRef.current.push(split)

      const computedStyle = window.getComputedStyle(element)
      const textIndent = computedStyle.textIndent

      if (textIndent && textIndent !== '0px') {
        if (split.lines.length > 0) {
          split.lines[0].style.paddingLeft = textIndent
        }
        element.style.textIndent = '0'
      }

      lines.current.push(...split.lines)
    })

    // Start lines hidden below
    gsap.set(lines.current, { y: '100%', opacity: 0 })

    const reveal = () =>
      gsap.to(lines.current, {
        y: '0%',
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power4.out',
        delay
      })

    const hide = () =>
      gsap.to(lines.current, {
        y: '100%',
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power4.in'
      })

    if (animateOnScroll) {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: reveal,
        onLeave: hide,
        onEnterBack: reveal,
        onLeaveBack: hide
      })
    } else {
      reveal()
    }

    return () => {
      splitRef.current.forEach((split) => split?.revert())
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, {
    scope: containerRef,
    dependencies: [animateOnScroll, delay]
  })

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef })
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  )
}

export default TextAnimation
