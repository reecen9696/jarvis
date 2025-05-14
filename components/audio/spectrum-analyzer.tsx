"use client"
import { useEffect, useRef } from "react"

// In the SpectrumAnalyzer component props, change audioSensitivity to volume
interface SpectrumAnalyzerProps {
  audioAnalyser: AnalyserNode | null
  volume: number
  setVolume: (value: number) => void
  currentFileName: string
  setCurrentFileName: (name: string) => void
  showNotification: (message: string) => void
  isMuted: boolean
  toggleMute: () => void
}

export function SpectrumAnalyzer({
  audioAnalyser,
  volume,
  setVolume,
  currentFileName,
  setCurrentFileName,
  showNotification,
  isMuted,
  toggleMute,
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
          // Use volume for visualization height as well
          const barHeight = (frequencyData[i] / 255) * height * (volume / 5)
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
  }, [audioAnalyser, volume])

  // Update audio volume when the volume slider changes
  useEffect(() => {
    const audioElement = document.getElementById("audio-player") as HTMLAudioElement
    if (audioElement) {
      audioElement.volume = volume / 10 // Convert 0-10 range to 0-1 range
    }
  }, [volume])

  // Display a notification when component mounts to indicate default audio is playing
  useEffect(() => {
    // Add terminal message
    const terminalContent = document.getElementById("terminal-content")
    if (terminalContent) {
      const newLine = document.createElement("div")
      newLine.className = "terminal-line"
      newLine.textContent = "AUDIO SOURCE DETECTED: JARVIS INTERFACE AUDIO (MUTED)"
      terminalContent.appendChild(newLine)
      terminalContent.scrollTop = terminalContent.scrollHeight
    }

    showNotification("AUDIO MUTED BY DEFAULT - CLICK UNMUTE TO ENABLE")
  }, [showNotification])

  const handleMuteToggle = () => {
    toggleMute()
    showNotification(isMuted ? "AUDIO UNMUTED" : "AUDIO MUTED")

    // Add terminal message
    const terminalContent = document.getElementById("terminal-content")
    if (terminalContent) {
      const newLine = document.createElement("div")
      newLine.className = "terminal-line"
      newLine.textContent = isMuted ? "AUDIO.UNMUTE() - PLAYBACK ENABLED" : "AUDIO.MUTE() - PLAYBACK DISABLED"
      terminalContent.appendChild(newLine)
      terminalContent.scrollTop = terminalContent.scrollHeight
    }
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
        {/* Hidden audio player */}
        <audio id="audio-player" className="audio-player" crossOrigin="anonymous" loop></audio>

        <div className="controls-row">
          <div className="audio-sensitivity" style={{ flex: 1 }}>
            <div className="audio-sensitivity-label">
              <span>VOLUME</span>
              <span className="audio-sensitivity-value">{volume.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={volume}
              step="0.1"
              className="slider"
              onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Mute/Unmute button */}
        <div className="buttons">
          <button className="btn" onClick={handleMuteToggle}>
            {isMuted ? "UNMUTE" : "MUTE"}
          </button>
        </div>
      </div>
    </div>
  )
}
