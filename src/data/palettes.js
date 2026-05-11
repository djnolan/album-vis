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
    id: "chrome-lagoon",
    name: "Chrome Lagoon",
    bg: "#E8EDF2",
    colorStart: "#7AD7F0",
    colorEnd: "#5B3DF5",
    lightBg: true,
  },

  {
    id: "signal-decay",
    name: "Signal Decay",
    bg: "#241E2B",
    colorStart: "#7868A6",
    colorEnd: "#FF6B35",
  },

  {
    id: "burnt-hologram",
    name: "Burnt Hologram",
    bg: "#2B1F1A",
    colorStart: "#FF7A00",
    colorEnd: "#FFD9F7",
  },

  {
    id: "ultraviolet-clash",
    name: "Ultraviolet Clash",
    bg: "#140F2D",
    colorStart: "#2E0F7A",
    colorEnd: "#F72585",
  },

  {
    id: "laser-velvet",
    name: "Laser Velvet",
    bg: "#160B22",
    colorStart: "#7B2CBF",
    colorEnd: "#FF2E63",
  },

  {
    id: "digital-koi",
    name: "Digital Koi",
    bg: "#F7F4EE",
    colorStart: "#FF7F50",
    colorEnd: "#00B8D9",
    lightBg: true,
  },

  {
    id: "electric-orchid",
    name: "Electric Orchid",
    bg: "#2A1F3D",
    colorStart: "#3F2A6B",
    colorEnd: "#00E5FF",
  },

  {
    id: "cassette-heat",
    name: "Cassette Heat",
    bg: "#1E1A17",
    colorStart: "#A14A28",
    colorEnd: "#FFB703",
  },

  {
    id: "prism-bloom",
    name: "Prism Bloom",
    bg: "#FFF6E0",
    colorStart: "#FF9F1C",
    colorEnd: "#2EC4FF",
    lightBg: true,
  },

];

export const DEFAULT_PALETTE_ID = "neon-citrus";
