import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';

const CARD_BG = '#DDE2EE';
const TEXT_PRIMARY = '#1A2030';
const TEXT_SECONDARY = '#5A6278';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatKeyMode(key, accidental, mode) {
  let note = key;
  if (accidental === 'sharp') note = key + '♯';
  else if (accidental === 'flat') note = key + '♭';
  return `${note} ${mode === 'minor' ? 'Minor' : 'Major'}`;
}

const SongCard = forwardRef(function SongCard({ songs, activeIndex, onIndexChange, onDismiss, onExited }, ref) {
  useScrollLock(true);
  // close() starts exit animation then calls onExited (which unmounts the card)
  const { close, sheetStyle, backdropStyle } = useSheetAnimation(onExited);
  const song = songs[activeIndex];
  const startX = useRef(null);
  const [dragDelta, setDragDelta] = useState(0);

  // Expose close() so VisualizationScreen can trigger animated dismiss externally
  useImperativeHandle(ref, () => ({ close }));

  // Internal dismiss: immediately notify parent (viz shifts back), then animate out
  function handleClose() {
    onDismiss();
    close();
  }

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

  const stats = [
    { label: 'Duration', value: formatDuration(song.duration) },
    { label: 'BPM',      value: song.bpm },
    { label: 'Key',      value: formatKeyMode(song.key, song.accidental, song.mode) },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Tap-outside dismiss strip */}
      <div className="h-20" onClick={handleClose} />

      {/* Dark gradient behind the card */}
      <div
        className="absolute left-0 right-0 bottom-0 h-64 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)', ...backdropStyle }}
      />

      {/* Floating card — animated */}
      <div className="px-4 pb-5" style={sheetStyle}>
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: CARD_BG, boxShadow: '0 8px 40px rgba(0,0,0,0.55)' }}
        >
          {/* Header: eyebrow + title + close */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div className="flex-1 pr-3">
              <p className="font-mono text-caption uppercase tracking-widest mb-0.5" style={{ color: TEXT_SECONDARY }}>Track {song.track}</p>
              <p className="font-serif text-title leading-tight" style={{ color: TEXT_PRIMARY }}>{song.name}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,0,0,0.1)', color: TEXT_PRIMARY }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Stats: equal-width columns with dividers */}
          <div className="flex px-5 pt-3 pb-5">
            {stats.map(({ label, value }, i) => (
              <div
                key={label}
                className="flex-1 pr-4"
                style={i < stats.length - 1 ? { borderRight: '1px solid rgba(0,0,0,0.12)' } : {}}
              >
                <div style={i > 0 ? { paddingLeft: '1rem' } : {}}>
                  <p className="font-mono text-caption uppercase tracking-widest mb-0.5" style={{ color: TEXT_SECONDARY }}>{label}</p>
                  <p className="font-mono text-label" style={{ color: TEXT_PRIMARY }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => activeIndex > 0 && onIndexChange(activeIndex - 1)}
              className={`flex items-center gap-0.5 font-sans text-ui px-3 py-1.5 rounded-md ${activeIndex === 0 ? 'invisible' : ''}`}
              style={{ background: 'rgba(0,0,0,0.08)', color: TEXT_PRIMARY }}
            >
              <ChevronLeft size={16} /> prev
            </button>
            <span className="font-mono text-caption" style={{ color: TEXT_SECONDARY }}>
              {activeIndex + 1} / {songs.length}
            </span>
            <button
              onClick={() => activeIndex < songs.length - 1 && onIndexChange(activeIndex + 1)}
              className={`flex items-center gap-0.5 font-sans text-ui px-3 py-1.5 rounded-md ${activeIndex === songs.length - 1 ? 'invisible' : ''}`}
              style={{ background: 'rgba(0,0,0,0.08)', color: TEXT_PRIMARY }}
            >
              next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SongCard;
