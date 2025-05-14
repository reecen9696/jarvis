"use client"

export function setupAudio() {
  let audioContext: AudioContext | null = null
  let audioAnalyser: AnalyserNode | null = null
  let audioSource: MediaElementAudioSourceNode | null = null
  let audioData: Uint8Array | null = null
  let frequencyData: Uint8Array | null = null
  let isAudioInitialized = false
  let isAudioPlaying = false
  let audioContextStarted = false
  let audioSourceConnected = false
  let currentAudioElement: HTMLAudioElement | null = null

  // Initialize audio
  function initAudio() {
    if (isAudioInitialized) return true

    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioAnalyser = audioContext.createAnalyser()
      audioAnalyser.fftSize = 2048
      audioAnalyser.smoothingTimeConstant = 0.8

      audioData = new Uint8Array(audioAnalyser.frequencyBinCount)
      frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount)

      audioAnalyser.connect(audioContext.destination)
      isAudioInitialized = true

      addTerminalMessage("AUDIO ANALYSIS SYSTEM INITIALIZED.")
      showNotification("AUDIO ANALYSIS SYSTEM ONLINE")

      return true
    } catch (error) {
      console.error("Audio initialization error:", error)
      addTerminalMessage("ERROR: AUDIO SYSTEM INITIALIZATION FAILED.")
      showNotification("AUDIO SYSTEM ERROR")

      return false
    }
  }

  // Ensure audio context is started
  function ensureAudioContextStarted() {
    if (!audioContext) {
      if (!initAudio()) return false
    }

    if (audioContext.state === "suspended") {
      audioContext
        .resume()
        .then(() => {
          if (!audioContextStarted) {
            audioContextStarted = true
            addTerminalMessage("AUDIO CONTEXT RESUMED.")
          }
        })
        .catch((err) => {
          console.error("Failed to resume audio context:", err)
          addTerminalMessage("ERROR: FAILED TO RESUME AUDIO CONTEXT.")
        })
    } else {
      audioContextStarted = true
    }

    return true
  }

  // Clean up audio source
  function cleanupAudioSource() {
    if (audioSource) {
      try {
        audioSource.disconnect()
        audioSourceConnected = false
        audioSource = null
      } catch (e) {
        console.log("Error disconnecting previous source:", e)
      }
    }
  }

  // Create new audio element
  function createNewAudioElement() {
    if (currentAudioElement) {
      if (currentAudioElement.parentNode) {
        currentAudioElement.parentNode.removeChild(currentAudioElement)
      }
    }

    const newAudioElement = document.createElement("audio")
    newAudioElement.id = "audio-player"
    newAudioElement.className = "audio-player"
    newAudioElement.crossOrigin = "anonymous"

    document.querySelector(".audio-controls")?.insertBefore(newAudioElement, document.querySelector(".controls-row"))

    currentAudioElement = newAudioElement
    return newAudioElement
  }

  // Setup audio source
  function setupAudioSource(audioElement: HTMLAudioElement) {
    try {
      if (!ensureAudioContextStarted()) {
        addTerminalMessage("ERROR: AUDIO CONTEXT NOT AVAILABLE. CLICK ANYWHERE TO ENABLE AUDIO.")
        return false
      }

      cleanupAudioSource()

      try {
        // Only create a new media element source if one doesn't already exist
        if (!audioSourceConnected && audioContext) {
          audioSource = audioContext.createMediaElementSource(audioElement)
          audioSource.connect(audioAnalyser!)
          audioSourceConnected = true
        }

        return true
      } catch (error: any) {
        console.error("Error creating media element source:", error)

        if (error.name === "InvalidStateError" && error.message.includes("already connected")) {
          addTerminalMessage("AUDIO SOURCE ALREADY CONNECTED. ATTEMPTING TO PLAY ANYWAY.")
          return true
        }

        addTerminalMessage("ERROR: FAILED TO SETUP AUDIO SOURCE. " + error.message)
        return false
      }
    } catch (error) {
      console.error("Error setting up audio source:", error)
      addTerminalMessage("ERROR: FAILED TO SETUP AUDIO SOURCE.")
      return false
    }
  }

  // Initialize audio file
  function initAudioFile(file: File) {
    try {
      if (!isAudioInitialized && !initAudio()) {
        return
      }

      const audioPlayer = createNewAudioElement()
      const fileURL = URL.createObjectURL(file)

      audioPlayer.src = fileURL
      audioPlayer.onloadeddata = () => {
        if (setupAudioSource(audioPlayer)) {
          audioPlayer
            .play()
            .then(() => {
              isAudioPlaying = true
              // Zoom camera for audio
              const threeContainer = document.getElementById("three-container")
              if (threeContainer) {
                // Trigger camera zoom animation
              }
            })
            .catch((e) => {
              console.warn("Auto-play prevented:", e)
              addTerminalMessage("WARNING: AUTO-PLAY PREVENTED BY BROWSER. CLICK PLAY TO START AUDIO.")
            })
        }
      }

      const fileLabel = document.getElementById("file-label")
      if (fileLabel) {
        fileLabel.textContent = file.name
      }

      // Reset active state on demo track buttons
      document.querySelectorAll(".demo-track-btn").forEach((btn) => {
        btn.classList.remove("active")
      })

      addTerminalMessage(`AUDIO FILE LOADED: ${file.name}`)
      showNotification("AUDIO FILE LOADED")
    } catch (error) {
      console.error("Audio file error:", error)
      addTerminalMessage("ERROR: AUDIO FILE PROCESSING FAILED.")
      showNotification("AUDIO FILE ERROR")
    }
  }

  // Load audio from URL
  function loadAudioFromURL(url: string) {
    try {
      if (!isAudioInitialized && !initAudio()) {
        return
      }

      ensureAudioContextStarted()

      const audioPlayer = createNewAudioElement()
      audioPlayer.src = url

      audioPlayer.onloadeddata = () => {
        if (setupAudioSource(audioPlayer)) {
          audioPlayer
            .play()
            .then(() => {
              isAudioPlaying = true
              // Zoom camera for audio
              const threeContainer = document.getElementById("three-container")
              if (threeContainer) {
                // Trigger camera zoom animation
              }

              addTerminalMessage(`PLAYING DEMO TRACK: ${url.split("/").pop()}`)
              showNotification(`PLAYING: ${url.split("/").pop()}`)
            })
            .catch((e) => {
              console.warn("Play prevented:", e)
              addTerminalMessage("WARNING: AUDIO PLAYBACK PREVENTED BY BROWSER. CLICK PLAY TO START AUDIO.")
              showNotification("CLICK PLAY TO START AUDIO")
            })
        }
      }

      const filename = url.split("/").pop() || "Unknown Track"
      const fileLabel = document.getElementById("file-label")
      if (fileLabel) {
        fileLabel.textContent = filename
      }

      addTerminalMessage(`LOADING AUDIO FROM URL: ${url.substring(0, 40)}...`)
      showNotification("AUDIO URL LOADED")
    } catch (error) {
      console.error("Audio URL error:", error)
      addTerminalMessage("ERROR: AUDIO URL PROCESSING FAILED.")
      showNotification("AUDIO URL ERROR")
    }
  }

  // Helper functions
  function addTerminalMessage(message: string, isCommand = false) {
    const terminalContent = document.getElementById("terminal-content")
    if (!terminalContent) return

    const newLine = document.createElement("div")
    newLine.className = isCommand ? "terminal-line command-line" : "terminal-line"
    newLine.textContent = message

    terminalContent.appendChild(newLine)
    terminalContent.scrollTop = terminalContent.scrollHeight
  }

  function showNotification(message: string) {
    const notification = document.getElementById("notification")
    if (!notification) return

    notification.textContent = message
    notification.style.opacity = "1"

    setTimeout(() => {
      notification.style.opacity = "0"
    }, 3000)
  }

  // Return public methods
  return {
    initAudio,
    initAudioFile,
    loadAudioFromURL,
    getAudioAnalyser: () => audioAnalyser,
    getAudioData: () => audioData,
    getFrequencyData: () => frequencyData,
    isInitialized: () => isAudioInitialized,
    isPlaying: () => isAudioPlaying,
  }
}
