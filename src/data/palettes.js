// palettes.js
// Edit this file to add, remove, or modify palettes.
// Each palette: { id, name, bg, colorStart, colorEnd }
// bg:         background color (also used for center cutout 'hole')
// colorStart: one end of the chromatic ramp (C notes)
// colorEnd:   other end of the ramp (B notes)
// Note: ramp ends should be from different color families for maximum personality.

export const PALETTES = [

  // Blush / violet / dark — warm light meets vivid cool (inspired by img 1)
  {
    id: "dusk",
    name: "Dusk",
    bg: "#12130F",
    colorStart: "#7765E3",
    colorEnd: "#EFD9CE",
  },

  // Peach to burnt orange — warm, dark bg (inspired by img 5)
  {
    id: "ember",
    name: "Ember",
    bg: "#0B0A07",
    colorStart: "#CD5334",
    colorEnd: "#FBBA72",
  },

  // Deep tobacco brown — warm analog, timeless
  {
    id: "tobacco",
    name: "Tobacco",
    bg: "#2B1F14",
    colorStart: "#C4622D",
    colorEnd: "#F2DFA0",
  },

  // Deep indigo to pale lavender (inspired by img 4)
  {
    id: "vesper",
    name: "Vesper",
    bg: "#372554",
    colorStart: "#52528C",
    colorEnd: "#D1BCE3",
  },

  // Coral-red to yellow — primary energy (inspired by img 6)
  {
    id: "primary",
    name: "Primary",
    bg: "#403F4C",
    colorStart: "#E84855",
    colorEnd: "#F9DC5C",
  },

  // Steel teal to sage green (inspired by img 3)
  {
    id: "undergrowth",
    name: "Undergrowth",
    bg: "#433A3F",
    colorStart: "#3D5A6C",
    colorEnd: "#72A98F",
  },

  // Orchid purple to neon green — maximalist (inspired by img 8)
  {
    id: "static",
    name: "Static",
    bg: "#464F51",
    colorStart: "#D68FD6",
    colorEnd: "#35FF69",
  },

  // Cool gray to dusty rose (inspired by img 7)
  {
    id: "driftwood",
    name: "Driftwood",
    bg: "#604D53",
    colorStart: "#9DA3A4",
    colorEnd: "#D5C5C8",
  },

  // Khaki tan to sandy gold (inspired by img 2)
  {
    id: "shoreline",
    name: "Shoreline",
    bg: "#646E78",
    colorStart: "#C8AB83",
    colorEnd: "#EEC584",
  },

  // Warm cream bg — terracotta to rust (inspired by img, kept from before)
  {
    id: "gatefold",
    name: "Gatefold",
    bg: "#F5ECD7",
    colorStart: "#E8895A",
    colorEnd: "#8B3A0F",
  },

  // Near-white bg — pale arctic to deep navy
  {
    id: "glacial",
    name: "Glacial",
    bg: "#EDF2F4",
    colorStart: "#A8C8D8",
    colorEnd: "#2B4C7E",
  },

  // White bg — bright yellow to watermelon (inspired by img 9)
  {
    id: "daylight",
    name: "Daylight",
    bg: "#FFFFFF",
    colorStart: "#FFE74C",
    colorEnd: "#FF5964",
  },

];

export const DEFAULT_PALETTE_ID = "dusk";