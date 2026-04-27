import { useState } from 'react';
import Visualization from './Visualization';
import SongCard from './SongCard';
import PALETTES from '../data/palettes';

export default function VisualizationScreen({ album, paletteId, onBack, onPaletteClick, onInfoClick, onEditClick }) {
  const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  const [activeSongTrack, setActiveSongTrack] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);

  const sortedSongs = [...album.songs].sort((a, b) => a.track - b.track);

  function handleFlowerClick(node) {
    const idx = sortedSongs.findIndex(s => s.track === node.track);
    setCardIndex(idx >= 0 ? idx : 0);
    setActiveSongTrack(node.track);
  }

  function handleCardIndexChange(i) {
    setCardIndex(i);
    setActiveSongTrack(sortedSongs[i].track);
  }

  function handleDismiss() {
    setActiveSongTrack(null);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: palette.bg }}>
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-5 pb-2">
        <button onClick={onEditClick} className="text-left">
          <p className="text-white text-sm font-semibold leading-tight">{album.title}</p>
          <p className="text-white/60 text-xs">{album.artist}</p>
        </button>
        <button onClick={onInfoClick} className="text-white/60 text-xl leading-none mt-0.5">ⓘ</button>
      </div>

      {/* Visualization */}
      <div
        className="flex-1 overflow-hidden"
        style={{ background: palette.bg }}
        onClick={activeSongTrack != null ? handleDismiss : undefined}
      >
        <div style={{ width: '116%', height: '100%', marginLeft: '-8%' }}>
          <Visualization
            album={album}
            palette={palette}
            activeSongTrack={activeSongTrack}
            onFlowerClick={handleFlowerClick}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-8 py-4">
        <button onClick={onBack} className="text-white/70 text-xl">←</button>
        <button onClick={onPaletteClick} className="text-white/70 text-xl">◎</button>
        <button
          onClick={() => alert('Download coming soon!')}
          className="text-white/70 text-xl"
          title="Download (coming soon)"
        >
          ↓
        </button>
      </div>

      {/* Song card */}
      {activeSongTrack != null && (
        <SongCard
          songs={sortedSongs}
          activeIndex={cardIndex}
          onIndexChange={handleCardIndexChange}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
