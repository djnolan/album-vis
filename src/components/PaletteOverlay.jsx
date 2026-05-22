import { X } from 'lucide-react';
import { PALETTES } from '../data/palettes';
import { MAJOR_PATH, MINOR_PATH } from '../data/petalPaths';
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

// Only MAJOR_PATH (oval) and MINOR_PATH (triangle apex-up at rot=0).
// Both shapes same size. Positions near centre; slight crop OK.
// MINOR rotation changes its pointing direction: 0=up, 90=right, 180=down, -90=left, ±45=diagonal.
const T = 34; // consistent targetH for all shapes
const SHAPE_CONFIGS = [
  // MINOR pointing up + MAJOR tilted
  [
    { d: MINOR_PATH, col: 'start', px: 32, py: 20, targetH: T, rot:   0 },
    { d: MAJOR_PATH, col: 'end',   px: 65, py: 20, targetH: T, rot:  25 },
  ],
  // MAJOR + MINOR pointing right
  [
    { d: MAJOR_PATH, col: 'end',   px: 30, py: 18, targetH: T, rot: -15 },
    { d: MINOR_PATH, col: 'start', px: 65, py: 22, targetH: T, rot:  90 },
  ],
  // MINOR pointing down + MINOR pointing up (mirrored pair)
  [
    { d: MINOR_PATH, col: 'start', px: 32, py: 22, targetH: T, rot: 180 },
    { d: MINOR_PATH, col: 'end',   px: 64, py: 18, targetH: T, rot:  12 },
  ],
  // MAJOR + MAJOR, different rotations
  [
    { d: MAJOR_PATH, col: 'end',   px: 33, py: 16, targetH: T, rot:  30 },
    { d: MAJOR_PATH, col: 'start', px: 65, py: 24, targetH: T, rot: -22 },
  ],
  // MINOR pointing left + MAJOR tilted
  [
    { d: MINOR_PATH, col: 'end',   px: 34, py: 20, targetH: T, rot: -90 },
    { d: MAJOR_PATH, col: 'start', px: 66, py: 20, targetH: T, rot:  40 },
  ],
  // MAJOR slightly cropped top + MINOR diagonal
  [
    { d: MAJOR_PATH, col: 'start', px: 30, py:  9, targetH: T, rot:  10 },
    { d: MINOR_PATH, col: 'end',   px: 65, py: 24, targetH: T, rot:  45 },
  ],
  // MINOR pointing down slightly cropped + MAJOR
  [
    { d: MINOR_PATH, col: 'end',   px: 32, py: 29, targetH: T, rot: 180 },
    { d: MAJOR_PATH, col: 'start', px: 66, py: 16, targetH: T, rot: -30 },
  ],
  // MAJOR + MINOR pointing left
  [
    { d: MAJOR_PATH, col: 'start', px: 30, py: 22, targetH: T, rot: -20 },
    { d: MINOR_PATH, col: 'end',   px: 66, py: 18, targetH: T, rot: -90 },
  ],
  // MINOR upper-left diagonal + MAJOR
  [
    { d: MINOR_PATH, col: 'end',   px: 30, py: 20, targetH: T, rot: -45 },
    { d: MAJOR_PATH, col: 'start', px: 65, py: 20, targetH: T, rot:  15 },
  ],
  // MAJOR slightly cropped bottom + MINOR pointing up
  [
    { d: MAJOR_PATH, col: 'end',   px: 33, py: 30, targetH: T, rot:  18 },
    { d: MINOR_PATH, col: 'start', px: 64, py: 18, targetH: T, rot: -18 },
  ],
  // MINOR upper-right + MINOR upper-left (crossing diagonals)
  [
    { d: MINOR_PATH, col: 'start', px: 32, py: 20, targetH: T, rot:  45 },
    { d: MINOR_PATH, col: 'end',   px: 65, py: 20, targetH: T, rot: -45 },
  ],
  // MAJOR + MINOR pointing lower-left
  [
    { d: MAJOR_PATH, col: 'end',   px: 30, py: 20, targetH: T, rot: -12 },
    { d: MINOR_PATH, col: 'start', px: 66, py: 20, targetH: T, rot: 210 },
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
