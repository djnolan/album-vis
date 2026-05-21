import { X } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { noOrphan } from '../utils/typography';
import { NATURAL_PETALS, SHARP_PETALS, FLAT_PETALS, MAJOR_PATH, MINOR_PATH } from '../data/petalPaths';

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseBBox(d) {
  const nums = d.match(/[-+]?\d*\.?\d+/g).map(Number);
  const xs = [], ys = [];
  for (let i = 0; i < nums.length - 1; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function seededRand(seed) {
  let s = Math.max(1, Math.round(Math.abs(seed)) % 2147483647);
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ── Color utilities ───────────────────────────────────────────────────────────
function hexToRgb(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

function luminance(hex) {
  try {
    const [r, g, b] = hexToRgb(hex).map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  } catch { return 0; }
}

function lerpColor(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function resolveFlowerColor(colorStart, colorEnd) {
  if (!colorStart || !colorEnd) return "#F0F2F5";
  try {
    const mid = lerpColor(colorStart, colorEnd, 0.5);
    return luminance(colorEnd) > 0.08 ? mid : "#F0F2F5";
  } catch { return "#F0F2F5"; }
}

function buildNoteColors(colorStart, colorEnd) {
  const NOTE_TO_T = { C: 0 / 11, D: 2 / 11, E: 4 / 11, F: 5 / 11, G: 7 / 11, A: 9 / 11, B: 11 / 11 };
  return ["C", "D", "E", "F", "G", "A", "B"].map(note => lerpColor(colorStart, colorEnd, NOTE_TO_T[note]));
}

// ── MiniFlower ────────────────────────────────────────────────────────────────
function MiniFlower({ size = 48, petalCount = 6, accidental = "natural", mode = "major", color = "#7B9FD4", bgColor = "#161B24", seed = 1, globalRotation = 0 }) {
  const cx = size / 2, cy = size / 2;
  const cutR = size * 0.09;
  const centerR = accidental === "natural" ? size * 0.09 : size * 0.14;
  const armLength = size * 0.42;
  const library = accidental === "sharp" ? SHARP_PETALS : accidental === "flat" ? FLAT_PETALS : NATURAL_PETALS;
  const rawW = Math.sqrt(9 / petalCount);
  const widthScale = accidental === "sharp" && petalCount <= 5 ? Math.min(rawW, 1.15) : rawW;
  const rand = seededRand(seed);
  const cutoutD = mode === "major" ? MAJOR_PATH : MINOR_PATH;
  const cbb = parseBBox(cutoutD);
  const cutScale = (cutR * 2) / Math.max(cbb.w, cbb.h);
  const cutRotation = Math.round(rand() * 360);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible", display: "block" }}>
      <g transform={`rotate(${globalRotation},${cx},${cy})`}>
        {Array.from({ length: petalCount }).map((_, i) => {
          const d = library[i % library.length];
          const bb = parseBBox(d);
          const scaleY = armLength / bb.h;
          const scaleX = scaleY * widthScale;
          const jitterRange = accidental === "sharp" && petalCount <= 5 ? 6 : 12;
          const jitter = (rand() - 0.5) * jitterRange;
          const angleDeg = (i / petalCount) * 360 + jitter;
          const baseY = accidental === "sharp" ? bb.maxY + bb.h * 0.06 : bb.maxY;
          return (
            <g key={i} transform={`translate(${cx},${cy}) rotate(${angleDeg}) scale(${scaleX},${scaleY}) translate(${-bb.cx},${-baseY})`}>
              <path d={d} fill={color} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={centerR} fill={color} />
        <g transform={`translate(${cx},${cy}) rotate(${cutRotation}) scale(${cutScale}) translate(${-cbb.cx},${-cbb.cy})`}>
          <path d={cutoutD} fill={bgColor} />
        </g>
      </g>
    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
const SHEET_BG = "#161B24";
const mono = "'DM Mono','Courier New',monospace";
const sans = "'DM Sans',system-ui,sans-serif";
const NATURAL_NOTES = ["C", "D", "E", "F", "G", "A", "B"];

function Divider({ label }) {
  return (
    <div style={{ padding: "0 24px" }}>
      {label ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
          <div style={{ height: 1, background: "#2A3140", flex: 1 }} />
          <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#525A68", flexShrink: 0 }}>{label}</span>
          <div style={{ height: 1, background: "#2A3140", flex: 1 }} />
        </div>
      ) : (
        <div style={{ height: 1, background: "#2A3140" }} />
      )}
    </div>
  );
}

function ItemLabel({ title, description }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B93A1" }}>{title}</div>
      <div style={{ fontFamily: sans, fontSize: 15, color: "#525A68", lineHeight: 1.45, marginTop: 3 }}>{noOrphan(description)}</div>
    </div>
  );
}

function LegendContent({ close, flowerColor, noteColors, bgColor }) {
  return (
    <>
      <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
        <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">Each flower represents a song</h2>
        <button
          onClick={close}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pb-10">

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 24px 16px" }}>
            <ItemLabel
              title="Size = duration"
              description="The size of the flower is based on the song’s length."
            />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
              {[{ s: 26, seed: 3 }, { s: 42, seed: 7 }, { s: 60, seed: 11 }].map(({ s, seed }) => (
                <div key={s}>
                  <MiniFlower size={s} petalCount={6} accidental="natural" mode="major" color={flowerColor} bgColor={SHEET_BG} seed={seed} globalRotation={20} />
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ padding: "16px 24px" }}>
            <ItemLabel
              title="Petals = tempo"
              description="The number of petals reflects the song’s beats per minute."
            />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
              {[{ p: 4, seed: 5 }, { p: 7, seed: 9 }, { p: 11, seed: 13 }].map(({ p, seed }) => (
                <div key={p}>
                  <MiniFlower size={46} petalCount={p} accidental="natural" mode="major" color={flowerColor} bgColor={SHEET_BG} seed={seed} globalRotation={0} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider label="Key Signature" />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 24px" }}>
            <ItemLabel
              title="Color = base note"
              description="The color of the flower shows the root note of the song’s key."
            />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
              {NATURAL_NOTES.map((note, i) => (
                <div key={note} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <MiniFlower size={36} petalCount={6} accidental="natural" mode="major" color={noteColors[i]} bgColor={SHEET_BG} seed={i * 3 + 1} globalRotation={i * 17} />
                  <span style={{ fontFamily: mono, fontSize: 10, color: "#8B93A1", fontWeight: 500 }}>{note}</span>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ padding: "16px 24px" }}>
            <ItemLabel
              title="Shape = note change"
              description="The shape of the petals shows whether the key is natural, sharp, or flat."
            />
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              {[{ a: "natural", l: "natural", seed: 2 }, { a: "sharp", l: "sharp", seed: 6 }, { a: "flat", l: "flat", seed: 10 }].map(({ a, l, seed }) => (
                <div key={a} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <MiniFlower size={50} petalCount={6} accidental={a} mode="major" color={flowerColor} bgColor={SHEET_BG} seed={seed} globalRotation={15} />
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#F0F2F5", fontWeight: 500 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ padding: "16px 24px 28px" }}>
            <ItemLabel
              title="Center shape = key type"
              description="The center cutout shows whether the song is in a major or minor key."
            />
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              {[{ m: "major", l: "major", seed: 4 }, { m: "minor", l: "minor", seed: 8 }].map(({ m, l, seed }) => (
                <div key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <MiniFlower size={58} petalCount={6} accidental="natural" mode={m} color={flowerColor} bgColor={SHEET_BG} seed={seed} globalRotation={10} />
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#F0F2F5", fontWeight: 500 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── LegendOverlay ─────────────────────────────────────────────────────────────
export default function LegendOverlay({ onClose, colorStart, colorEnd, bgColor = SHEET_BG, onClosingStart }) {
  useScrollLock(true);
  const isDesktop = useIsDesktop();
  const { close, backdropStyle, sheetStyle } = useSheetAnimation(onClose, isDesktop ? 'right' : 'up', onClosingStart);

  const flowerColor = resolveFlowerColor(colorStart, colorEnd);
  const noteColors = buildNoteColors(colorStart, colorEnd);

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex pointer-events-none">
        <div
          className="relative ml-auto h-full bg-surface-1 flex flex-col rounded-tl-lg rounded-bl-lg pointer-events-auto"
          style={{ width: '36%', minWidth: '320px', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', ...sheetStyle }}
        >
          <LegendContent close={close} flowerColor={flowerColor} noteColors={noteColors} bgColor={bgColor} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75" style={backdropStyle} onClick={close} />
      <div className="relative bg-surface-1 rounded-t-lg flex flex-col" style={{ maxHeight: 'calc(100dvh - 48px)', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', ...sheetStyle }}>
        <LegendContent close={close} flowerColor={flowerColor} noteColors={noteColors} bgColor={bgColor} />
      </div>
    </div>
  );
}
