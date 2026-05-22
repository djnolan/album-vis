import { X } from 'lucide-react';
import { PALETTES } from '../data/palettes';
import { NATURAL_PETALS, SHARP_PETALS, FLAT_PETALS, MAJOR_PATH, MINOR_PATH } from '../data/petalPaths';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';
import { useIsDesktop } from '../hooks/useIsDesktop';

function parseBBox(d) {
  const nums = d.match(/[-+]?\d*\.?\d+/g).map(Number);
  const xs = [], ys = [];
  for (let i = 0; i < nums.length - 1; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

// tip_x = px + (targetH/2)*sin(rot),  tip_y = py - (targetH/2)*cos(rot)
// Positioning/rotation from previous step; sizes from latest step (large≈78-82, medium≈62, small≈48).
// Center holes (MAJOR/MINOR) stay near middle (py≈10-28), slightly cropped.
const SHAPE_CONFIGS = [
  // round from top + sharp from bottom
  [
    { d: NATURAL_PETALS[0], col: 'start', px: 30, py: 35, targetH: 80, rot: -12 },
    { d: SHARP_PETALS[0],   col: 'end',   px: 62, py:  6, targetH: 48, rot: 165 },
  ],
  // round from bottom + round from top
  [
    { d: NATURAL_PETALS[1], col: 'end',   px: 33, py:  5, targetH: 50, rot: 196 },
    { d: NATURAL_PETALS[2], col: 'start', px: 63, py: 41, targetH: 78, rot: -20 },
  ],
  // flat from top + major oval near middle
  [
    { d: FLAT_PETALS[0],    col: 'start', px: 28, py: 36, targetH: 76, rot:  18 },
    { d: MAJOR_PATH,        col: 'end',   px: 64, py: 10, targetH: 30, rot:  25 },
  ],
  // sharp from top + round from bottom
  [
    { d: SHARP_PETALS[1],   col: 'end',   px: 30, py: 42, targetH: 48, rot:  22 },
    { d: NATURAL_PETALS[3], col: 'start', px: 64, py: -7, targetH: 80, rot: 183 },
  ],
  // round from top + flat from bottom
  [
    { d: NATURAL_PETALS[4], col: 'start', px: 25, py: 37, targetH: 82, rot: -22 },
    { d: FLAT_PETALS[1],    col: 'end',   px: 65, py:  4, targetH: 50, rot: 178 },
  ],
  // sharp from bottom + flat from top
  [
    { d: SHARP_PETALS[2],   col: 'end',   px: 28, py: 11, targetH: 60, rot: 200 },
    { d: FLAT_PETALS[2],    col: 'start', px: 62, py: 43, targetH: 78, rot: -15 },
  ],
  // sharp from top + round from bottom
  [
    { d: SHARP_PETALS[3],   col: 'start', px: 35, py: 34, targetH: 48, rot: -18 },
    { d: NATURAL_PETALS[0], col: 'end',   px: 65, py: -1, targetH: 78, rot: 172 },
  ],
  // sharp from top + round from bottom
  [
    { d: SHARP_PETALS[4],   col: 'start', px: 32, py: 45, targetH: 80, rot:  -8 },
    { d: NATURAL_PETALS[1], col: 'end',   px: 62, py:-10, targetH: 50, rot: 193 },
  ],
  // flat from top + minor triangle near middle
  [
    { d: FLAT_PETALS[3],    col: 'start', px: 28, py: 32, targetH: 64, rot: -10 },
    { d: MINOR_PATH,        col: 'end',   px: 66, py: 28, targetH: 28, rot:  35 },
  ],
  // round from bottom + major oval near middle
  [
    { d: NATURAL_PETALS[2], col: 'end',   px: 30, py:  2, targetH: 80, rot: 185 },
    { d: MAJOR_PATH,        col: 'start', px: 66, py: 28, targetH: 30, rot: -20 },
  ],
  // round from top + sharp from bottom
  [
    { d: NATURAL_PETALS[3], col: 'start', px: 32, py: 39, targetH: 78, rot: -24 },
    { d: SHARP_PETALS[2],   col: 'end',   px: 63, py: 13, targetH: 48, rot: 170 },
  ],
  // minor triangle near middle + flat from bottom
  [
    { d: MINOR_PATH,        col: 'end',   px: 30, py: 10, targetH: 28, rot: -15 },
    { d: FLAT_PETALS[4],    col: 'start', px: 65, py:  0, targetH: 76, rot: 205 },
  ],
];

function PaletteThumbnail({ palette, active, onClick, index }) {
  const cfg = SHAPE_CONFIGS[index % SHAPE_CONFIGS.length];

  return (
    <button onClick={onClick} className="flex flex-col gap-2 w-full items-center">
      <div
        className="w-full"
        style={{
          aspectRatio: '5 / 2',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: active
            ? '0 0 0 1px #161B24, 0 0 0 2.5px #8B93A1'
            : '0 2px 8px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        <svg
          viewBox="0 0 100 40"
          width="100%"
          height="100%"
          style={{ display: 'block', background: palette.bg, overflow: 'hidden' }}
        >
          {cfg.map((shape, i) => {
            const bb = parseBBox(shape.d);
            const s = shape.targetH / bb.h;
            const color = shape.col === 'start' ? palette.colorStart : palette.colorEnd;
            return (
              <g
                key={i}
                transform={`translate(${shape.px},${shape.py}) rotate(${shape.rot}) scale(${s}) translate(${-bb.cx},${-bb.cy})`}
              >
                <path d={shape.d} fill={color} />
              </g>
            );
          })}
        </svg>
      </div>
      <p className="font-mono text-caption text-text-secondary text-center">
        {palette.name}
      </p>
    </button>
  );
}

function PaletteContent({ activePaletteId, onSelect, close }) {
  return (
    <>
      <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
        <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">Pick Your Palette</h2>
        <button
          onClick={close}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <X size={18} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 pt-2 pb-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {PALETTES.map((p, i) => (
            <PaletteThumbnail
              key={p.id}
              palette={p}
              active={p.id === activePaletteId}
              onClick={() => { onSelect(p.id); close(); }}
              index={i}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default function PaletteOverlay({ activePaletteId, onSelect, onClose, onClosingStart }) {
  useScrollLock(true);
  const isDesktop = useIsDesktop();
  const { close, backdropStyle, sheetStyle } = useSheetAnimation(onClose, isDesktop ? 'right' : 'up', onClosingStart);

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex pointer-events-none">
        <div
          className="relative ml-auto h-full bg-surface-1 flex flex-col rounded-tl-lg rounded-bl-lg pointer-events-auto"
          style={{
            width: '36%',
            minWidth: '320px',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
            ...sheetStyle,
          }}
        >
          <PaletteContent activePaletteId={activePaletteId} onSelect={onSelect} close={close} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75" style={backdropStyle} onClick={close} />
      <div
        className="relative bg-surface-1 rounded-t-lg flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 48px)', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', ...sheetStyle }}
      >
        <PaletteContent activePaletteId={activePaletteId} onSelect={onSelect} close={close} />
      </div>
    </div>
  );
}
