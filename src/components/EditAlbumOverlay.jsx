import { useState } from 'react';

export default function EditAlbumOverlay({ album, onSave, onClose }) {
  const [title, setTitle] = useState(album.title);
  const [artist, setArtist] = useState(album.artist);

  function handleSave() {
    if (!title.trim()) return;
    onSave({ ...album, title: title.trim(), artist: artist.trim() });
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-1 rounded-t-lg">
        {/* Handle pill */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pt-4 pb-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="font-serif text-title text-text-primary leading-tight">Edit Album Info</h2>
            <button onClick={onClose} className="text-text-secondary text-2xl leading-none ml-4">×</button>
          </div>

          <div className="mb-5">
            <label className="font-mono text-caption text-text-secondary uppercase block mb-2">Album Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-surface-2 text-text-primary font-sans text-body rounded-md px-4 py-3 outline-none border border-border focus:ring-1 focus:ring-accent"
              placeholder="Album title"
              autoFocus
            />
          </div>

          <div className="mb-8">
            <label className="font-mono text-caption text-text-secondary uppercase block mb-2">Artist</label>
            <input
              value={artist}
              onChange={e => setArtist(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-surface-2 text-text-primary font-sans text-body rounded-md px-4 py-3 outline-none border border-border focus:ring-1 focus:ring-accent"
              placeholder="Artist name"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-accent text-surface-0 font-sans text-ui rounded-sm"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
