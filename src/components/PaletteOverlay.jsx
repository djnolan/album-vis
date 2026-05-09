import { X } from 'lucide-react';
import { PALETTES } from '../data/palettes';
import Flower from './Flower';

// Each config: two flowers per thumbnail
// cx/cy: % of container width/height (flower center anchor)
// acc: 'sharp' | 'natural'  |  col: 'start' | 'end'
// Container is 3:1 aspect ratio, ~155px wide × ~52px tall on mobile
// Flowers at 80px = ~155% of container height → nicely cropped
const FLOWER_CONFIGS = [
  // 0: sharp big left-center, natural small right-center
  [
    { acc:'sharp',   bpm:105, size:100, cx:29, cy:50, rot:30,  col:'start', track:1   },
    { acc:'natural', bpm:60,  size:68, cx:72, cy:50, rot:160, col:'end',   track:51  },
  ],
  // 1: natural big left upper, sharp small right lower
  [
    { acc:'natural', bpm:75,  size:100, cx:30, cy:28, rot:45,  col:'end',   track:8   },
    { acc:'sharp',   bpm:120, size:68, cx:71, cy:72, rot:200, col:'start', track:58  },
  ],
  // 2: sharp small left lower, natural big right upper
  [
    { acc:'sharp',   bpm:45,  size:68, cx:29, cy:72, rot:300, col:'start', track:15  },
    { acc:'natural', bpm:90,  size:100, cx:71, cy:28, rot:80,  col:'end',   track:65  },
  ],
  // 3: sharp big right-center, natural small left-center (colors swapped)
  [
    { acc:'sharp',   bpm:120, size:100, cx:71, cy:50, rot:120, col:'end',   track:22  },
    { acc:'natural', bpm:60,  size:68, cx:29, cy:50, rot:250, col:'start', track:72  },
  ],
  // 4: natural big left upper (few petals), sharp small right lower
  [
    { acc:'natural', bpm:45,  size:100, cx:30, cy:28, rot:15,  col:'start', track:29  },
    { acc:'sharp',   bpm:105, size:68, cx:70, cy:72, rot:180, col:'end',   track:79  },
  ],
  // 5: sharp big left lower, natural small right upper
  [
    { acc:'sharp',   bpm:75,  size:100, cx:29, cy:72, rot:60,  col:'start', track:36  },
    { acc:'natural', bpm:120, size:68, cx:72, cy:28, rot:280, col:'end',   track:86  },
  ],
  // 6: natural big right (many petals), sharp small left
  [
    { acc:'natural', bpm:135, size:100, cx:70, cy:35, rot:330, col:'end',   track:43  },
    { acc:'sharp',   bpm:60,  size:68, cx:30, cy:65, rot:90,  col:'start', track:93  },
  ],
  // 7: sharp big left-center (many petals), natural small right
  [
    { acc:'sharp',   bpm:90,  size:100, cx:29, cy:50, rot:200, col:'start', track:50  },
    { acc:'natural', bpm:135, size:68, cx:71, cy:50, rot:10,  col:'end',   track:100 },
  ],
  // 8: natural small left upper, sharp big right lower
  [
    { acc:'natural', bpm:75,  size:68, cx:30, cy:28, rot:70,  col:'start', track:57  },
    { acc:'sharp',   bpm:105, size:100, cx:70, cy:72, rot:220, col:'end',   track:107 },
  ],
  // 9: sharp big left lower (few petals), natural small right upper (many)
  [
    { acc:'sharp',   bpm:60,  size:100, cx:29, cy:72, rot:100, col:'start', track:64  },
    { acc:'natural', bpm:135, size:68, cx:71, cy:28, rot:310, col:'end',   track:114 },
  ],
  // 10: natural big right upper, sharp small left lower
  [
    { acc:'natural', bpm:90,  size:100, cx:71, cy:28, rot:240, col:'end',   track:71  },
    { acc:'sharp',   bpm:75,  size:68, cx:29, cy:72, rot:40,  col:'start', track:121 },
  ],
  // 11: sharp big right (many petals), natural small left
  [
    { acc:'sharp',   bpm:135, size:100, cx:70, cy:50, rot:160, col:'start', track:78  },
    { acc:'natural', bpm:105, size:68, cx:30, cy:50, rot:340, col:'end',   track:128 },
  ],
];

function PaletteThumbnail({ palette, active, onClick, index }) {
  const cfg = FLOWER_CONFIGS[index % FLOWER_CONFIGS.length];

  return (
    <button onClick={onClick} className="flex flex-col gap-2 w-full items-center">
      <div
        className="w-full rounded-sm overflow-hidden relative"
        style={{
          aspectRatio: '5 / 2',
          background: palette.bg,
          boxShadow: active
            ? '0 0 0 1px #161B24, 0 0 0 2.5px #8B93A1'
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
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative bg-surface-1 rounded-t-lg flex flex-col" style={{ maxHeight: 'calc(100dvh - 48px)', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}>

        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">Pick Your Palette</h2>
          <button
            onClick={onClose}
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
