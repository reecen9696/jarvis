"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface SpectrumAnalyzerProps {
  audioAnalyser: AnalyserNode | null
  audioSensitivity: number
  setAudioSensitivity: (value: number) => void
  currentFileName: string
  setCurrentFileName: (name: string) => void
  showNotification: (message: string) => void
}

export function SpectrumAnalyzer({
  audioAnalyser,
  audioSensitivity,
  setAudioSensitivity,
  currentFileName,
  setCurrentFileName,
  showNotification,
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

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

    // Draw spectrum analyzer
    const drawSpectrum = () => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      ctx.clearRect(0, 0, width, height)

      if (audioAnalyser) {
        const frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount)
        audioAnalyser.getByteFrequencyData(frequencyData)

        const barWidth = width / 256
        let x = 0

        for (let i = 0; i < 256; i++) {
          const barHeight = (frequencyData[i] / 255) * height * (audioSensitivity / 5)
          const hue = (i / 256) * 20 + 0 // Red-orange hue range

          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)

          x += barWidth
        }
      } else {
        // Draw placeholder bars when no audio
        const barWidth = width / 64
        let x = 0

        for (let i = 0; i < 64; i++) {
          const barHeight = Math.random() * height * 0.3
          const hue = (i / 64) * 20 + 0

          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)

          x += barWidth
        }
      }

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 78, 66, 0.2)"
      ctx.lineWidth = 1

      // Horizontal grid lines
      for (let i = 0; i < 5; i++) {
        const y = height * (i / 4)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Vertical grid lines
      for (let i = 0; i < 9; i++) {
        const x = width * (i / 8)
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Draw frequency labels
      ctx.fillStyle = "rgba(255, 78, 66, 0.7)"
      ctx.font = '10px Consolas, Monaco, "Courier New", monospace'
      ctx.textAlign = "center"

      const freqLabels = ["0", "1K", "2K", "4K", "8K", "16K"]
      for (let i = 0; i < freqLabels.length; i++) {
        const x = (width / (freqLabels.length - 1)) * i
        ctx.fillText(freqLabels[i], x, height - 5)
      }

      requestAnimationFrame(drawSpectrum)
    }

    drawSpectrum()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [audioAnalyser, audioSensitivity])

  const handleFileButtonClick = () => {
    if (audioFileInputRef.current) {
      audioFileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setCurrentFileName(file.name)
      showNotification("AUDIO FILE LOADED")

      // In a real implementation, we would process the audio file here
      // For this demo, we'll just update the UI
    }
  }

  const handleDemoTrackClick = (url: string) => {
    const filename = url.split("/").pop() || "Unknown Track"
    setCurrentFileName(filename)
    showNotification(`PLAYING: ${filename}`)

    // In a real implementation, we would load and play the audio here
    // For this demo, we'll just update the UI

    // Reset active state on all buttons
    const buttons = document.querySelectorAll(".demo-track-btn")
    buttons.forEach((btn) => btn.classList.remove("active"))

    // Set active state on clicked button
    const clickedButton = document.querySelector(`[data-url="${url}"]`)
    if (clickedButton) clickedButton.classList.add("active")
  }

  return (
    <div className="spectrum-analyzer">
      <div className="spectrum-header">
        <span>AUDIO SPECTRUM ANALYZER</span>
        <span className="drag-handle" id="spectrum-handle">
          ⋮⋮
        </span>
      </div>
      <div className="spectrum-content">
        <canvas ref={canvasRef} className="spectrum-canvas"></canvas>
      </div>
      <div className="audio-controls">
        <div className="demo-tracks">
          <span className="demo-tracks-label">DEMO TRACKS:</span>
          <button
            className="demo-track-btn"
            data-url="https://assets.codepen.io/7558/Merkaba.mp3"
            onClick={() => handleDemoTrackClick("https://assets.codepen.io/7558/Merkaba.mp3")}
          >
            MERKABA
          </button>
          <button
            className="demo-track-btn"
            data-url="https://assets.codepen.io/7558/Dhamika.mp3"
            onClick={() => handleDemoTrackClick("https://assets.codepen.io/7558/Dhamika.mp3")}
          >
            DHAMIKA
          </button>
          <button
            className="demo-track-btn"
            data-url="https://assets.codepen.io/7558/Vacant.mp3"
            onClick={() => handleDemoTrackClick("https://assets.codepen.io/7558/Vacant.mp3")}
          >
            VACANT
          </button>
        </div>

        <input
          type="file"
          id="audio-file-input"
          ref={audioFileInputRef}
          className="audio-file-input"
          accept="audio/*"
          onChange={handleFileChange}
        />
        <button className="audio-file-btn" id="file-btn" onClick={handleFileButtonClick}>
          UPLOAD AUDIO FILE
        </button>
        <div className="audio-file-label" id="file-label">
          {currentFileName}
        </div>

        <audio id="audio-player" className="audio-player" crossOrigin="anonymous"></audio>

        <div className="controls-row">
          <div className="audio-sensitivity" style={{ flex: 1 }}>
            <div className="audio-sensitivity-label">
              <span>SENSITIVITY</span>
              <span className="audio-sensitivity-value">{audioSensitivity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={audioSensitivity}
              step="0.1"
              className="slider"
              onChange={(e) => setAudioSensitivity(Number.parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
