import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const BG = "#5E5D5C";

const SONGS = [
  { track: 1,  name: "Mine",                  bpm: 121, duration: 230, key: "G",  accidental: "natural", mode: "major" },
  { track: 2,  name: "Sparks Fly",            bpm: 115, duration: 260, key: "F",  accidental: "natural", mode: "major" },
  { track: 3,  name: "Back to December",       bpm: 142, duration: 293, key: "D",  accidental: "natural", mode: "major" },
  { track: 4,  name: "Speak Now",              bpm: 119, duration: 240, key: "G",  accidental: "natural", mode: "major" },
  { track: 5,  name: "Dear John",              bpm: 119, duration: 403, key: "E",  accidental: "natural", mode: "major" },
  { track: 6,  name: "Mean",                   bpm: 164, duration: 237, key: "E",  accidental: "natural", mode: "major" },
  { track: 7,  name: "The Story of Us",        bpm: 140, duration: 266, key: "E",  accidental: "natural", mode: "major" },
  { track: 8,  name: "Never Grow Up",          bpm: 125, duration: 290, key: "D",  accidental: "natural", mode: "major" },
  { track: 9,  name: "Enchanted",              bpm: 82,  duration: 352, key: "G",  accidental: "sharp",   mode: "major" },
  { track: 10, name: "Better Than Revenge",    bpm: 146, duration: 217, key: "B",  accidental: "natural", mode: "minor" },
  { track: 11, name: "Innocent",               bpm: 134, duration: 302, key: "C",  accidental: "sharp",   mode: "minor" },
  { track: 12, name: "Haunted",                bpm: 162, duration: 242, key: "F",  accidental: "natural", mode: "major" },
  { track: 13, name: "Last Kiss",              bpm: 84,  duration: 367, key: "A",  accidental: "sharp",   mode: "major" },
  { track: 14, name: "Long Live",              bpm: 204, duration: 317, key: "G",  accidental: "natural", mode: "major" },
];

// Color ramp: C=dark plum → B=light teal, across 12 chromatic steps
const NOTE_ORDER = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const COLOR_START = "#BCBD8B";
const COLOR_END   = "#EFF1ED";
const colorRamp = d3.scaleSequential()
  .domain([0, 11])
  .interpolator(d3.interpolateHcl(COLOR_START, COLOR_END));

function keyColor(key) {
  const idx = NOTE_ORDER.indexOf(key);
  return idx >= 0 ? colorRamp(idx) : "#999";
}

