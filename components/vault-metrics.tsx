"use client"

import { useState } from "react"
import { config } from "@/lib/config"

interface VaultMetricsProps {
  visible?: boolean
}

export function VaultMetrics({ visible = true }: VaultMetricsProps) {
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [amount, setAmount] = useState("")

  // Check both config and visible prop
  if (!config.showVaultMetrics || !visible) {
    return null
  }

  const handleDeposit = () => {
    if (showDepositForm) {
      // Stub function for deposit
      console.log(`Depositing ${amount}`)

      // Add terminal message
      const terminalContent = document.getElementById("terminal-content")
      if (terminalContent) {
        const newLine = document.createElement("div")
        newLine.className = "terminal-line command-line"
        newLine.textContent = `VAULT.DEPOSIT(${amount || "0"});`
        terminalContent.appendChild(newLine)
        terminalContent.scrollTop = terminalContent.scrollHeight
      }

      // Reset form
      setAmount("")
      setShowDepositForm(false)
    } else {
      setShowDepositForm(true)
      setShowWithdrawForm(false)
    }
  }

  const handleWithdraw = () => {
    if (showWithdrawForm) {
      // Stub function for withdraw
      console.log(`Withdrawing ${amount}`)

      // Add terminal message
      const terminalContent = document.getElementById("terminal-content")
      if (terminalContent) {
        const newLine = document.createElement("div")
        newLine.className = "terminal-line command-line"
        newLine.textContent = `VAULT.WITHDRAW(${amount || "0"});`
        terminalContent.appendChild(newLine)
        terminalContent.scrollTop = terminalContent.scrollHeight
      }

      // Reset form
      setAmount("")
      setShowWithdrawForm(false)
    } else {
      setShowWithdrawForm(true)
      setShowDepositForm(false)
    }
  }

  const handleCancel = () => {
    setShowDepositForm(false)
    setShowWithdrawForm(false)
    setAmount("")
  }

  return (
    <div className="vault-metrics">
      <div className="panel-header">
        <span className="data-panel-title">VAULT METRICS</span>
        <span className="drag-handle" id="vault-metrics-handle">
          ⋮⋮
        </span>
      </div>

      {!showDepositForm && !showWithdrawForm ? (
        <>
          {/* Bot name at the top */}
          <div className="metrics-group">
            <div className="metrics-row">
              <span className="metrics-label">NAME:</span>
              <span className="metrics-value">{config.vaultMetrics.botName}</span>
            </div>
          </div>

          <div className="metrics-group">
            <div className="metrics-row">
              <span className="metrics-label">TVL:</span>
              <span className="metrics-value">{config.vaultMetrics.tvl}</span>
            </div>
            <div className="metrics-row">
              <span className="metrics-label">MONTHLY ARR:</span>
              <span className="metrics-value">{config.vaultMetrics.monthlyArr}</span>
            </div>
            <div className="metrics-row">
              <span className="metrics-label">YOUR DEPOSIT:</span>
              <span className="metrics-value">{config.vaultMetrics.yourDeposit}</span>
            </div>
            <div className="metrics-row">
              <span className="metrics-label">YOUR PROFIT:</span>
              <span className="metrics-value">{config.vaultMetrics.yourProfit}</span>
            </div>
          </div>

          <div className="metrics-group">
            <div className="metrics-row">
              <span className="metrics-label">PROFITABLE TRADES:</span>
              <span className="metrics-value">{config.vaultMetrics.profitableTrades}</span>
            </div>
          </div>

          <div className="buttons">
            <button className="btn" onClick={handleDeposit}>
              DEPOSIT
            </button>
            <button className="btn" onClick={handleWithdraw}>
              WITHDRAW
            </button>
          </div>
        </>
      ) : (
        <div className="deposit-form">
          <div className="metrics-row">
            <span className="metrics-label">{showDepositForm ? "DEPOSIT AMOUNT:" : "WITHDRAW AMOUNT:"}</span>
          </div>
          <input
            type="text"
            className="deposit-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            autoFocus
          />
          <div className="buttons">
            <button className="btn" onClick={showDepositForm ? handleDeposit : handleWithdraw}>
              CONFIRM
            </button>
            <button className="btn" onClick={handleCancel}>
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
