"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { TerminalLine } from "./terminal-line"
import { useTerminalMessages } from "@/hooks/use-terminal-messages"

export function Terminal() {
  const terminalContentRef = useRef<HTMLDivElement>(null)
  const typingLineRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { messages, addTerminalMessage } = useTerminalMessages()
  const [inputValue, setInputValue] = useState("")

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
  }, [addTerminalMessage])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight
    }
  }, [messages])

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (inputValue.trim()) {
      // Convert to uppercase
      const uppercaseInput = inputValue.toUpperCase()

      // Add to terminal
      addTerminalMessage(`USER: ${uppercaseInput}`, false)

      // Post the message (for now just console log, but could be expanded)
      console.log("User terminal input:", uppercaseInput)

      // You could add additional logic here to process commands
      if (uppercaseInput.includes("HELP")) {
        addTerminalMessage("SYSTEM: AVAILABLE COMMANDS: HELP, STATUS, CLEAR, JARVIS", false)
      } else if (uppercaseInput.includes("STATUS")) {
        addTerminalMessage("SYSTEM: ALL SYSTEMS OPERATIONAL", false)
      } else if (uppercaseInput.includes("CLEAR")) {
        // This would need more implementation to actually clear the terminal
        addTerminalMessage("SYSTEM: TERMINAL CLEARED", false)
      } else if (uppercaseInput.includes("JARVIS")) {
        addTerminalMessage("JARVIS: I AM ONLINE AND READY TO ASSIST. HOW MAY I HELP YOU TODAY?", false)
      }

      // Clear input
      setInputValue("")

      // Focus back on input
      if (inputRef.current) {
        inputRef.current.focus()
      }
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
          <TerminalLine key={index} message={message.text} type={message.type} />
        ))}
        <div className="terminal-line typing" ref={typingLineRef}></div>
      </div>
      <form onSubmit={handleSubmit} className="terminal-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="terminal-input"
          placeholder="ENTER COMMAND..."
        />
        <button type="submit" className="terminal-submit">
          ENTER
        </button>
      </form>
    </div>
  )
}
