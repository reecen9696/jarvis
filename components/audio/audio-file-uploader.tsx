"use client"

import type React from "react"

import { useRef } from "react"

interface AudioFileUploaderProps {
  currentFileName: string
  setCurrentFileName: (name: string) => void
  showNotification: (message: string) => void
}

export function AudioFileUploader({ currentFileName, setCurrentFileName, showNotification }: AudioFileUploaderProps) {
  const audioFileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <>
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
    </>
  )
}
