"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { config } from "@/lib/config";

export function useAudioSystem() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Audio state
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(
    "JARVIS INTERFACE AUDIO"
  );
  const [isMuted, setIsMuted] = useState(config.startMuted); // Use config value

  // Toggle mute (and on unmute, resume and play audio in response to user gesture)
  const toggleMute = useCallback(() => {
    const audioEl = currentAudioElementRef.current;
    if (!audioEl) return;
    const newMuted = !audioEl.muted;
    // Ensure audio context and analyser are initialized before playing
    if (!audioContextRef.current || !audioAnalyserRef.current) {
      setupDefaultAudio();
    }
    // Apply mute state
    audioEl.muted = newMuted;
    setIsMuted(newMuted);
    // On unmute, resume context and play audio
    if (!newMuted) {
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx
          .resume()
          .catch((e) => console.error("Error resuming AudioContext:", e));
      }
      audioEl
        .play()
        .then(() => setIsAudioPlaying(true))
        .catch((e) => console.error("Error playing audio on unmute:", e));
    }
  }, [isMuted]);

  // Initialize audio
  const initAudio = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const audioAnalyser = audioContext.createAnalyser();
      audioAnalyser.fftSize = 2048;
      audioAnalyser.smoothingTimeConstant = 0.8;

      const audioDataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
      const frequencyDataArray = new Uint8Array(
        audioAnalyser.frequencyBinCount
      );

      audioAnalyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      audioAnalyserRef.current = audioAnalyser;
      setAudioData(audioDataArray);
      setFrequencyData(frequencyDataArray);
      setIsAudioInitialized(true);

      return true;
    } catch (error) {
      console.error("Audio initialization error:", error);
      return false;
    }
  };

  // Create or recreate audio element and setup audio processing
  const setupDefaultAudio = () => {
    try {
      if (!audioContextRef.current) {
        initAudio();
      }

      if (!audioContextRef.current || !audioAnalyserRef.current) {
        console.error("Audio context not initialized");
        return false;
      }

      // Create audio element if it doesn't exist
      if (!currentAudioElementRef.current) {
        const audioElement = document.createElement("audio");
        audioElement.id = "audio-player";
        audioElement.className = "audio-player";
        audioElement.crossOrigin = "anonymous";
        audioElement.loop = true; // Set audio to loop
        audioElement.muted = config.startMuted; // Use config value

        // Add to DOM
        const audioControls = document.querySelector(".audio-controls");
        if (audioControls) {
          audioControls.insertBefore(audioElement, audioControls.firstChild);
        } else {
          document.body.appendChild(audioElement);
        }

        currentAudioElementRef.current = audioElement;
      }

      // Set audio source to the new JARVIS audio file
      currentAudioElementRef.current.src = "/audio/jarvis.mp3";

      // Connect audio to analyzer
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.disconnect();
        } catch (e) {
          console.log("Error disconnecting previous source:", e);
        }
      }

      audioSourceRef.current = audioContextRef.current.createMediaElementSource(
        currentAudioElementRef.current
      );
      audioSourceRef.current.connect(audioAnalyserRef.current);

      // Play audio
      const playAudio = () => {
        if (currentAudioElementRef.current) {
          currentAudioElementRef.current
            .play()
            .then(() => {
              setIsAudioPlaying(true);
              console.log("Audio is now playing (but muted)");
            })
            .catch((error) => {
              console.error("Error playing audio:", error);

              // If autoplay is prevented, listen for user interaction to try again
              const handleUserInteraction = () => {
                if (currentAudioElementRef.current) {
                  currentAudioElementRef.current
                    .play()
                    .then(() => {
                      setIsAudioPlaying(true);
                      console.log(
                        "Audio is now playing after user interaction (but muted)"
                      );

                      // Remove event listeners once audio is playing
                      document.removeEventListener(
                        "click",
                        handleUserInteraction
                      );
                      document.removeEventListener(
                        "keydown",
                        handleUserInteraction
                      );
                    })
                    .catch((e) =>
                      console.error("Still couldn't play audio:", e)
                    );
                }
              };

              document.addEventListener("click", handleUserInteraction);
              document.addEventListener("keydown", handleUserInteraction);
            });
        }
      };

      // If AudioContext is suspended, resume it first
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().then(() => {
          playAudio();
        });
      } else {
        playAudio();
      }

      return true;
    } catch (error) {
      console.error("Error setting up audio:", error);
      return false;
    }
  };

  // Setup audio on component mount
  useEffect(() => {
    setupDefaultAudio();

    // Start audio data update loop
    const updateAudioData = () => {
      if (audioAnalyserRef.current && isAudioPlaying) {
        const audioDataArray = new Uint8Array(
          audioAnalyserRef.current.frequencyBinCount
        );
        const frequencyDataArray = new Uint8Array(
          audioAnalyserRef.current.frequencyBinCount
        );

        audioAnalyserRef.current.getByteTimeDomainData(audioDataArray);
        audioAnalyserRef.current.getByteFrequencyData(frequencyDataArray);

        setAudioData(audioDataArray);
        setFrequencyData(frequencyDataArray);

        // Calculate average amplitude for visualization
        let sum = 0;
        for (let i = 0; i < frequencyDataArray.length; i++) {
          sum += frequencyDataArray[i];
        }
        const average = sum / (frequencyDataArray.length * 255);

        // Share audio level with visualizer
        const visualizer = document.querySelector(".circular-visualizer");
        if (visualizer) {
          visualizer.setAttribute("data-audio-level", average.toString());
        }
      }

      requestAnimationFrame(updateAudioData);
    };

    const animationFrameId = requestAnimationFrame(updateAudioData);

    // Force play audio after a short delay
    setTimeout(() => {
      const audioElement = document.getElementById(
        "audio-player"
      ) as HTMLAudioElement;
      if (audioElement) {
        audioElement.volume = 0.5; // Set a default volume
        audioElement.muted = config.startMuted; // Use config value

        audioElement
          .play()
          .then(() => {
            setIsAudioPlaying(true);
            console.log("Audio is now playing after forced play (but muted)");
          })
          .catch((error) => {
            console.error("Error playing audio:", error);

            // Add a click event listener to the document to enable audio on user interaction
            const enableAudio = () => {
              audioElement
                .play()
                .then(() => {
                  setIsAudioPlaying(true);
                  console.log(
                    "Audio enabled after user interaction (but muted)"
                  );
                  document.removeEventListener("click", enableAudio);
                })
                .catch((e) => console.error("Still couldn't play audio:", e));
            };

            document.addEventListener("click", enableAudio);
          });
      }
    }, 2000);

    // Cleanup function
    return () => {
      // Cancel animation frame
      cancelAnimationFrame(animationFrameId);

      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.disconnect();
        } catch (e) {
          console.log("Error disconnecting source during cleanup:", e);
        }
      }

      if (currentAudioElementRef.current) {
        currentAudioElementRef.current.pause();
        if (currentAudioElementRef.current.parentNode) {
          currentAudioElementRef.current.parentNode.removeChild(
            currentAudioElementRef.current
          );
        }
      }

      // Close audio context if it exists
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current
          .close()
          .catch((err) => console.error("Error closing audio context:", err));
      }
    };
  }, []);

  return {
    audioContextRef,
    audioAnalyserRef,
    audioSourceRef,
    currentAudioElementRef,
    audioData,
    frequencyData,
    isAudioInitialized,
    isAudioPlaying,
    setIsAudioPlaying,
    currentFileName,
    setCurrentFileName,
    initAudio,
    isMuted,
    toggleMute,
  };
}
