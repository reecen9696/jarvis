"use client"

import { useEffect, useRef, useState } from "react"

export function Terminal() {
  const terminalContentRef = useRef<HTMLDivElement>(null)
  const typingLineRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<string[]>([
    "NEXUS v3.7.2 INITIALIZED. SECURE CONNECTION ESTABLISHED.",
    "gsap.inertia.init(throwProps: true, resistance: 0.35);",
    "Draggable.create({bounds: window, inertia: true, edgeResistance: 0.65});",
    "webflow.interactions.trigger('IX2', {value: 'anomaly-detection'});",
  ])

  // Initial messages to type
  const initialMessages = ["SYSTEM INITIALIZED. AUDIO ANALYSIS READY.", "SCANNING FOR ANOMALIES IN FREQUENCY SPECTRUM."]

  useEffect(() => {
    const messageQueue = [...initialMessages]
    let typingInterval: NodeJS.Timeout
    let currentMessage = ""
    let charIndex = 0

    const typeNextMessage = () => {
      if (messageQueue.length === 0) return

      currentMessage = messageQueue.shift() || ""
      charIndex = 0

      typingInterval = setInterval(() => {
        if (charIndex < currentMessage.length) {
          if (typingLineRef.current) {
            typingLineRef.current.textContent = currentMessage.substring(0, charIndex + 1)
          }
          charIndex++
        } else {
          clearInterval(typingInterval)

          // Add the completed message to the terminal
          addTerminalMessage(currentMessage, true)

          if (typingLineRef.current) {
            typingLineRef.current.textContent = ""
          }

          // Schedule the next message
          setTimeout(typeNextMessage, 5000)
        }
      }, 50)
    }

    // Start typing after a delay
    const initialDelay = setTimeout(() => {
      typeNextMessage()
    }, 3000)

    // Schedule cryptic messages
    let crypticMessageTimeout: NodeJS.Timeout
    let lastUserActionTime = Date.now()
    let currentMessageIndex = 0

    const scheduleCrypticMessages = () => {
      if (crypticMessageTimeout) {
        clearTimeout(crypticMessageTimeout)
      }

      const delay = Math.random() * 15000 + 10000 // 10-25 seconds

      crypticMessageTimeout = setTimeout(() => {
        if (Date.now() - lastUserActionTime > 10000) {
          const crypticMessages = [
            "GSAP.TO('#FILIP', {POSITION: 'WEBFLOW', DURATION: '3.0 QUANTUM_CYCLES'});",
            "CONST FILIP = NEW DESIGNER({SKILLS: ['GSAP', 'THREEJS', 'WEBFLOW', 'NEURAL_UI']});",
            "AWAIT WEBFLOW.HIRE(FILIP, {ROLE: 'DESIGNER', SALARY: 'COMPETITIVE'});",
            "SYSTEM.INTEGRATE(FILIP.CREATIVITY, {TARGET: 'WEBFLOW_ECOSYSTEM', EFFICIENCY: 0.97});",
            "TIMELINE.FORK({AGENT: 'FILIP', MISSION: 'ELEVATE_DIGITAL_EXPERIENCES', PROBABILITY: 0.998});",
          ]

          // Get the current message and increment the index
          const selectedMessage = crypticMessages[currentMessageIndex]
          addTerminalMessage(selectedMessage, true)

          // Move to the next message, loop back to the beginning if we've shown all messages
          currentMessageIndex = (currentMessageIndex + 1) % crypticMessages.length
        }

        scheduleCrypticMessages()
      }, delay)
    }

    // Start scheduling cryptic messages
    setTimeout(() => {
      scheduleCrypticMessages()
      setTimeout(() => {
        addTerminalMessage("FILIPPORTFOLIO.VERSION = 'EXCEPTIONAL';", true)
      }, 15000)
    }, 10000)

    // Track user activity
    const updateUserActivity = () => {
      lastUserActionTime = Date.now()
    }

    document.addEventListener("mousemove", updateUserActivity)
    document.addEventListener("click", updateUserActivity)
    document.addEventListener("keydown", updateUserActivity)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(typingInterval)
      clearTimeout(crypticMessageTimeout)
      document.removeEventListener("mousemove", updateUserActivity)
      document.removeEventListener("click", updateUserActivity)
      document.removeEventListener("keydown", updateUserActivity)
    }
  }, [])

  // Add a message to the terminal
  const addTerminalMessage = (message: string, isCommand = false) => {
    setMessages((prev) => [...prev, message])

    // Scroll to bottom
    if (terminalContentRef.current) {
      setTimeout(() => {
        if (terminalContentRef.current) {
          terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight
        }
      }, 0)
    }
  }

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <span>SYSTEM TERMINAL</span>
        <span id="terminal-status">ONLINE</span>
      </div>
      <div className="terminal-content" ref={terminalContentRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`terminal-line ${
              message.includes("gsap") ||
              message.includes("GSAP") ||
              message.includes("webflow") ||
              message.includes("WEBFLOW") ||
              message.includes("FILIP")
                ? "command-line"
                : message.includes("Draggable")
                  ? "regular-line"
                  : ""
            }`}
          >
            {message}
          </div>
        ))}
        <div className="terminal-line typing" ref={typingLineRef}></div>
      </div>
    </div>
  )
}
