import { useState } from 'react';
import { X } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';
import { useIsDesktop } from '../hooks/useIsDesktop';

function EditContent({ title, setTitle, artist, setArtist, handleSave, handleKeyDown, close }) {
  return (
    <>
      <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
        <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">Edit Album Info</h2>
        <button
          onClick={close}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-6 pb-8">
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

        <PrimaryButton onClick={handleSave}>SAVE</PrimaryButton>
      </div>
    </>
  );
}

export default function EditAlbumOverlay({ album, onSave, onClose }) {
  useScrollLock(true);
  const isDesktop = useIsDesktop();
  const { close, backdropStyle, sheetStyle } = useSheetAnimation(onClose, isDesktop ? 'right' : 'up');
  const [title, setTitle] = useState(album.title);
  const [artist, setArtist] = useState(album.artist);

  function handleSave() {
    if (!title.trim()) return;
    onSave({ ...album, title: title.trim(), artist: artist.trim() });
    close();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave();
  }

  const contentProps = { title, setTitle, artist, setArtist, handleSave, handleKeyDown, close };

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/60" style={backdropStyle} onClick={close} />
        <div
          className="relative ml-auto h-full bg-surface-1 flex flex-col rounded-tl-lg rounded-bl-lg"
          style={{ width: '36%', minWidth: '320px', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', ...sheetStyle }}
        >
          <EditContent {...contentProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75" style={backdropStyle} onClick={close} />
      <div
        className="relative bg-surface-1 rounded-t-lg flex flex-col"
        style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', ...sheetStyle }}
      >
        <EditContent {...contentProps} />
      </div>
    </div>
  );
}
