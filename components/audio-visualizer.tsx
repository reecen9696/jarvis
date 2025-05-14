"use client"

import { useEffect, useRef, useState } from "react"
import { BackgroundScene } from "@/components/background/background-scene"
import { Header } from "@/components/ui/header"
import { ScannerFrame } from "@/components/ui/scanner-frame"
import { Terminal } from "@/components/terminal/terminal"
import { DataPanel } from "@/components/data-panel/data-panel"
import { ControlPanel } from "@/components/control-panel/control-panel"
import { VaultMetrics } from "@/components/vault-metrics"
import { SpectrumAnalyzer } from "@/components/audio/spectrum-analyzer"
import { CircularVisualizer } from "@/components/audio/circular-visualizer"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { NotificationSystem } from "@/components/ui/notification-system"
import { ThreeJSScene } from "@/components/three-js/three-js-scene"
import { useAudioSystem } from "@/hooks/use-audio-system"
import { config } from "@/lib/config"

export default function AudioVisualizer() {
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState("")
  const [notificationVisible, setNotificationVisible] = useState(false)
  const threeContainerRef = useRef<HTMLDivElement>(null)
  const timestampRef = useRef<HTMLDivElement>(null)

  // Control values
  const [rotationSpeed, setRotationSpeed] = useState(config.defaultRotationSpeed)
  const [resolution, setResolution] = useState(config.defaultResolution)
  const [distortion, setDistortion] = useState(config.defaultDistortion)
  const [audioReactivity, setAudioReactivity] = useState(config.defaultAudioReactivity)
  const [volume, setVolume] = useState(config.defaultVolume) // Renamed from audioSensitivity to volume
  const [showControls, setShowControls] = useState(config.showControls)
  const [showVaultMetrics, setShowVaultMetrics] = useState(config.showVaultMetrics)

  // Audio system
  const {
    audioContextRef,
    audioAnalyserRef,
    audioData,
    frequencyData,
    isAudioInitialized,
    isAudioPlaying,
    currentFileName,
    setCurrentFileName,
    isMuted,
    toggleMute,
  } = useAudioSystem()

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message)
    setNotificationVisible(true)
    setTimeout(() => {
      setNotificationVisible(false)
    }, 3000)
  }

  const toggleControlsVisibility = () => {
    const newValue = !showControls
    setShowControls(newValue)

    // Update the config value
    config.showControls = newValue

    // Show notification
    showNotification(newValue ? "CONTROLS VISIBLE" : "CONTROLS HIDDEN")

    // Add terminal message
    const terminalContent = document.getElementById("terminal-content")
    if (terminalContent) {
      const newLine = document.createElement("div")
      newLine.className = "terminal-line command-line"
      newLine.textContent = newValue ? "SYSTEM.INTERFACE.SHOW_CONTROLS()" : "SYSTEM.INTERFACE.HIDE_CONTROLS()"
      terminalContent.appendChild(newLine)
      terminalContent.scrollTop = terminalContent.scrollHeight
    }
  }

  const toggleVaultMetricsVisibility = () => {
    const newValue = !showVaultMetrics
    setShowVaultMetrics(newValue)

    // Update the config value
    config.showVaultMetrics = newValue

    // Show notification
    showNotification(newValue ? "VAULT METRICS VISIBLE" : "VAULT METRICS HIDDEN")

    // Add terminal message
    const terminalContent = document.getElementById("terminal-content")
    if (terminalContent) {
      const newLine = document.createElement("div")
      newLine.className = "terminal-line command-line"
      newLine.textContent = newValue ? "SYSTEM.INTERFACE.SHOW_VAULT_METRICS()" : "SYSTEM.INTERFACE.HIDE_VAULT_METRICS()"
      terminalContent.appendChild(newLine)
      terminalContent.scrollTop = terminalContent.scrollHeight
    }
  }

  // Initialize
  useEffect(() => {
    // Update timestamp
    const updateTimestamp = () => {
      if (timestampRef.current) {
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, "0")
        const minutes = String(now.getMinutes()).padStart(2, "0")
        const seconds = String(now.getSeconds()).padStart(2, "0")
        timestampRef.current.textContent = `TIME: ${hours}:${minutes}:${seconds}`
      }
    }

    const timestampInterval = setInterval(updateTimestamp, 1000)
    updateTimestamp()

    // Initialize loading sequence
    setTimeout(() => {
      setLoading(false)
      showNotification("SYSTEM INITIALIZED")

      // Add a delayed notification about keyboard shortcuts
      setTimeout(() => {
        showNotification("PRESS 'H' TO TOGGLE CONTROLS")
      }, 3000)
    }, 3000)

    // Add keyboard shortcut to toggle controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") {
        toggleControlsVisibility()
      } else if (e.key === "v" || e.key === "V") {
        toggleVaultMetricsVisibility()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      clearInterval(timestampInterval)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background */}
      <BackgroundScene />

      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

      {/* Notification */}
      <NotificationSystem message={notification} visible={notificationVisible} />

      {/* Three.js Container */}
      <ThreeJSScene
        containerRef={threeContainerRef}
        options={{
          rotationSpeed,
          resolution,
          distortion,
          audioReactivity,
          audioSensitivity: volume, // Pass volume as audioSensitivity for now
        }}
      />

      {/* Circular Visualizer */}
      <CircularVisualizer
        audioAnalyser={audioAnalyserRef.current}
        audioSensitivity={volume}
        audioReactivity={audioReactivity}
      />

      {/* Interface Container */}
      <div className="interface-container">
        <Header timestampRef={timestampRef} />
        <ScannerFrame />
      </div>

      {/* Data Panels */}
      <DataPanel position="top-left" title="ANOMALY METRICS" audioAnalyser={audioAnalyserRef.current} />
      <DataPanel
        position="top-right"
        title="ANOMALY METRICS"
        type="waveform"
        audioAnalyser={audioAnalyserRef.current}
      />

      {/* Control Panel (right side) */}
      <ControlPanel
        rotationSpeed={rotationSpeed}
        setRotationSpeed={setRotationSpeed}
        resolution={resolution}
        setResolution={setResolution}
        distortion={distortion}
        setDistortion={setDistortion}
        audioReactivity={audioReactivity}
        setAudioReactivity={setAudioReactivity}
        showNotification={showNotification}
        visible={showControls}
      />

      {/* Vault Metrics Panel (left side) */}
      <VaultMetrics visible={showVaultMetrics} />

      {/* Terminal */}
      <Terminal />

      {/* Spectrum Analyzer */}
      <SpectrumAnalyzer
        audioAnalyser={audioAnalyserRef.current}
        volume={volume}
        setVolume={setVolume}
        currentFileName={currentFileName}
        setCurrentFileName={setCurrentFileName}
        showNotification={showNotification}
        isMuted={isMuted}
        toggleMute={toggleMute}
      />
    </div>
  )
}
