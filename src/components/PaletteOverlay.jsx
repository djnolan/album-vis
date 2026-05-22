import { X } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { PALETTES } from '../data/palettes';
import Flower from './Flower';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';
import { useIsDesktop } from '../hooks/useIsDesktop';

// Ratio of flower size to container height, calibrated to mobile layout.
// Mobile (~390px): col ~155px, container height ~62px, flower 80px → 80/62 ≈ 1.29
const FLOWER_RATIO = 80 / 62;

const FLOWER_CONFIGS = [
  [
    { acc: 'natural', bpm: 60,  mode: 'major', track: 1,  col: 'start', cx: 28, cy: 50, rot: 0 },
    { acc: 'sharp',   bpm: 75,  mode: 'minor', track: 2,  col: 'end',   cx: 68, cy: 50, rot: 180 },
  ],
  [
    { acc: 'flat',    bpm: 60,  mode: 'minor', track: 3,  col: 'end',   cx: 32, cy: 48, rot: 60 },
    { acc: 'flat',    bpm: 105, mode: 'major', track: 4,  col: 'start', cx: 66, cy: 52, rot: 240 },
  ],
  [
    { acc: 'sharp',   bpm: 90,  mode: 'major', track: 5,  col: 'start', cx: 30, cy: 52, rot: 120 },
    { acc: 'flat',    bpm: 70,  mode: 'minor', track: 6,  col: 'end',   cx: 70, cy: 48, rot: 300 },
  ],
  [
    { acc: 'natural', bpm: 120, mode: 'minor', track: 7,  col: 'end',   cx: 35, cy: 49, rot: 45 },
    { acc: 'sharp',   bpm: 60,  mode: 'major', track: 8,  col: 'start', cx: 63, cy: 51, rot: 225 },
  ],
  [
    { acc: 'natural', bpm: 105, mode: 'major', track: 9,  col: 'start', cx: 29, cy: 51, rot: 90 },
    { acc: 'natural', bpm: 75,  mode: 'minor', track: 10, col: 'end',   cx: 67, cy: 49, rot: 270 },
  ],
  [
    { acc: 'sharp',   bpm: 105, mode: 'minor', track: 11, col: 'end',   cx: 33, cy: 47, rot: 30 },
    { acc: 'flat',    bpm: 90,  mode: 'major', track: 12, col: 'start', cx: 65, cy: 53, rot: 150 },
  ],
  [
    { acc: 'natural', bpm: 60,  mode: 'major', track: 13, col: 'start', cx: 31, cy: 53, rot: 135 },
    { acc: 'sharp',   bpm: 135, mode: 'minor', track: 14, col: 'end',   cx: 69, cy: 47, rot: 315 },
  ],
  [
    { acc: 'sharp',   bpm: 75,  mode: 'minor', track: 15, col: 'end',   cx: 36, cy: 50, rot: 75 },
    { acc: 'sharp',   bpm: 90,  mode: 'major', track: 16, col: 'start', cx: 62, cy: 50, rot: 255 },
  ],
  [
    { acc: 'sharp',   bpm: 60,  mode: 'major', track: 17, col: 'start', cx: 27, cy: 48, rot: 15 },
    { acc: 'flat',    bpm: 120, mode: 'minor', track: 18, col: 'end',   cx: 71, cy: 52, rot: 195 },
  ],
  [
    { acc: 'natural', bpm: 135, mode: 'minor', track: 19, col: 'end',   cx: 34, cy: 52, rot: 165 },
    { acc: 'flat',    bpm: 60,  mode: 'major', track: 20, col: 'start', cx: 64, cy: 48, rot: 345 },
  ],
  [
    { acc: 'natural', bpm: 75,  mode: 'minor', track: 21, col: 'end',   cx: 30, cy: 50, rot: 210 },
    { acc: 'natural', bpm: 120, mode: 'major', track: 22, col: 'start', cx: 68, cy: 50, rot: 30 },
  ],
  [
    { acc: 'flat',    bpm: 105, mode: 'major', track: 23, col: 'start', cx: 32, cy: 47, rot: 105 },
    { acc: 'sharp',   bpm: 75,  mode: 'minor', track: 24, col: 'end',   cx: 66, cy: 53, rot: 285 },
  ],
];

function PaletteThumbnail({ palette, active, onClick, index, flowerSize }) {
  const cfg = FLOWER_CONFIGS[index % FLOWER_CONFIGS.length];

  return (
    <button onClick={onClick} className="flex flex-col gap-2 w-full items-center">
      <div
        className="w-full rounded-md overflow-hidden"
        style={{
          aspectRatio: '5 / 2',
          position: 'relative',
          background: palette.bg,
          boxShadow: active
            ? '0 0 0 1px #161B24, 0 0 0 2px #7B9FD4, 0 0 10px rgba(123,159,212,0.65)'
            : '0 2px 8px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {cfg.map((f, i) => {
          const color = f.col === 'start' ? palette.colorStart : palette.colorEnd;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${f.cx}%`,
                top: `${f.cy}%`,
                transform: `translate(-50%, -50%) rotate(${f.rot}deg)`,
              }}
            >
              <Flower
                song={{ bpm: f.bpm, accidental: f.acc, mode: f.mode, track: f.track }}
                size={flowerSize}
                color={color}
                bg={palette.bg}
                globalRotation={0}
              />
            </div>
          );
        })}
      </div>
      <p className="font-mono text-caption text-text-secondary text-center">
        {palette.name}
      </p>
    </button>
  );
}

function PaletteContent({ activePaletteId, onSelect, close }) {
  const gridRef = useRef(null);
  const [flowerSize, setFlowerSize] = useState(80);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const gridWidth = entry.contentRect.width;
      const colWidth = (gridWidth - 32) / 2; // gap-x-8 = 32px
      const containerHeight = colWidth * (2 / 5); // aspect-ratio 5/2
      setFlowerSize(Math.round(containerHeight * FLOWER_RATIO));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
        <div ref={gridRef} className="grid grid-cols-2 gap-x-8 gap-y-5">
          {PALETTES.map((p, i) => (
            <PaletteThumbnail
              key={p.id}
              palette={p}
              active={p.id === activePaletteId}
              onClick={() => { onSelect(p.id); close(); }}
              index={i}
              flowerSize={flowerSize}
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
