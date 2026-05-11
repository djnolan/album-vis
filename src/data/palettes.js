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
    id: "xerox-dream",
    name: "Xerox Dream",
    bg: "#F3F0E8",
    colorStart: "#5E5E5E",
    colorEnd: "#FF1744",
    lightBg: true,
  },

  {
    id: "deep-sea-tape",
    name: "Deep Sea Tape",
    bg: "#06141F",
    colorStart: "#006D77",
    colorEnd: "#83C5BE",
  },

  {
    id: "mercury-flash",
    name: "Mercury Flash",
    bg: "#111111",
    colorStart: "#C0C0C0",
    colorEnd: "#00FFD1",
  },

  {
    id: "sunset-fm",
    name: "Sunset FM",
    bg: "#FFF1E6",
    colorStart: "#FF7B54",
    colorEnd: "#7B2CBF",
    lightBg: true,
  },

  {
    id: "fruit-leather",
    name: "Fruit Leather",
    bg: "#2B1B17",
    colorStart: "#C8553D",
    colorEnd: "#F4D35E",
  },

];

export const DEFAULT_PALETTE_ID = "neon-citrus";
