"use client"

import { useEffect, useRef } from "react"

interface CircularVisualizerProps {
  audioAnalyser: AnalyserNode | null
  audioSensitivity: number
  audioReactivity: number
}

export function CircularVisualizer({ audioAnalyser, audioSensitivity, audioReactivity }: CircularVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Draw circular visualizer
    const drawCircularVisualizer = () => {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      ctx.clearRect(0, 0, width, height)

      if (audioAnalyser) {
        const frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount)
        audioAnalyser.getByteFrequencyData(frequencyData)

        const numPoints = 180
        const baseRadius = Math.min(width, height) * 0.4

        // Draw background glow
        ctx.beginPath()
        ctx.arc(centerX, centerY, baseRadius * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 78, 66, 0.05)"
        ctx.fill()

        // Draw multiple rings
        const numRings = 3
        for (let ring = 0; ring < numRings; ring++) {
          const ringRadius = baseRadius * (0.7 + ring * 0.15)
          const opacity = 0.8 - ring * 0.2

          ctx.beginPath()

          for (let i = 0; i < numPoints; i++) {
            // Calculate frequency range for this ring
            const freqRangeStart = Math.floor((ring * audioAnalyser.frequencyBinCount) / (numRings * 1.5))
            const freqRangeEnd = Math.floor(((ring + 1) * audioAnalyser.frequencyBinCount) / (numRings * 1.5))
            const freqRange = freqRangeEnd - freqRangeStart

            // Calculate average value for this segment
            let sum = 0
            const segmentSize = Math.floor(freqRange / numPoints)
            for (let j = 0; j < segmentSize; j++) {
              const freqIndex = freqRangeStart + ((i * segmentSize + j) % freqRange)
              sum += frequencyData[freqIndex]
            }

            const value = sum / (segmentSize * 255)
            const adjustedValue = value * (audioSensitivity / 5) * audioReactivity
            const dynamicRadius = ringRadius * (1 + adjustedValue * 0.5)

            const angle = (i / numPoints) * Math.PI * 2
            const x = centerX + Math.cos(angle) * dynamicRadius
            const y = centerY + Math.sin(angle) * dynamicRadius

            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }

          ctx.closePath()

          // Create gradient based on ring
          let gradient
          if (ring === 0) {
            gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2)
            gradient.addColorStop(0, `rgba(255, 78, 66, ${opacity})`)
            gradient.addColorStop(1, `rgba(194, 54, 47, ${opacity * 0.7})`)
          } else if (ring === 1) {
            gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2)
            gradient.addColorStop(0, `rgba(194, 54, 47, ${opacity})`)
            gradient.addColorStop(1, `rgba(255, 179, 171, ${opacity * 0.7})`)
          } else {
            gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2)
            gradient.addColorStop(0, `rgba(255, 179, 171, ${opacity})`)
            gradient.addColorStop(1, `rgba(255, 78, 66, ${opacity * 0.7})`)
          }

          ctx.strokeStyle = gradient
          ctx.lineWidth = 2 + (numRings - ring)
          ctx.stroke()

          // Add glow effect
          ctx.shadowBlur = 15
          ctx.shadowColor = "rgba(255, 78, 66, 0.7)"
        }

        // Reset shadow
        ctx.shadowBlur = 0

        // Store audio level as a data attribute for other components to use
        let audioLevel = 0
        for (let i = 0; i < frequencyData.length; i++) {
          audioLevel += frequencyData[i]
        }
        audioLevel = audioLevel / (frequencyData.length * 255)
        canvas.parentElement?.setAttribute("data-audio-level", audioLevel.toString())
      } else {
        // Draw placeholder circular visualization when no audio
        const numPoints = 180
        const baseRadius = Math.min(width, height) * 0.4

        // Draw background glow
        ctx.beginPath()
        ctx.arc(centerX, centerY, baseRadius * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 78, 66, 0.05)"
        ctx.fill()

        // Draw static rings
        const numRings = 3
        const time = Date.now() / 1000

        for (let ring = 0; ring < numRings; ring++) {
          const ringRadius = baseRadius * (0.7 + ring * 0.15)
          const opacity = 0.8 - ring * 0.2

          ctx.beginPath()

          for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2
            const noise = Math.sin(angle * 8 + time + ring) * 0.1
            const dynamicRadius = ringRadius * (1 + noise)

            const x = centerX + Math.cos(angle) * dynamicRadius
            const y = centerY + Math.sin(angle) * dynamicRadius

            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }

          ctx.closePath()

          // Create gradient based on ring
          let gradient
          if (ring === 0) {
            gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2)
            gradient.addColorStop(0, `rgba(255, 78, 66, ${opacity})`)
            gradient.addColorStop(1, `rgba(194, 54, 47, ${opacity * 0.7})`)
          } else if (ring === 1) {
            gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2)
            gradient.addColorStop(0, `rgba(194, 54, 47, ${opacity})`)
            gradient.addColorStop(1, `rgba(255, 179, 171, ${opacity * 0.7})`)
          } else {
            gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2)
            gradient.addColorStop(0, `rgba(255, 179, 171, ${opacity})`)
            gradient.addColorStop(1, `rgba(255, 78, 66, ${opacity * 0.7})`)
          }

          ctx.strokeStyle = gradient
          ctx.lineWidth = 2 + (numRings - ring)
          ctx.stroke()
        }

        // Set a default audio level for animations when no audio is playing
        const defaultAudioLevel = (Math.sin(time) + 1) * 0.1
        canvas.parentElement?.setAttribute("data-audio-level", defaultAudioLevel.toString())
      }

      // Update font reference in the canvas text rendering
      ctx.font = '10px Consolas, Monaco, "Courier New", monospace'

      requestAnimationFrame(drawCircularVisualizer)
    }

    drawCircularVisualizer()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [audioAnalyser, audioSensitivity, audioReactivity])

  return (
    <div className="circular-visualizer">
      <canvas id="circular-canvas" ref={canvasRef}></canvas>
    </div>
  )
}
