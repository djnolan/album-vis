import { X } from 'lucide-react';
import { PALETTES } from '../data/palettes';
import Visualization from './Visualization';
import { boc } from '../data/albums';

const PREVIEW_ALBUM = {
  ...boc,
  songs: boc.songs.slice(0, 5),
};

function PaletteThumbnail({ palette, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md overflow-hidden flex flex-col items-center pb-2 ${active ? 'ring-2 ring-accent' : ''}`}
      style={{
        background: palette.bg,
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
        outline: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="w-full aspect-video">
        <Visualization
          album={PREVIEW_ALBUM}
          palette={palette}
          activeSongTrack={null}
        />
      </div>
      <p
        className="font-mono text-caption mt-1 px-2 truncate w-full text-center"
        style={{ color: palette.lightBg ? '#0E1117' : '#F0F2F5' }}
      >
        {palette.name}
      </p>
    </button>
  );
}

export default function PaletteOverlay({ activePaletteId, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-1 rounded-t-lg max-h-[85vh] overflow-y-auto">
        {/* Handle pill */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pt-4 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-title text-text-primary">Pick Your Palette</h2>
            <button onClick={onClose} className="text-text-secondary"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {PALETTES.map(p => (
              <PaletteThumbnail
                key={p.id}
                palette={p}
                active={p.id === activePaletteId}
                onClick={() => { onSelect(p.id); onClose(); }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
