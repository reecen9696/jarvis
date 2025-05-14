"use client"

import { useEffect, useState } from "react"

interface StandardDataPanelProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  title: string
  audioAnalyser: AnalyserNode | null
}

export function StandardDataPanel({ position, title, audioAnalyser }: StandardDataPanelProps) {
  // Update the state variables to match the new metrics
  const [totalProfit, setTotalProfit] = useState(12450.25)
  const [totalDeployed, setTotalDeployed] = useState(75000.0)
  const [numAgents, setNumAgents] = useState(24)
  const [deadAgents, setDeadAgents] = useState(5)
  const [statusColor, setStatusColor] = useState("#ff4e42")

  // Replace the useEffect block with this updated version that handles the new metrics
  useEffect(() => {
    // Update metrics periodically
    const updateMetrics = () => {
      if (audioAnalyser) {
        const frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount)
        audioAnalyser.getByteFrequencyData(frequencyData)

        // Calculate average amplitude
        let sum = 0
        for (let i = 0; i < frequencyData.length; i++) {
          sum += frequencyData[i]
        }
        const amplitude = sum / (frequencyData.length * 255)

        // Occasionally update metrics based on audio activity
        if (Math.random() < 0.05) {
          // Slightly adjust profit based on audio
          const profitChange = (Math.random() * 100 - 50) * amplitude
          setTotalProfit((prev) => Math.max(0, Number((prev + profitChange).toFixed(2))))

          // Occasionally change number of agents
          if (Math.random() < 0.1) {
            const agentChange = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
            setNumAgents((prev) => Math.max(1, prev + agentChange))
          }

          // Occasionally change dead agents
          if (Math.random() < 0.05) {
            const deadChange = Math.random() < 0.7 ? 0 : 1 // 70% chance of no change, 30% chance of +1
            setDeadAgents((prev) => Math.min(numAgents, prev + deadChange))
          }

          // Update status color based on dead agents ratio
          const deadRatio = deadAgents / numAgents
          if (deadRatio > 0.3) {
            setStatusColor("#ff00a0") // Critical
          } else if (deadRatio > 0.15) {
            setStatusColor("#ffae00") // Warning
          } else {
            setStatusColor("#ff4e42") // Normal
          }
        }
      } else if (Math.random() < 0.05) {
        // Random fluctuations when no audio
        const profitChange = Math.random() * 100 - 50
        setTotalProfit((prev) => Math.max(0, Number((prev + profitChange).toFixed(2))))
      }
    }

    const metricsInterval = setInterval(updateMetrics, 100)
    return () => clearInterval(metricsInterval)
  }, [audioAnalyser, numAgents, deadAgents])

  return (
    <div
      className="data-panel"
      style={{
        position: "absolute",
        top: "20px",
        left: position.includes("right") ? "auto" : "20px",
        right: position.includes("right") ? "20px" : "auto",
      }}
    >
      <div className="data-panel-title">
        <span>{title}</span>
        <span id="status-indicator" style={{ color: statusColor }}>
          ●
        </span>
      </div>
      <div className="data-bar">
        <div className="data-bar-fill" style={{ width: `${(totalProfit / totalDeployed) * 100}%` }}></div>
      </div>
      <div className="data-readouts">
        <div className="data-row">
          <span className="data-label">TOTAL PROFIT:</span>
          <span className="data-value" id="stability-value">
            ${totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">TOTAL AMOUNT DEPLOYED:</span>
          <span className="data-value" id="mass-value">
            ${totalDeployed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">NUMBER OF AGENTS:</span>
          <span className="data-value" id="energy-value">
            {numAgents}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">DEAD AGENTS:</span>
          <span className="data-value" id="variance-value">
            {deadAgents}
          </span>
        </div>
      </div>
    </div>
  )
}
