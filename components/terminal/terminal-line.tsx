interface TerminalLineProps {
  message: string
  type: "normal" | "command" | "regular"
}

export function TerminalLine({ message, type }: TerminalLineProps) {
  const getLineClass = () => {
    if (type === "command") return "terminal-line command-line"
    if (type === "regular") return "terminal-line regular-line"
    return "terminal-line"
  }

  return <div className={getLineClass()}>{message}</div>
}
