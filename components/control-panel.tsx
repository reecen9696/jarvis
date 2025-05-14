"use client"

import type React from "react"

interface ControlPanelProps {
  rotationSpeed: number
  setRotationSpeed: (value: number) => void
  resolution: number
  setResolution: (value: number) => void
  distortion: number
  setDistortion: (value: number) => void
  audioReactivity: number
  setAudioReactivity: (value: number) => void
  showNotification: (message: string) => void
}

export function ControlPanel({
  rotationSpeed,
  setRotationSpeed,
  resolution,
  setResolution,
  distortion,
  setDistortion,
  audioReactivity,
  setAudioReactivity,
  showNotification,
}: ControlPanelProps) {
  const handleReset = () => {
    setRotationSpeed(1.0)
    setResolution(32)
    setDistortion(1.0)
    setAudioReactivity(1.0)
    showNotification("SETTINGS RESET TO DEFAULT VALUES")
  }

  const handleAnalyze = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    button.textContent = "ANALYZING..."
    button.disabled = true

    // Simulate analysis
    const stabilityBar = document.getElementById("stability-bar")
    const stabilityValue = document.getElementById("stability-value")
    const statusIndicator = document.getElementById("status-indicator")

    if (stabilityBar) stabilityBar.style.width = "45%"
    if (stabilityValue) stabilityValue.textContent = "45%"
    if (statusIndicator) statusIndicator.style.color = "#ff00a0"

    setTimeout(() => {
      button.textContent = "ANALYZE"
      button.disabled = false
      showNotification("ANOMALY ANALYSIS COMPLETE")

      // Update random values
      const massValue = document.getElementById("mass-value")
      const energyValue = document.getElementById("energy-value")
      const varianceValue = document.getElementById("variance-value")
      const peakValue = document.getElementById("peak-value")
      const amplitudeValue = document.getElementById("amplitude-value")
      const phaseValue = document.getElementById("phase-value")

      if (massValue) massValue.textContent = (Math.random() * 2 + 1).toFixed(3)
      if (energyValue) energyValue.textContent = (Math.random() * 9 + 1).toFixed(1) + "e8 J"
      if (varianceValue) varianceValue.textContent = (Math.random() * 0.01).toFixed(4)
      if (peakValue) peakValue.textContent = (Math.random() * 200 + 100).toFixed(1) + " HZ"
      if (amplitudeValue) amplitudeValue.textContent = (Math.random() * 0.5 + 0.3).toFixed(2)

      const phases = ["π/4", "π/2", "π/6", "3π/4"]
      if (phaseValue) phaseValue.textContent = phases[Math.floor(Math.random() * phases.length)]
    }, 3000)
  }

  return (
    <div className="control-panel" style={{ top: "50%", left: "20px", transform: "translateY(-50%)" }}>
      <div className="panel-header">
        <span className="data-panel-title">ANOMALY CONTROLS</span>
        <span className="drag-handle" id="control-panel-handle">
          ⋮⋮
        </span>
      </div>

      <div className="control-group">
        <div className="control-row">
          <span className="control-label">ROTATION SPEED</span>
          <span className="control-value">{rotationSpeed.toFixed(1)}</span>
        </div>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="5"
            value={rotationSpeed}
            step="0.1"
            className="slider"
            onChange={(e) => setRotationSpeed(Number.parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="control-group">
        <div className="control-row">
          <span className="control-label">RESOLUTION</span>
          <span className="control-value">{resolution}</span>
        </div>
        <div className="slider-container">
          <input
            type="range"
            min="12"
            max="64"
            value={resolution}
            step="4"
            className="slider"
            onChange={(e) => setResolution(Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="control-group">
        <div className="control-row">
          <span className="control-label">DISTORTION</span>
          <span className="control-value">{distortion.toFixed(1)}</span>
        </div>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="3"
            value={distortion}
            step="0.1"
            className="slider"
            onChange={(e) => setDistortion(Number.parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="control-group">
        <div className="control-row">
          <span className="control-label">AUDIO REACTIVITY</span>
          <span className="control-value">{audioReactivity.toFixed(1)}</span>
        </div>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="2"
            value={audioReactivity}
            step="0.1"
            className="slider"
            onChange={(e) => setAudioReactivity(Number.parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="buttons">
        <button className="btn" onClick={handleReset}>
          RESET
        </button>
        <button className="btn" onClick={handleAnalyze}>
          ANALYZE
        </button>
      </div>
    </div>
  )
}
