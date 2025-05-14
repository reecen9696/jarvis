"use client"
import { StandardDataPanel } from "./standard-data-panel"
import { WaveformDataPanel } from "./waveform-data-panel"

interface DataPanelProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  title: string
  type?: "standard" | "waveform"
  audioAnalyser: AnalyserNode | null
}

export function DataPanel({ position, title, type = "standard", audioAnalyser }: DataPanelProps) {
  if (type === "standard") {
    return <StandardDataPanel position={position} title={title} audioAnalyser={audioAnalyser} />
  }

  return <WaveformDataPanel position={position} title={title} audioAnalyser={audioAnalyser} />
}