// ── PETALS ───────────────────────────────────────────────────────────────────
const NATURAL_PETALS = [
  "M2656.22,851.482C2656.22,851.482 2655.57,723.528 2660.49,675.733C2664.37,637.983 2673.61,592.519 2685.72,564.716C2699.69,532.667 2726.28,496.039 2755.61,483.233C2792.26,467.229 2865.69,463.276 2888.51,535.743C2911.32,608.211 2922.14,813.247 2922.14,813.247C2922.14,813.247 2926.23,952.158 2921.74,993.683C2917.26,1035.21 2886.25,1079.87 2852.65,1096.86C2816.16,1115.32 2737.98,1107.57 2737.98,1107.57C2737.98,1107.57 2691.04,1024.63 2677.39,981.236C2663.31,936.444 2656.22,851.482 2656.22,851.482Z",
  "M2225.66,824.018C2225.95,793.493 2227.51,664.498 2230.43,632.968C2233.35,601.437 2251.63,542.006 2258.25,522.957C2264.86,503.907 2282.27,486.883 2303.95,476.264C2325.63,465.646 2406.68,481.342 2406.68,481.342C2406.68,481.342 2453.62,519.887 2465.4,550.534C2477.18,581.181 2493.61,809.682 2493.61,809.682C2493.61,809.682 2488.32,947.039 2477.12,1000.43C2465.92,1053.83 2422.11,1075.19 2406.88,1088.14C2391.65,1101.09 2319.1,1100.94 2291.23,1095.01C2263.36,1089.09 2224.72,924.31 2225.66,824.018Z",
  "M1834.23,944.668C1831.66,896.167 1828.23,715.558 1829.36,674.717C1830.5,633.875 1862.65,525.015 1862.65,525.015C1862.65,525.015 1933.92,482.533 1954.23,479.568C1974.55,476.602 2024.17,515.376 2036.47,555.15C2048.77,594.924 2068.78,699.391 2068.78,699.391L2077.84,848.02C2077.84,848.02 2056.56,1005.55 2040.17,1040.93C2023.79,1076.3 1954.66,1092 1927.86,1095.54C1901.05,1099.08 1837.96,1015.14 1834.23,944.668Z",
  "M1445.12,788.529C1446.87,719.126 1468.97,621.33 1483.28,583.14C1497.58,544.95 1552.96,494.879 1552.96,494.879C1552.96,494.879 1592.4,484.979 1604.15,480.055C1615.9,475.132 1661.87,501.436 1673.06,506.29C1684.25,511.143 1709.36,606.741 1709.36,606.741C1709.36,606.741 1726.95,682.71 1729.12,733.622C1731.29,784.534 1706.45,965.285 1701.97,1004.26C1697.48,1043.23 1661.19,1056.79 1650.67,1067.65C1640.15,1078.5 1553.83,1082.64 1519.09,1075.06C1484.35,1067.48 1451.33,966.009 1443.96,928.186C1436.58,890.363 1443.38,857.932 1445.12,788.529Z",
  "M1482.24,1309.32C1482.24,1309.32 1477.04,1234.29 1480.82,1159.85C1484.6,1085.42 1499.21,930.593 1499.21,930.593C1499.21,930.593 1530.09,803.009 1546.32,773.513C1562.56,744.016 1618.77,699.294 1657.87,686.708C1696.97,674.123 1732.36,690.048 1751.23,701.82C1768.27,712.455 1823.41,785.761 1823.41,785.761C1823.41,785.761 1834.63,866.496 1834.8,938.322C1834.97,1010.15 1829.7,1265.62 1828.75,1313.96C1827.8,1362.3 1768.96,1522.79 1748.65,1539.77C1728.33,1556.75 1587.84,1564.2 1587.84,1564.2C1587.84,1564.2 1517.02,1476.21 1505.74,1443.45C1494.46,1410.69 1482.24,1309.32 1482.24,1309.32Z",
];
const SHARP_PETALS = [
  "M3381.11,451.341L3353.93,538.219L3274.46,921.863L3329.72,922.873L3553.67,908.739L3462.55,679.116L3381.11,451.341Z",
  "M2931.38,463.985L2867.34,698.31L2785.89,947.955L3099.81,935.523L3044.54,799.147L2931.38,463.985Z",
  "M2493.27,446.278L2431.36,653.73L2354.42,937.155L2525.98,940.295L2656.18,937.532L2585,748.163L2493.27,446.278Z",
  "M2041.66,405.242L1974.33,701.323L1928.84,942.178L1952.52,951.597L2223.21,942.43L2164.06,768.255L2041.66,405.242Z",
  "M1645.56,461.642L1581.78,684.305L1480.19,956.358L1778.37,964.577L1812.38,962.039L1693.04,614.988L1645.56,461.642Z",
];
const FLAT_PETALS = [
  "M2575.18,529.718L2574.1,632.027L2575.15,841.69L2567.82,932.714L2744.45,928.536L2725.9,699.664L2732.11,532.056L2575.18,529.718Z",
  "M2301.18,538.999L2294.88,568.147L2294.63,695.853L2297.08,931.921L2369.41,932.795L2465,932.854L2456.31,698.346L2467.57,540.055L2301.18,538.999Z",
  "M2028.1,535.266L2027.02,782.495L2035.85,950.293L2101.02,952.916L2200.2,953.815L2186.98,785.116L2187.03,599.687L2180.84,536.719L2073.59,539.238L2028.1,535.266Z",
  "M1749.54,742.902L1734.54,539.689L1838.58,546.459L1921.36,542.036L1937.76,810.567L1937.85,964.555L1750.22,974.122L1749.54,742.902Z",
  "M1444.68,965.083L1439.16,613.62L1439.16,539.416L1573.02,533.939L1603.22,533.585L1618.45,823.238L1636.79,966.867L1444.68,965.083Z",
];
const MAJOR_PATH = "M1752.41,823.835C1778.88,815.378 1838.08,820.581 1854.46,835.198C1870.85,849.815 1884.66,878.837 1888.04,898.179C1891.43,917.521 1889.12,947.925 1878.99,971.554C1868.86,995.183 1798.65,1014.89 1776.67,1016.65C1754.69,1018.42 1702.4,972.718 1692.37,937.818C1682.33,902.917 1706.98,838.346 1752.41,823.835Z";
const MINOR_PATH = "M86.52,58.46L9.39,175.77L139.98,167.89L213.02,169.91L219.51,165.77L115.08,3.92Z";

