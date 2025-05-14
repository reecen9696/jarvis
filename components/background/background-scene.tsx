"use client"

import { useRef, useEffect } from "react"

export function BackgroundScene() {
  const floatingParticlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (floatingParticlesRef.current) {
      initFloatingParticles(floatingParticlesRef.current)
    }
  }, [])

  // Initialize floating particles
  const initFloatingParticles = (container: HTMLDivElement) => {
    // Clear any existing particles
    container.innerHTML = ""

    // Reduce particle count from 1000 to 500
    const numParticles = 500
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const centerX = windowWidth / 2
    const centerY = windowHeight / 2

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.position = "absolute"

      // Make all particles the same small size
      particle.style.width = "1.5px"
      particle.style.height = "1.5px"
      particle.style.backgroundColor = `rgba(255, ${
        Math.floor(Math.random() * 100) + 78
      }, ${Math.floor(Math.random() * 100) + 66}, ${Math.random() * 0.5 + 0.2})`
      particle.style.borderRadius = "50%"

      // Create a large hollow area in the center
      const minDistance = 200 // Minimum distance from center
      const maxDistance = Math.max(windowWidth, windowHeight) * 0.8

      // Use polar coordinates for even distribution
      const angle = Math.random() * Math.PI * 2

      // Use square root distribution for more even radial distribution
      const distanceFactor = Math.sqrt(Math.random())
      const distance = minDistance + distanceFactor * (maxDistance - minDistance)

      // Calculate position
      const x = Math.cos(angle) * distance + centerX
      const y = Math.sin(angle) * distance + centerY

      particle.style.left = x + "px"
      particle.style.top = y + "px"

      container.appendChild(particle)
    }

    // Animate particles
    animateFloatingParticles(container)
  }

  // Animate floating particles
  const animateFloatingParticles = (container: HTMLDivElement) => {
    const particles = container.querySelectorAll(".particle")
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    let time = 0

    const updateParticles = () => {
      time += 0.005

      particles.forEach((particle, index) => {
        const particleElement = particle as HTMLElement

        // Generate unique but deterministic values for this particle
        const speed = (index % 10) / 10 + 0.1
        const angle = ((index % 360) * Math.PI) / 180
        const amplitude = (index % 50) + 20
        const pulseSpeed = (index % 4) / 100 + 0.01
        const pulsePhase = ((index % 360) * Math.PI) / 180

        // Update angle
        const currentAngle = angle + time * speed * 0.1

        // Calculate orbit around center with some drift
        const orbitX = centerX + Math.cos(currentAngle) * amplitude
        const orbitY = centerY + Math.sin(currentAngle) * amplitude

        // Add some noise movement
        const noiseX = Math.sin(time * speed + angle) * 5
        const noiseY = Math.cos(time * speed + angle * 0.7) * 5

        // Apply movement
        const newX = orbitX + noiseX
        const newY = orbitY + noiseY

        // Update position
        particleElement.style.left = newX + "px"
        particleElement.style.top = newY + "px"

        // Pulse size slightly
        const pulseFactor = 1 + Math.sin(time * pulseSpeed + pulsePhase) * 0.3
        const newSize = 1.5 * pulseFactor

        particleElement.style.width = newSize + "px"
        particleElement.style.height = newSize + "px"

        // Adjust opacity based on pulse
        const baseOpacity = 0.2 + Math.sin(time * pulseSpeed + pulsePhase) * 0.1
        particleElement.style.opacity = Math.min(0.8, baseOpacity).toString()
      })

      requestAnimationFrame(updateParticles)
    }

    requestAnimationFrame(updateParticles)
  }

  return (
    <>
      <div className="space-background"></div>
      <div className="grid-overlay"></div>
      <div className="floating-particles" ref={floatingParticlesRef}></div>
      <div className="audio-wave"></div>
    </>
  )
}
