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
    id: "infrared-night",
    name: "Infrared Night",
    bg: "#140A0A",
    colorStart: "#7A0000",
    colorEnd: "#FF6B35",
  },
  {
    id: "hot-canary",
    name: "Hot Canary",
    bg: "#F5E500",
    colorStart: "#C17B00",
    colorEnd: "#FF2D6B",
    lightBg: true,
  },
  {
    id: "bubblegum-noir",
    name: "Bubblegum Noir",
    bg: "#FF2D78",
    colorStart: "#8B0050",
    colorEnd: "#FFE847",
  },
  {
    id: "toxic-jungle",
    name: "Toxic Jungle",
    bg: "#1A3A00",
    colorStart: "#2D6B00",
    colorEnd: "#CCFF00",
  },
  {
    id: "void-signal",
    name: "Void Signal",
    bg: "#0A0A0A",
    colorStart: "#1A006B",
    colorEnd: "#00FFD1",
  },
  {
    id: "copper-burn",
    name: "Copper Burn",
    bg: "#FF6B1A",
    colorStart: "#7A2800",
    colorEnd: "#FFE14D",
  },
  {
    id: "deep-fuchsia",
    name: "Deep Fuchsia",
    bg: "#2D0030",
    colorStart: "#6B006B",
    colorEnd: "#FF9EF5",
  },

];

export const DEFAULT_PALETTE_ID = "neon-citrus";
