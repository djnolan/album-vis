// palettes.js
// Edit this file to add, remove, or modify palettes.
// Each palette: { id, name, bg, colorStart, colorEnd }
// bg:         background color (also used for center cutout 'hole')
// colorStart: low end of the chromatic ramp (C notes)
// colorEnd:   high end of the chromatic ramp (B notes)

export const PALETTES = [

  {
    id: "neon-citrus",
    name: "Neon Citrus",
    bg: "#1F1F1F",
    colorStart: "#2A6F6A",
    colorEnd: "#F2FF4D",
  },

  {
    id: "terracotta-punch",
    name: "Terracotta Punch",
    bg: "#DAD2C3",
    colorStart: "#C49A7A",
    colorEnd: "#3A6FF2",
    lightBg: true,
  },

  {
    id: "acid-bloom",
    name: "Acid Bloom",
    bg: "#222222",
    colorStart: "#3A8F2A",
    colorEnd: "#FF00C8",
  },

  {
    id: "ultraviolet-clash",
    name: "Ultraviolet Clash",
    bg: "#140F2D",
    colorStart: "#2E0F7A",
    colorEnd: "#F72585",
  },

  {
    id: "electric-orchid",
    name: "Electric Orchid",
    bg: "#2A1F3D",
    colorStart: "#3F2A6B",
    colorEnd: "#00E5FF",
  },

  {
    id: "prism-bloom",
    name: "Prism Bloom",
    bg: "#FFF6E0",
    colorStart: "#FF9F1C",
    colorEnd: "#2EC4FF",
    lightBg: true,
  },

  {
    id: "burnt-hologram",
    name: "Burnt Hologram",
    bg: "#2B1F1A",
    colorStart: "#FF7A00",
    colorEnd: "#FFD9F7",
  },

  {
    id: "deep-sea-tape",
    name: "Deep Sea Tape",
    bg: "#06141F",
    colorStart: "#006D77",
    colorEnd: "#83C5BE",
  },

  {
    id: "midnight-transit",
    name: "Midnight Transit",
    bg: "#1A2238",
    colorStart: "#4EA5D9",
    colorEnd: "#FF6B8A",
  },

  {
    id: "blue-screen-life",
    name: "Blue Screen Life",
    bg: "#2146C7",
    colorStart: "#A7C7FF",
    colorEnd: "#FFE66D",
  },

  {
    id: "lava-lamp",
    name: "Lava Lamp",
    bg: "#A63A50",
    colorStart: "#FFD166",
    colorEnd: "#7BFFB7",
  },

  {
    id: "green-room",
    name: "Green Room",
    bg: "#0B6E4F",
    colorStart: "#C2F970",
    colorEnd: "#FF6B6B",
  },

];

export const DEFAULT_PALETTE_ID = "neon-citrus";
