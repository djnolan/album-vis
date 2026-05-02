import { useMemo } from 'react';
import Visualization from './Visualization';
import { PALETTES } from '../data/palettes';
import { PRELOADED_ALBUMS } from '../data/albums';

function AlbumCard({ album, onSelect }) {
  const palette = PALETTES.find(p => p.id === album.paletteId) ?? PALETTES[0];

  return (
    <div className="pb-6 flex flex-col items-center" onClick={() => onSelect(album)}>
      <div
        className="aspect-square rounded-lg overflow-hidden cursor-pointer relative"
        style={{ background: palette.bg, width: '16rem' }}
      >
        <div style={{ position: 'absolute', width: '125%', height: '125%', top: '-12.5%', left: '-12.5%' }}>
          <Visualization album={album} palette={palette} activeSongTrack={null} />
        </div>
      </div>
      <div className="mt-2" style={{ width: '16rem' }}>
        <p className="text-white text-sm font-medium leading-tight">{album.title}</p>
        <p className="text-white/60 text-xs">{album.artist}</p>
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
    <div className="bg-neutral-950 min-h-screen">
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-white text-xl font-bold leading-tight">
          Album Visualization<br />Experiment
        </h1>
      </div>
      {allAlbums.map(album => (
        <AlbumCard key={album.id} album={album} onSelect={onSelectAlbum} />
      ))}
      {/* Spacer so content clears the fixed bottom bar */}
      <div className="h-24" />

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center px-4 py-3 bg-neutral-950 border-t border-white/10">
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-full"
        >
          <span>CREATE</span>
          <span className="text-base">+</span>
        </button>
        <p className="ml-3 text-white/50 text-xs leading-tight">
          Upload your own album data to generate a visualization
        </p>
      </div>
    </div>
  );
}
