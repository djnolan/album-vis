import { useState, useRef } from 'react';
import Visualization from './Visualization';
import { PALETTES } from '../data/palettes';
import { PRELOADED_ALBUMS } from '../data/albums';
import PrimaryButton from './PrimaryButton';
import RemoveAlbumSheet from './RemoveAlbumSheet';

function AlbumCard({ album, onSelect, isUserAlbum, onLongPress }) {
  const palette = PALETTES.find(p => p.id === album.paletteId) ?? PALETTES[0];
  const pressTimer = useRef(null);
  const didLongPress = useRef(false);

  function handlePressStart() {
    if (!isUserAlbum) return;
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress(album);
    }, 600);
  }

  function handlePressEnd() {
    clearTimeout(pressTimer.current);
  }

  function handleClick() {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    onSelect(album);
  }

  return (
    <div
      className="w-64 md:w-full pb-6 md:pb-0 flex flex-col cursor-pointer"
      onClick={handleClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchMove={handlePressEnd}
    >
      <div
        className="aspect-square w-full rounded-md overflow-hidden relative"
        style={{
          background: palette.bg,
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          outline: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ position: 'absolute', width: '125%', height: '125%', top: '-12.5%', left: '-12.5%' }}>
          <Visualization album={album} palette={palette} activeSongTrack={null} />
        </div>
      </div>
      <div className="mt-3 text-center md:text-left">
        <p className="font-serif text-title leading-tight text-text-primary">{album.title}</p>
        <p className="font-mono text-caption mt-1 text-text-secondary">{album.artist}</p>
      </div>
    </div>
  );
}

function AlbumGrid({ albums, onSelectAlbum, isUserAlbum, onLongPress }) {
  return (
    <div className="grid grid-cols-1 justify-items-center md:justify-items-start md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
      {albums.map(album => (
        <AlbumCard
          key={album.id}
          album={album}
          onSelect={onSelectAlbum}
          isUserAlbum={isUserAlbum}
          onLongPress={onLongPress}
        />
      ))}
    </div>
  );
}

export default function HomeScreen({ userAlbums = [], paletteOverrides = {}, onSelectAlbum, onCreateClick, onRemoveAlbum }) {
  const [albumToRemove, setAlbumToRemove] = useState(null);
  const preloadedAlbums = PRELOADED_ALBUMS.map(a =>
    paletteOverrides[a.id] ? { ...a, paletteId: paletteOverrides[a.id] } : a
  );

  return (
    <div className="bg-surface-0 min-h-screen lg:flex lg:h-screen lg:overflow-hidden">

      {/* ── LEFT SIDEBAR (desktop only) ── */}
      <aside className="hidden lg:flex flex-col w-80 shrink-0 h-screen sticky top-0 px-10 py-14 border-r border-border">
        <div className="flex-1">
          <h1 className="font-serif text-text-primary leading-none" style={{ fontSize: '3.5rem' }}>
            In Bloom
          </h1>
          <p className="font-sans text-body text-text-secondary mt-4">
            A music visualization experiment.<br />Browse album artwork or create your own.
          </p>
        </div>
        <PrimaryButton onClick={onCreateClick}>CREATE +</PrimaryButton>
      </aside>

      {/* ── RIGHT CONTENT AREA ── */}
      <main className="flex-1 lg:overflow-y-auto lg:h-screen">

        {/* Mobile header */}
        <div className="lg:hidden px-6 pt-8 pb-8">
          <h1 className="font-serif text-text-primary leading-tight text-center" style={{ fontSize: '3rem' }}>
            In Bloom
          </h1>
          <p className="font-sans text-body text-text-secondary text-center mt-1">
            A music visualization experiment.<br />Browse album artwork or create your own.
          </p>
        </div>

        {/* ── DESKTOP album layout ── */}
        <div className="hidden lg:block px-10 pt-12 pb-20">
          {userAlbums.length > 0 && (
            <section className="mb-16">
              <p className="font-mono text-caption text-text-secondary uppercase tracking-wider mb-8">
                Your Albums
              </p>
              <div className="grid grid-cols-2 gap-10">
                {userAlbums.map(album => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onSelect={onSelectAlbum}
                    isUserAlbum
                    onLongPress={setAlbumToRemove}
                  />
                ))}
              </div>
            </section>
          )}
          <div className="grid grid-cols-2 gap-10">
            {preloadedAlbums.map(album => (
              <AlbumCard
                key={album.id}
                album={album}
                onSelect={onSelectAlbum}
                isUserAlbum={false}
                onLongPress={setAlbumToRemove}
              />
            ))}
          </div>
        </div>

        {/* ── MOBILE / TABLET album layout ── */}
        <div className="lg:hidden">
          {userAlbums.length > 0 && (
            <div className="mx-4 mt-6 mb-10 rounded-lg px-4 pt-0 pb-4" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex justify-center">
                <p
                  className="font-sans text-ui font-medium uppercase tracking-wider text-text-secondary px-3 mb-6"
                  style={{ marginTop: '-0.6em', background: '#0E1117' }}
                >
                  Your Albums
                </p>
              </div>
              <AlbumGrid
                albums={userAlbums}
                onSelectAlbum={onSelectAlbum}
                isUserAlbum
                onLongPress={setAlbumToRemove}
              />
            </div>
          )}

          <div className="px-6 md:px-8">
            <AlbumGrid
              albums={preloadedAlbums}
              onSelectAlbum={onSelectAlbum}
              isUserAlbum={false}
              onLongPress={setAlbumToRemove}
            />
          </div>

          {/* Spacer so content clears the fixed bottom bar */}
          <div className="h-40" />
        </div>
      </main>

      {/* ── MOBILE fixed bottom bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 flex items-end px-6 pt-20 pb-5 bg-gradient-to-t from-surface-0 to-transparent pointer-events-none">
        <PrimaryButton onClick={onCreateClick}>CREATE +</PrimaryButton>
      </div>

      {albumToRemove && (
        <RemoveAlbumSheet
          album={albumToRemove}
          onConfirm={() => onRemoveAlbum(albumToRemove.id)}
          onClose={() => setAlbumToRemove(null)}
        />
      )}
    </div>
  );
}
