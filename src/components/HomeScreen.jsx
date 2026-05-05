import Visualization from './Visualization';
import { PALETTES } from '../data/palettes';
import { PRELOADED_ALBUMS } from '../data/albums';

function AlbumCard({ album, onSelect }) {
  const palette = PALETTES.find(p => p.id === album.paletteId) ?? PALETTES[0];

  return (
    <div className="pb-6 flex flex-col items-center" onClick={() => onSelect(album)}>
      <div
        className="aspect-square rounded-md overflow-hidden cursor-pointer relative"
        style={{
          background: palette.bg,
          width: '16rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          outline: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ position: 'absolute', width: '125%', height: '125%', top: '-12.5%', left: '-12.5%' }}>
          <Visualization album={album} palette={palette} activeSongTrack={null} />
        </div>
      </div>
      <div className="mt-3 text-center" style={{ width: '16rem' }}>
        <p className="font-serif text-title text-text-primary leading-tight">{album.title}</p>
        <p className="font-mono text-caption text-text-secondary mt-1">{album.artist}</p>
      </div>
    </div>
  );
}

export default function HomeScreen({ userAlbums = [], paletteOverrides = {}, onSelectAlbum, onCreateClick }) {
  const allAlbums = [
    ...userAlbums,
    ...PRELOADED_ALBUMS.map(a => paletteOverrides[a.id] ? { ...a, paletteId: paletteOverrides[a.id] } : a),
  ];
  return (
    <div className="bg-surface-0 min-h-screen">
      <div className="px-6 pt-8 pb-8">
        <h1 className="font-serif text-display text-text-primary leading-tight text-center">
          In Bloom
        </h1>
        <p className="font-sans text-body text-text-secondary text-center mt-1">
          A music visualization experiment
        </p>
      </div>
      <div className="px-6">
        {allAlbums.map(album => (
          <AlbumCard key={album.id} album={album} onSelect={onSelectAlbum} />
        ))}
      </div>
      {/* Spacer so content clears the fixed bottom bar */}
      <div className="h-24" />

      {/* Fixed bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center px-6 py-5 bg-surface-2"
        style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.4)' }}
      >
        <button
          onClick={onCreateClick}
          className="w-full py-3 bg-accent text-surface-0 font-sans text-body font-bold leading-none rounded-sm"
        >
          CREATE +
        </button>
      </div>
    </div>
  );
}
