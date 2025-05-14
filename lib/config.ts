// Application configuration
export const config = {
  // UI Controls
  showControls: false, // Flag to show/hide control panels

  // Audio settings
  defaultVolume: 5.0,
  startMuted: true,

  // Visual settings
  defaultRotationSpeed: 0.2, // Changed from 1.0 to 0.2
  defaultResolution: 32,
  defaultDistortion: 1.6, // Changed from 1.0 to 1.6
  defaultAudioReactivity: 0.4, // Changed from 1.0 to 0.4

  // Globe sizing
  mainGlobeScale: 0.85, // Reduced by 15% from 1.0

  // Panel positions
  controlPanelPosition: "right", // 'left' or 'right'

  // Vault Metrics
  showVaultMetrics: true, // Flag to show/hide vault metrics panel
  vaultMetrics: {
    tvl: "$192,000",
    monthlyArr: "9%",
    yourDeposit: "$1,000",
    yourProfit: "$21",
    botName: "BOT NAME #12",
    profitableTrades: "36%",
  },
}
