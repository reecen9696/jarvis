"use client"

import { useState, useCallback } from "react"

interface TerminalMessage {
  text: string
  type: "normal" | "command" | "regular"
}

export function useTerminalMessages() {
  const [messages, setMessages] = useState<TerminalMessage[]>([
    { text: "NEXUS v3.7.2 INITIALIZED. SECURE CONNECTION ESTABLISHED.", type: "normal" },
    { text: "gsap.inertia.init(throwProps: true, resistance: 0.35);", type: "command" },
    { text: "Draggable.create({bounds: window, inertia: true, edgeResistance: 0.65});", type: "regular" },
    { text: "webflow.interactions.trigger('IX2', {value: 'anomaly-detection'});", type: "command" },
  ])

  const addTerminalMessage = useCallback((message: string, isCommand = false) => {
    let type: "normal" | "command" | "regular" = "normal"

    if (isCommand) {
      if (
        message.includes("gsap") ||
        message.includes("GSAP") ||
        message.includes("webflow") ||
        message.includes("WEBFLOW") ||
        message.includes("FILIP")
      ) {
        type = "command"
      } else if (message.includes("Draggable")) {
        type = "regular"
      }
    }

    setMessages((prev) => [...prev, { text: message, type }])
  }, [])

  return { messages, addTerminalMessage }
}
