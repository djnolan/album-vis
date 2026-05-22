import { X } from 'lucide-react';
import { PALETTES } from '../data/palettes';
import { NATURAL_PETALS, SHARP_PETALS, FLAT_PETALS, MAJOR_PATH } from '../data/petalPaths';
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

// Each pair: two shapes in a 100×40 viewBox. Tips peek in from top or bottom edges.
// "From top" (natural orientation): py = targetH/2 + tip_offset, tip appears near top edge.
// "From bottom" (flipped ~180°): py = tip_y - targetH/2, tip appears near bottom edge.
// px varied across configs for compositional diversity.
const SHAPE_CONFIGS = [
  // round from top-left + sharp from bottom-right
  [
    { d: NATURAL_PETALS[0], col: 'start', px: 24, py: 36, targetH: 64, rot:  -8 },
    { d: SHARP_PETALS[0],   col: 'end',   px: 74, py: 10, targetH: 52, rot: 183 },
  ],
  // round from bottom-left + round from top-right
  [
    { d: NATURAL_PETALS[1], col: 'end',   px: 32, py:  4, targetH: 66, rot: 192 },
    { d: NATURAL_PETALS[2], col: 'start', px: 70, py: 35, targetH: 62, rot: -12 },
  ],
  // flat from top-right + oval arc from bottom-left
  [
    { d: FLAT_PETALS[0],    col: 'start', px: 68, py: 34, targetH: 60, rot:  -6 },
    { d: MAJOR_PATH,        col: 'end',   px: 22, py: 44, targetH: 28, rot:  20 },
  ],
  // sharp from top-left + round from bottom-right
  [
    { d: SHARP_PETALS[1],   col: 'end',   px: 22, py: 31, targetH: 54, rot:  10 },
    { d: NATURAL_PETALS[3], col: 'start', px: 73, py:  6, targetH: 65, rot: 188 },
  ],
  // round from top-far-left + flat from bottom-far-right
  [
    { d: NATURAL_PETALS[4], col: 'start', px: 18, py: 37, targetH: 66, rot: -14 },
    { d: FLAT_PETALS[1],    col: 'end',   px: 80, py:  6, targetH: 60, rot: 175 },
  ],
  // sharp from bottom-left + flat from top-right
  [
    { d: SHARP_PETALS[2],   col: 'end',   px: 20, py: 11, targetH: 50, rot: 172 },
    { d: FLAT_PETALS[2],    col: 'start', px: 75, py: 35, targetH: 62, rot:  -9 },
  ],
  // sharp from top-left + round from bottom-far-right
  [
    { d: SHARP_PETALS[3],   col: 'start', px: 30, py: 30, targetH: 52, rot:   7 },
    { d: NATURAL_PETALS[0], col: 'end',   px: 76, py:  5, targetH: 62, rot: 176 },
  ],
  // sharp from top-right + round from bottom-left
  [
    { d: SHARP_PETALS[4],   col: 'start', px: 72, py: 31, targetH: 54, rot:  -5 },
    { d: NATURAL_PETALS[1], col: 'end',   px: 24, py:  6, targetH: 64, rot: 190 },
  ],
  // flat from top-center-left + sharp from bottom-right
  [
    { d: FLAT_PETALS[3],    col: 'start', px: 35, py: 33, targetH: 58, rot:  -6 },
    { d: SHARP_PETALS[0],   col: 'end',   px: 72, py: 12, targetH: 50, rot: 168 },
  ],
  // round from bottom-left + oval arc from top-right
  [
    { d: NATURAL_PETALS[2], col: 'end',   px: 33, py:  5, targetH: 64, rot: 185 },
    { d: MAJOR_PATH,        col: 'start', px: 76, py: -3, targetH: 28, rot: -10 },
  ],
  // round from top-left + sharp from bottom-right
  [
    { d: NATURAL_PETALS[3], col: 'start', px: 26, py: 36, targetH: 63, rot: -16 },
    { d: SHARP_PETALS[2],   col: 'end',   px: 73, py: 10, targetH: 50, rot: 172 },
  ],
  // flat from bottom-right + round from top-left
  [
    { d: FLAT_PETALS[4],    col: 'end',   px: 72, py:  7, targetH: 60, rot: 187 },
    { d: NATURAL_PETALS[4], col: 'start', px: 30, py: 37, targetH: 67, rot:  -8 },
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
