"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function HomeAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Hero headline lines — run on load
      gsap.fromTo(
        "[data-gsap='hero-line']",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.15,
        }
      )

      // Hero badge + CTA
      gsap.fromTo(
        "[data-gsap='hero-badge']",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.05 }
      )
      gsap.fromTo(
        "[data-gsap='hero-cta']",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.55 }
      )

      // Section headings — scroll reveal slide from left
      gsap.utils.toArray<HTMLElement>("[data-gsap='heading']").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        )
      })

      // Card groups — stagger from bottom
      gsap.utils.toArray<HTMLElement>("[data-gsap='cards']").forEach((group) => {
        const cards = group.querySelectorAll<HTMLElement>("[data-gsap='card']")
        if (!cards.length) return
        gsap.fromTo(
          cards,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: group,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        )
      })

      // Generic fade-up elements
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-up']").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        )
      })

      // MVP card — slide in from right
      gsap.utils.toArray<HTMLElement>("[data-gsap='slide-right']").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        )
      })
    })

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return null
}
