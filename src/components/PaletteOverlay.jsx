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

// Each pair: two shapes placed large in a 100×40 viewBox, clipped at edges.
// px/py: center position in viewBox units. targetH: desired height in viewBox units (>40 = overflow).
// rot: tilt in degrees. col: which palette color.
const SHAPE_CONFIGS = [
  // round + sharp triangle
  [
    { d: NATURAL_PETALS[0], col: 'start', px: 28, py: 20, targetH: 78, rot: -8  },
    { d: SHARP_PETALS[0],   col: 'end',   px: 70, py: 20, targetH: 65, rot: 12  },
  ],
  // round + round
  [
    { d: NATURAL_PETALS[1], col: 'end',   px: 30, py: 20, targetH: 80, rot:  6  },
    { d: NATURAL_PETALS[2], col: 'start', px: 72, py: 20, targetH: 76, rot: -10 },
  ],
  // flat slab + oval center
  [
    { d: FLAT_PETALS[0],    col: 'start', px: 28, py: 20, targetH: 72, rot: -6  },
    { d: MAJOR_PATH,        col: 'end',   px: 73, py: 20, targetH: 42, rot: 15  },
  ],
  // sharp + round
  [
    { d: SHARP_PETALS[1],   col: 'end',   px: 27, py: 20, targetH: 65, rot: 10  },
    { d: NATURAL_PETALS[3], col: 'start', px: 71, py: 20, targetH: 78, rot: -7  },
  ],
  // round + flat slab
  [
    { d: NATURAL_PETALS[4], col: 'start', px: 30, py: 20, targetH: 82, rot: -12 },
    { d: FLAT_PETALS[1],    col: 'end',   px: 73, py: 20, targetH: 72, rot:  8  },
  ],
  // sharp + flat
  [
    { d: SHARP_PETALS[2],   col: 'end',   px: 26, py: 20, targetH: 66, rot:  7  },
    { d: FLAT_PETALS[2],    col: 'start', px: 72, py: 20, targetH: 74, rot: -12 },
  ],
  // round + sharp
  [
    { d: NATURAL_PETALS[0], col: 'end',   px: 30, py: 20, targetH: 76, rot:  5  },
    { d: SHARP_PETALS[3],   col: 'start', px: 70, py: 20, targetH: 64, rot: -9  },
  ],
  // sharp + round
  [
    { d: SHARP_PETALS[4],   col: 'start', px: 27, py: 20, targetH: 62, rot: -8  },
    { d: NATURAL_PETALS[1], col: 'end',   px: 72, py: 20, targetH: 80, rot: 11  },
  ],
  // flat + sharp
  [
    { d: FLAT_PETALS[3],    col: 'start', px: 28, py: 20, targetH: 70, rot: -5  },
    { d: SHARP_PETALS[0],   col: 'end',   px: 71, py: 20, targetH: 63, rot: 14  },
  ],
  // round + oval
  [
    { d: NATURAL_PETALS[2], col: 'end',   px: 30, py: 20, targetH: 78, rot:  9  },
    { d: MAJOR_PATH,        col: 'start', px: 73, py: 20, targetH: 40, rot: -18 },
  ],
  // round + sharp
  [
    { d: NATURAL_PETALS[3], col: 'start', px: 29, py: 20, targetH: 76, rot: -14 },
    { d: SHARP_PETALS[2],   col: 'end',   px: 70, py: 20, targetH: 62, rot:  6  },
  ],
  // flat + round
  [
    { d: FLAT_PETALS[4],    col: 'end',   px: 28, py: 20, targetH: 72, rot:  8  },
    { d: NATURAL_PETALS[4], col: 'start', px: 71, py: 20, targetH: 80, rot: -11 },
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
