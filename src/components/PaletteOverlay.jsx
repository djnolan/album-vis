import { X } from 'lucide-react';
import { PALETTES } from '../data/palettes';
import Flower from './Flower';

// Per-palette flower positions: [bigCX, bigCY, bigRot, smallCX, smallCY, smallRot]
// Coordinates are within a 112×112 circle
const FLOWER_CONFIGS = [
  [40, 38,  20, 76, 76, 150],  // big upper-left,   small lower-right
  [76, 40,  45, 36, 74, 200],  // big upper-right,  small lower-left
  [38, 76, 300, 78, 36,  80],  // big lower-left,   small upper-right
  [74, 74, 120, 36, 38, 250],  // big lower-right,  small upper-left
  [56, 36,  15, 36, 78, 180],  // big top-center,   small lower-left
  [56, 36,  60, 78, 76, 280],  // big top-center,   small lower-right
  [34, 56, 330, 80, 34,  90],  // big mid-left,     small upper-right
  [78, 56, 200, 34, 34,  10],  // big mid-right,    small upper-left
  [38, 38,  70, 70, 80, 220],  // big upper-left,   small lower-center
  [78, 38, 100, 36, 76, 310],  // big upper-right,  small lower-left
  [38, 76, 240, 78, 36,  40],  // big lower-left,   small upper-right
  [74, 76, 160, 44, 36, 340],  // big lower-right,  small top-center
];

const D = 112;
const BIG_SIZE = 68;
const SMALL_SIZE = 42;

function PaletteThumbnail({ palette, active, onClick, index }) {
  const [bx, by, br, sx, sy, sr] = FLOWER_CONFIGS[index % FLOWER_CONFIGS.length];

  const bigFlower   = { bpm: 120, accidental: 'sharp',   mode: 'major', track: index * 7 + 1  };
  const smallFlower = { bpm: 60,  accidental: 'natural', mode: 'minor', track: index * 7 + 50 };

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2.5">
      <div
        className="rounded-full overflow-hidden relative shrink-0"
        style={{
          width: D,
          height: D,
          background: palette.bg,
          boxShadow: active
            ? '0 0 0 2px #161B24, 0 0 0 4px #7B9FD4'
            : '0 2px 12px rgba(0,0,0,0.4)',
          outline: active ? 'none' : '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ position: 'absolute', left: bx - BIG_SIZE / 2, top: by - BIG_SIZE / 2 }}>
          <Flower song={bigFlower}   size={BIG_SIZE}   color={palette.colorStart} bg={palette.bg} globalRotation={br} />
        </div>
        <div style={{ position: 'absolute', left: sx - SMALL_SIZE / 2, top: sy - SMALL_SIZE / 2 }}>
          <Flower song={smallFlower} size={SMALL_SIZE} color={palette.colorEnd}   bg={palette.bg} globalRotation={sr} />
        </div>
      </div>
      <p className="font-mono text-caption text-text-secondary text-center leading-tight">
        {palette.name}
      </p>
    </button>
  );
}

export default function PaletteOverlay({ activePaletteId, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-1 rounded-t-lg overflow-y-auto" style={{ maxHeight: 'calc(100vh - 48px)' }}>
        {/* Handle pill */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pt-4 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-title text-text-primary">Pick Your Palette</h2>
            <button onClick={onClose} className="text-text-secondary"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 justify-items-center">
            {PALETTES.map((p, i) => (
              <PaletteThumbnail
                key={p.id}
                palette={p}
                active={p.id === activePaletteId}
                onClick={() => { onSelect(p.id); onClose(); }}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