function parseBBox(d) {
  const nums = d.match(/[-+]?\d*\.?\d+/g).map(Number);
  const xs = [], ys = [];
  for (let i = 0; i < nums.length - 1; i += 2) { xs.push(nums[i]); ys.push(nums[i+1]); }
  return {
    cx: (Math.min(...xs)+Math.max(...xs))/2, cy: (Math.min(...ys)+Math.max(...ys))/2,
    w: Math.max(...xs)-Math.min(...xs), h: Math.max(...ys)-Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function seededRand(seed) {
  let s = Math.max(1, Math.round(Math.abs(seed)) % 2147483647);
  return () => { s = (s*16807)%2147483647; return (s-1)/2147483646; };
}

function Flower({ song, size, color, globalRotation }) {
  const { bpm, accidental, mode, track } = song;
  const petalCount = Math.max(3, Math.round(bpm / 15));
  const cx = size/2, cy = size/2;
  const cutR = size * 0.09;
  const centerR = accidental === "natural" ? size*0.09 : size*0.14;
  const armLength = size * 0.42;
  const library = accidental === "sharp" ? SHARP_PETALS : accidental === "flat" ? FLAT_PETALS : NATURAL_PETALS;
  const rawW = Math.sqrt(9 / petalCount);
  const widthScale = accidental === "sharp" && petalCount <= 5 ? Math.min(rawW, 1.15) : rawW;
  const rand = seededRand(track * 137 + petalCount * 31);
  const cutoutD = mode === "major" ? MAJOR_PATH : MINOR_PATH;
  const cbb = parseBBox(cutoutD);
  const cutScale = (cutR*2) / Math.max(cbb.w, cbb.h);
  const cutRotation = Math.round(rand() * 360);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow:"visible" }}>
      <g transform={`rotate(${globalRotation},${cx},${cy})`}>
        {Array.from({ length: petalCount }).map((_, i) => {
          const d = library[i % library.length];
          const bb = parseBBox(d);
          const scaleY = armLength / bb.h;
          const scaleX = scaleY * widthScale;
          const jitterRange = accidental === "sharp" && petalCount <= 5 ? 6 : 12;
          const jitter = (rand()-0.5) * jitterRange;
          const angleDeg = (i/petalCount)*360 + jitter;
          const baseY = accidental === "sharp" ? bb.maxY + bb.h*0.06 : bb.maxY;
          return (
            <g key={i} transform={`translate(${cx},${cy}) rotate(${angleDeg}) scale(${scaleX},${scaleY}) translate(${-bb.cx},${-baseY})`}>
              <path d={d} fill={color} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={centerR} fill={color} />
        <g transform={`translate(${cx},${cy}) rotate(${cutRotation}) scale(${cutScale}) translate(${-cbb.cx},${-cbb.cy})`}>
          <path d={cutoutD} fill={BG} />
        </g>
      </g>
    </svg>
  );
}

function computeLayout(songs, W, H) {
  const minDur = Math.min(...songs.map(s => s.duration));
  const maxDur = Math.max(...songs.map(s => s.duration));
  const sizeScale = d3.scalePow().exponent(0.45).domain([minDur, maxDur]).range([36, 130]);

  const rand = seededRand(99);

  // Spiral initial positions — breaks grid memory completely
  const nodes = songs.map((song, i) => {
    const r = sizeScale(song.duration);
    const angle = i * 2.4; // golden angle in radians
    const radius = 60 + i * 18;
    return {
      ...song,
      r,
      x: W/2 + Math.cos(angle) * radius * 0.6 + (rand()-0.5) * 20,
      y: H/2 + Math.sin(angle) * radius * 0.7 + (rand()-0.5) * 20,
      globalRotation: Math.round(rand()*360),
    };
  });

  d3.forceSimulation(nodes)
    .force("collide", d3.forceCollide(d => d.r * 0.80).strength(1.0).iterations(6))
    .force("x", d3.forceX(W/2).strength(0.04))
    .force("y", d3.forceY(H/2).strength(0.04))
    .force("center", d3.forceCenter(W/2, H/2).strength(0.08))
    .stop()
    .tick(800);

  return nodes;
}

export default function App() {
  const [nodes, setNodes] = useState([]);
  // Fixed square-ish canvas — slightly tall
  const W = 540, H = 580;

  useEffect(() => { setNodes(computeLayout(SONGS, W, H)); }, []);

  // Clamp viewBox to a fixed square-ish frame with padding
  const pad = 16;
  const allX = nodes.map(n => [n.x - n.r, n.x + n.r]).flat();
  const allY = nodes.map(n => [n.y - n.r, n.y + n.r]).flat();
  const minX = allX.length ? Math.min(...allX) : 0;
  const maxX = allX.length ? Math.max(...allX) : W;
  const minY = allY.length ? Math.min(...allY) : 0;
  const maxY = allY.length ? Math.max(...allY) : H;
  const vbW = maxX - minX + pad*2;
  const vbH = maxY - minY + pad*2;
  // Force display into a square-ish shape regardless of content spread
  const displaySize = Math.min(560, 560);
  const displayH = displaySize * 1.0; // square

  return (
    <div style={{ background: BG, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:16 }}>
      <svg width={displaySize} height={displayH} viewBox={`${minX-pad} ${minY-pad} ${vbW} ${vbH}`} style={{ display:"block" }}>
        <rect x={minX-pad} y={minY-pad} width={vbW} height={vbH} fill={BG} />
        {nodes.map(node => (
          <g key={node.track}
             transform={`translate(${node.x - node.r}, ${node.y - node.r})`}
             opacity={0.88}>
            <Flower song={node} size={node.r*2} color={keyColor(node.key)} globalRotation={node.globalRotation} />
          </g>
        ))}
      </svg>
    </div>
  );
}
