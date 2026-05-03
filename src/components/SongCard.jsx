// TODO: visual redesign — currently a v1 placeholder with clean data list
import { useRef, useState } from 'react';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatKey(key, accidental) {
  if (accidental === 'sharp') return key + '♯';
  if (accidental === 'flat') return key + '♭';
  return key;
}

export default function SongCard({ songs, activeIndex, onIndexChange, onDismiss }) {
  const song = songs[activeIndex];
  const startX = useRef(null);
  const [dragDelta, setDragDelta] = useState(0);

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    setDragDelta(0);
  }

  function onTouchMove(e) {
    if (startX.current == null) return;
    setDragDelta(e.touches[0].clientX - startX.current);
  }

  function onTouchEnd() {
    if (dragDelta > 60 && activeIndex > 0) onIndexChange(activeIndex - 1);
    else if (dragDelta < -60 && activeIndex < songs.length - 1) onIndexChange(activeIndex + 1);
    startX.current = null;
    setDragDelta(0);
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Tap-outside dismiss area — narrow strip above card */}
      <div className="h-16" onClick={onDismiss} />

      <div className="bg-surface-1 rounded-t-lg">
        {/* Handle pill */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pt-4 pb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1.5">
              {songs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onIndexChange(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIndex ? 'bg-text-primary' : 'bg-text-tertiary'}`}
                />
              ))}
            </div>
            <button onClick={onDismiss} className="text-text-tertiary text-xl leading-none">×</button>
          </div>

          <p className="font-serif text-title text-text-primary mb-6">{song.name}</p>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-caption text-text-secondary uppercase">Duration</span>
              <span className="font-mono text-label text-text-primary">{formatDuration(song.duration)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-caption text-text-secondary uppercase">BPM</span>
              <span className="font-mono text-label text-text-primary">{song.bpm}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-caption text-text-secondary uppercase">Key</span>
              <span className="font-mono text-label text-text-primary">{formatKey(song.key, song.accidental)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-caption text-text-secondary uppercase">Mode</span>
              <span className="font-mono text-label text-text-primary capitalize">{song.mode}</span>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => activeIndex > 0 && onIndexChange(activeIndex - 1)}
              className={`font-sans text-ui text-text-tertiary px-3 py-1 ${activeIndex === 0 ? 'invisible' : ''}`}
            >
              ← prev
            </button>
            <span className="font-mono text-caption text-text-tertiary self-center">
              {activeIndex + 1} / {songs.length}
            </span>
            <button
              onClick={() => activeIndex < songs.length - 1 && onIndexChange(activeIndex + 1)}
              className={`font-sans text-ui text-text-tertiary px-3 py-1 ${activeIndex === songs.length - 1 ? 'invisible' : ''}`}
            >
              next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
