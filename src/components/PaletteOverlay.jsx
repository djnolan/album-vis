import { X } from 'lucide-react';
import { PALETTES } from '../data/palettes';
import Flower from './Flower';

// Each config: two flowers per thumbnail
// cx/cy: % of container width/height (flower center anchor)
// acc: 'sharp' | 'natural'  |  col: 'start' | 'end'
// Container is 4:1 aspect ratio, ~155px wide × ~39px tall on mobile
// Flowers at 80px = ~205% of container height → heavily cropped
const FLOWER_CONFIGS = [
  // 0: sharp big left-center, natural small right-center
  [
    { acc:'sharp',   bpm:105, size:80, cx:26, cy:50, rot:30,  col:'start', track:1   },
    { acc:'natural', bpm:60,  size:54, cx:75, cy:50, rot:160, col:'end',   track:51  },
  ],
  // 1: natural big left upper, sharp small right lower
  [
    { acc:'natural', bpm:75,  size:80, cx:28, cy:28, rot:45,  col:'end',   track:8   },
    { acc:'sharp',   bpm:120, size:54, cx:74, cy:72, rot:200, col:'start', track:58  },
  ],
  // 2: sharp small left lower, natural big right upper
  [
    { acc:'sharp',   bpm:45,  size:54, cx:26, cy:72, rot:300, col:'start', track:15  },
    { acc:'natural', bpm:90,  size:80, cx:74, cy:28, rot:80,  col:'end',   track:65  },
  ],
  // 3: sharp big right-center, natural small left-center (colors swapped)
  [
    { acc:'sharp',   bpm:120, size:80, cx:74, cy:50, rot:120, col:'end',   track:22  },
    { acc:'natural', bpm:60,  size:54, cx:26, cy:50, rot:250, col:'start', track:72  },
  ],
  // 4: natural big left upper (few petals), sharp small right lower
  [
    { acc:'natural', bpm:45,  size:80, cx:28, cy:28, rot:15,  col:'start', track:29  },
    { acc:'sharp',   bpm:105, size:54, cx:73, cy:72, rot:180, col:'end',   track:79  },
  ],
  // 5: sharp big left lower, natural small right upper
  [
    { acc:'sharp',   bpm:75,  size:80, cx:26, cy:72, rot:60,  col:'start', track:36  },
    { acc:'natural', bpm:120, size:54, cx:76, cy:28, rot:280, col:'end',   track:86  },
  ],
  // 6: natural big right (many petals), sharp small left
  [
    { acc:'natural', bpm:135, size:80, cx:72, cy:35, rot:330, col:'end',   track:43  },
    { acc:'sharp',   bpm:60,  size:54, cx:28, cy:65, rot:90,  col:'start', track:93  },
  ],
  // 7: sharp big left-center (many petals), natural small right
  [
    { acc:'sharp',   bpm:90,  size:80, cx:26, cy:50, rot:200, col:'start', track:50  },
    { acc:'natural', bpm:135, size:54, cx:74, cy:50, rot:10,  col:'end',   track:100 },
  ],
  // 8: natural small left upper, sharp big right lower
  [
    { acc:'natural', bpm:75,  size:54, cx:28, cy:28, rot:70,  col:'start', track:57  },
    { acc:'sharp',   bpm:105, size:80, cx:73, cy:72, rot:220, col:'end',   track:107 },
  ],
  // 9: sharp big left lower (few petals), natural small right upper (many)
  [
    { acc:'sharp',   bpm:60,  size:80, cx:26, cy:72, rot:100, col:'start', track:64  },
    { acc:'natural', bpm:135, size:54, cx:74, cy:28, rot:310, col:'end',   track:114 },
  ],
  // 10: natural big right upper, sharp small left lower
  [
    { acc:'natural', bpm:90,  size:80, cx:74, cy:28, rot:240, col:'end',   track:71  },
    { acc:'sharp',   bpm:75,  size:54, cx:26, cy:72, rot:40,  col:'start', track:121 },
  ],
  // 11: sharp big right (many petals), natural small left
  [
    { acc:'sharp',   bpm:135, size:80, cx:73, cy:50, rot:160, col:'start', track:78  },
    { acc:'natural', bpm:105, size:54, cx:27, cy:50, rot:340, col:'end',   track:128 },
  ],
];

function PaletteThumbnail({ palette, active, onClick, index }) {
  const cfg = FLOWER_CONFIGS[index % FLOWER_CONFIGS.length];

  return (
    <button onClick={onClick} className="flex flex-col gap-2 w-full text-left">
      <div
        className="w-full rounded-sm overflow-hidden relative"
        style={{
          aspectRatio: '4 / 1',
          background: palette.bg,
          boxShadow: active
            ? '0 0 0 2px #161B24, 0 0 0 4px #7B9FD4'
            : '0 2px 8px rgba(0,0,0,0.4)',
          outline: active ? 'none' : '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {cfg.map((f, fi) => (
          <div
            key={fi}
            style={{
              position: 'absolute',
              left: `${f.cx}%`,
              top: `${f.cy}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Flower
              song={{ bpm: f.bpm, accidental: f.acc, mode: 'major', track: f.track }}
              size={f.size}
              color={f.col === 'start' ? palette.colorStart : palette.colorEnd}
              bg={palette.bg}
              globalRotation={f.rot}
            />
          </div>
        ))}
      </div>
      <p className="font-mono text-caption text-text-secondary text-center">
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
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
