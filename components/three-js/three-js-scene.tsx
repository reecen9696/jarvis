"use client"

import { type RefObject, useEffect, useRef } from "react"
import { setupThreeJS } from "@/lib/three-setup"

interface ThreeJSSceneProps {
  containerRef: RefObject<HTMLDivElement>
  options: {
    rotationSpeed: number
    resolution: number
    distortion: number
    audioReactivity: number
    audioSensitivity: number
  }
}

export function ThreeJSScene({ containerRef, options }: ThreeJSSceneProps) {
  const threeControllerRef = useRef<any>(null)

  useEffect(() => {
    if (containerRef.current) {
      // Initialize Three.js only once
      const threeJSController = setupThreeJS(containerRef.current, options)
      threeControllerRef.current = threeJSController

      return () => {
        // Proper cleanup when component unmounts
        if (threeControllerRef.current && threeControllerRef.current.cleanup) {
          threeControllerRef.current.cleanup()
        }
      }
    }
  }, [containerRef]) // Only depend on containerRef, not options

  // Update options without reinitializing
  useEffect(() => {
    if (threeControllerRef.current && threeControllerRef.current.updateOptions) {
      threeControllerRef.current.updateOptions(options)
    }
  }, [options])

  return <div id="three-container" ref={containerRef}></div>
}
