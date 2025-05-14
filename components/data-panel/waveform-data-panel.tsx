"use client"

import { useEffect, useRef, useState } from "react"

interface WaveformDataPanelProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  title: string
  audioAnalyser: AnalyserNode | null
}

export function WaveformDataPanel({ position, title, audioAnalyser }: WaveformDataPanelProps) {
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const [peakValue, setPeakValue] = useState("127.3 HZ")
  const [amplitudeValue, setAmplitudeValue] = useState(0.56)
  const [phaseValue, setPhaseValue] = useState("π/4")

  useEffect(() => {
    if (waveformCanvasRef.current) {
      const canvas = waveformCanvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions
      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio
        canvas.height = canvas.offsetHeight * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      // Draw waveform
      const drawWaveform = () => {
        const width = canvas.width / window.devicePixelRatio
        const height = canvas.height / window.devicePixelRatio

        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
        ctx.fillRect(0, 0, width, height)

        if (audioAnalyser) {
          const audioData = new Uint8Array(audioAnalyser.frequencyBinCount)
          audioAnalyser.getByteTimeDomainData(audioData)

          ctx.beginPath()
          ctx.strokeStyle = "rgba(255, 78, 66, 0.8)"
          ctx.lineWidth = 2

          const sliceWidth = width / audioData.length
          let x = 0

          for (let i = 0; i < audioData.length; i++) {
            const v = audioData[i] / 128.0
            const y = (v * height) / 2

            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }

            x += sliceWidth
          }

          ctx.stroke()
        } else {
          // Draw placeholder waveform when no audio
          ctx.beginPath()
          ctx.strokeStyle = "rgba(255, 78, 66, 0.8)"
          ctx.lineWidth = 1

          const time = Date.now() / 1000
          const sliceWidth = width / 100
          let x = 0

          for (let i = 0; i < 100; i++) {
            const t = i / 100
            const y =
              height / 2 +
              Math.sin(t * 10 + time) * 5 +
              Math.sin(t * 20 + time * 1.5) * 3 +
              Math.sin(t * 30 + time * 0.5) * 7 +
              (Math.random() - 0.5) * 2

            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }

            x += sliceWidth
          }

          ctx.stroke()
        }

        requestAnimationFrame(drawWaveform)
      }

      drawWaveform()

      // Update waveform metrics
      const updateWaveformMetrics = () => {
        if (audioAnalyser) {
          const frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount)
          audioAnalyser.getByteFrequencyData(frequencyData)

          // Find peak frequency
          let maxValue = 0
          let maxIndex = 0
          for (let i = 0; i < frequencyData.length; i++) {
            if (frequencyData[i] > maxValue) {
              maxValue = frequencyData[i]
              maxIndex = i
            }
          }

          const sampleRate = audioAnalyser.context.sampleRate
          const peakFrequency = (maxIndex * sampleRate) / (audioAnalyser.frequencyBinCount * 2)
          setPeakValue(`${Math.round(peakFrequency)} HZ`)

          // Calculate amplitude
          let sum = 0
          for (let i = 0; i < frequencyData.length; i++) {
            sum += frequencyData[i]
          }
          const amplitude = sum / (frequencyData.length * 255)
          setAmplitudeValue(Number.parseFloat(amplitude.toFixed(2)))

          // Occasionally update phase
          if (Math.random() < 0.05) {
            const phases = ["π/4", "π/2", "π/6", "3π/4"]
            setPhaseValue(phases[Math.floor(Math.random() * phases.length)])
          }
        } else if (Math.random() < 0.05) {
          // Random fluctuations when no audio
          setPeakValue(`${Math.floor(Math.random() * 200 + 100)} HZ`)
          setAmplitudeValue(Number.parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)))

          const phases = ["π/4", "π/2", "π/6", "3π/4"]
          setPhaseValue(phases[Math.floor(Math.random() * phases.length)])
        }
      }

      const metricsInterval = setInterval(updateWaveformMetrics, 100)

      return () => {
        window.removeEventListener("resize", resizeCanvas)
        clearInterval(metricsInterval)
      }
    }
  }, [audioAnalyser])

  return (
    <div
      className="data-panel"
      style={{
        position: "absolute",
        top: "20px",
        left: position.includes("right") ? "auto" : "20px",
        right: position.includes("right") ? "20px" : "auto",
      }}
    >
      <div className="data-panel-title">{title}</div>
      <div className="waveform">
        <canvas ref={waveformCanvasRef} className="waveform-canvas"></canvas>
      </div>
      <div className="data-readouts">
        <div className="data-row">
          <span className="data-label">PEAK FREQUENCY:</span>
          <span className="data-value" id="peak-value">
            {peakValue}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">AMPLITUDE:</span>
          <span className="data-value" id="amplitude-value">
            {amplitudeValue}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">PHASE SHIFT:</span>
          <span className="data-value" id="phase-value">
            {phaseValue}
          </span>
        </div>
      </div>
    </div>
  )
}
