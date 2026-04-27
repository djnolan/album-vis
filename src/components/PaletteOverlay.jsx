import PALETTES from '../data/palettes';
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
      className={`rounded-xl overflow-hidden flex flex-col items-center pb-2 ${active ? 'ring-2 ring-white' : ''}`}
      style={{ background: palette.bg }}
    >
      <div className="w-full aspect-video">
        <Visualization
          album={PREVIEW_ALBUM}
          palette={palette}
          activeSongTrack={null}
        />
      </div>
      <p className="text-white text-xs mt-1 px-2 truncate w-full text-center">{palette.name}</p>
    </button>
  );
}

export default function PaletteOverlay({ activePaletteId, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-neutral-900 rounded-t-2xl px-5 pt-5 pb-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">Pick Your Palette</h2>
          <button onClick={onClose} className="text-white/60 text-2xl leading-none">×</button>
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
  );
}
