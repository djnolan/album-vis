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
// Directions: top(rot≈0), bottom(rot≈180), left(rot≈-90), right(rot≈90), diagonals.
// Size varies: small≈48, medium≈62, large≈78-82.
// Center holes (MAJOR/MINOR) stay near middle (py≈12-28), slightly cropped.
const SHAPE_CONFIGS = [
  // large round from left (tip x≈4) + small sharp from bottom (tip y≈35)
  [
    { d: NATURAL_PETALS[0], col: 'start', px: 44, py: 22, targetH: 80, rot:  -88 },
    { d: SHARP_PETALS[0],   col: 'end',   px: 62, py: 12, targetH: 48, rot:  165 },
  ],
  // small round from top (tip y≈5) + large round from right (tip x≈93)
  [
    { d: NATURAL_PETALS[1], col: 'end',   px: 32, py: 29, targetH: 50, rot:  -20 },
    { d: NATURAL_PETALS[2], col: 'start', px: 54, py: 18, targetH: 78, rot:   88 },
  ],
  // large flat from upper-left diagonal (tip x≈5, y≈5) + small major oval near middle
  [
    { d: FLAT_PETALS[0],    col: 'start', px: 34, py: 29, targetH: 76, rot:  -50 },
    { d: MAJOR_PATH,        col: 'end',   px: 64, py: 28, targetH: 30, rot:   20 },
  ],
  // small sharp from right (tip x≈92) + large round from lower-left (tip x≈10, y≈36)
  [
    { d: SHARP_PETALS[1],   col: 'end',   px: 68, py: 28, targetH: 48, rot:   95 },
    { d: NATURAL_PETALS[3], col: 'start', px: 24, py:  -2, targetH: 80, rot: 200 },
  ],
  // large round from top (tip y≈5) + small flat from right (tip x≈93)
  [
    { d: NATURAL_PETALS[4], col: 'start', px: 35, py: 42, targetH: 82, rot:  -25 },
    { d: FLAT_PETALS[1],    col: 'end',   px: 68, py: 28, targetH: 50, rot:   78 },
  ],
  // medium sharp from bottom (tip y≈34) + large flat from upper-right diagonal (tip x≈90, y≈5)
  [
    { d: SHARP_PETALS[2],   col: 'end',   px: 32, py:  5, targetH: 60, rot:  195 },
    { d: FLAT_PETALS[2],    col: 'start', px: 58, py: 27, targetH: 78, rot:   55 },
  ],
  // small sharp from top (tip y≈8) + large round from lower-right diagonal (tip x≈88, y≈35)
  [
    { d: SHARP_PETALS[3],   col: 'start', px: 28, py: 31, targetH: 48, rot:   15 },
    { d: NATURAL_PETALS[0], col: 'end',   px: 58, py: 10, targetH: 78, rot:  130 },
  ],
  // large sharp from left (tip x≈5, y≈25) + small round from bottom (tip y≈38)
  [
    { d: SHARP_PETALS[4],   col: 'start', px: 44, py: 18, targetH: 80, rot: -100 },
    { d: NATURAL_PETALS[1], col: 'end',   px: 64, py: 13, targetH: 50, rot:  175 },
  ],
  // medium flat from upper-right (tip x≈90, y≈8) + small minor triangle near middle
  [
    { d: FLAT_PETALS[3],    col: 'start', px: 67, py: 31, targetH: 64, rot:   40 },
    { d: MINOR_PATH,        col: 'end',   px: 30, py: 12, targetH: 28, rot:  -20 },
  ],
  // large round from bottom (tip y≈34) + small major oval near middle
  [
    { d: NATURAL_PETALS[2], col: 'end',   px: 35, py:  -6, targetH: 80, rot: 185 },
    { d: MAJOR_PATH,        col: 'start', px: 66, py: 22, targetH: 30, rot:  -15 },
  ],
  // large round from left (tip x≈4) + small sharp from upper-right (tip x≈86, y≈8)
  [
    { d: NATURAL_PETALS[3], col: 'start', px: 43, py: 25, targetH: 78, rot:  -82 },
    { d: SHARP_PETALS[2],   col: 'end',   px: 68, py: 24, targetH: 48, rot:   48 },
  ],
  // small minor triangle near middle + large flat from lower-left diagonal (tip x≈6, y≈35)
  [
    { d: MINOR_PATH,        col: 'end',   px: 42, py: 25, targetH: 28, rot:   25 },
    { d: FLAT_PETALS[4],    col: 'start', px: 30, py:  6, targetH: 76, rot:  220 },
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
