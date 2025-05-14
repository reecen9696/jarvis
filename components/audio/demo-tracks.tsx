"use client"

interface DemoTracksProps {
  setCurrentFileName: (name: string) => void
  showNotification: (message: string) => void
}

export function DemoTracks({ setCurrentFileName, showNotification }: DemoTracksProps) {
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
  )
}
