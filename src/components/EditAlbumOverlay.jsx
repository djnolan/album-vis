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
      <div className="relative bg-neutral-900 rounded-t-2xl px-5 pt-5 pb-8">
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-white text-lg font-bold leading-tight">Edit Album Info</h2>
          <button onClick={onClose} className="text-white/60 text-2xl leading-none ml-4">×</button>
        </div>

        <div className="mb-4">
          <label className="text-white/60 text-xs mb-1 block">Album Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-neutral-800 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-white/20"
            placeholder="Album title"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="text-white/60 text-xs mb-1 block">Artist</label>
          <input
            value={artist}
            onChange={e => setArtist(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-neutral-800 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-white/20"
            placeholder="Artist name"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-white text-black text-sm font-bold rounded-full"
        >
          SAVE
        </button>
      </div>
    </div>
  );
}
