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

      <div className="bg-neutral-900 rounded-t-2xl px-5 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {songs.map((_, i) => (
              <button
                key={i}
                onClick={() => onIndexChange(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIndex ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
          <button onClick={onDismiss} className="text-white/40 text-xl leading-none">×</button>
        </div>

        <p className="text-white text-lg font-bold mb-4">{song.name}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Duration</span>
            <span className="text-white">{formatDuration(song.duration)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">BPM</span>
            <span className="text-white">{song.bpm}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Key</span>
            <span className="text-white">{formatKey(song.key, song.accidental)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Mode</span>
            <span className="text-white capitalize">{song.mode}</span>
          </div>
        </div>

        <div className="flex justify-between mt-5">
          <button
            onClick={() => activeIndex > 0 && onIndexChange(activeIndex - 1)}
            className={`text-white/40 text-sm px-3 py-1 ${activeIndex === 0 ? 'invisible' : ''}`}
          >
            ← prev
          </button>
          <span className="text-white/30 text-xs self-center">
            {activeIndex + 1} / {songs.length}
          </span>
          <button
            onClick={() => activeIndex < songs.length - 1 && onIndexChange(activeIndex + 1)}
            className={`text-white/40 text-sm px-3 py-1 ${activeIndex === songs.length - 1 ? 'invisible' : ''}`}
          >
            next →
          </button>
        </div>
      </div>
    </div>
  );
}
