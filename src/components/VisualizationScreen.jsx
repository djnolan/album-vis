import { useState, useRef } from 'react';
import { ArrowLeft, Info, Palette, Download, X } from 'lucide-react';
import Visualization from './Visualization';
import SongCard from './SongCard';
import { PALETTES } from '../data/palettes';
import { useScrollLock } from '../hooks/useScrollLock';
import { useIsDesktop } from '../hooks/useIsDesktop';

const CARD_BG = '#DDE2EE';
const TOOLTIP_TEXT_PRIMARY = '#1A2030';
const TOOLTIP_TEXT_SECONDARY = '#5A6278';
const CARD_W = 240;

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

function DesktopSongCard({ song, rect, onClose }) {
  if (!song || !rect) return null;

  const CARD_H = 200;
  const OVERLAP = 16;
  const flowerCenterY = rect.top + rect.height / 2;

  // Prefer right of flower; flip left if it would overflow
  let left = rect.right - OVERLAP;
  if (left + CARD_W + 16 > window.innerWidth) {
    left = rect.left + OVERLAP - CARD_W;
  }
  left = Math.max(16, left);

  const top = Math.max(16, Math.min(flowerCenterY - CARD_H / 2, window.innerHeight - CARD_H - 16));

  const stats = [
    { label: 'Duration', value: formatDuration(song.duration) },
    { label: 'BPM',      value: song.bpm },
    { label: 'Key',      value: formatKeyMode(song.key, song.accidental, song.mode) },
  ];

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left, top, width: CARD_W }}
    >
      <div
        className="rounded-lg overflow-hidden pointer-events-auto"
        style={{ background: CARD_BG, boxShadow: '0 8px 40px rgba(0,0,0,0.55)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-4 pt-4 pb-3">
          <div className="flex-1 pr-3">
            <p className="font-mono text-caption uppercase tracking-widest mb-0.5" style={{ color: TOOLTIP_TEXT_SECONDARY }}>
              Track {song.track}
            </p>
            <p className="font-serif text-title leading-tight" style={{ color: TOOLTIP_TEXT_PRIMARY }}>
              {song.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'rgba(0,0,0,0.1)', color: TOOLTIP_TEXT_PRIMARY }}
          >
            <X size={14} />
          </button>
        </div>
        <div className="px-4 pb-4 flex flex-col">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline py-3"
              style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}
            >
              <span className="font-mono text-caption uppercase tracking-widest w-1/2 shrink-0" style={{ color: TOOLTIP_TEXT_SECONDARY }}>
                {label}
              </span>
              <span className="font-mono text-label w-1/2" style={{ color: TOOLTIP_TEXT_PRIMARY }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VisualizationScreen({ album, paletteId, onBack, onPaletteClick, onInfoClick, onEditClick, desktopOverlayOpen = false, onCloseOverlay }) {
  useScrollLock(true);
  const isDesktop = useIsDesktop();
  const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  const lightBg = !!palette.lightBg;
  const [activeSongTrack, setActiveSongTrack] = useState(null);
  const [songCardMounted, setSongCardMounted] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  // Desktop click-to-reveal card state
  const [desktopClickedSong, setDesktopClickedSong] = useState(null);
  const [desktopCardRect, setDesktopCardRect] = useState(null);
  const vizRef = useRef(null);
  const songCardRef = useRef(null);

  function handleBack() {
    setIsExiting(true);
    setTimeout(onBack, 200);
  }

  const vizTextPrimary = lightBg ? '#0E1117' : '#F0F2F5';
  const vizTextSecondary = lightBg ? '#3A3F4A' : '#8B93A1';

  const sortedSongs = [...album.songs].sort((a, b) => a.track - b.track);

  function handleFlowerClick(node, rect) {
    if (isDesktop) {
      // Toggle: clicking the same flower again dismisses the card
      if (desktopClickedSong?.track === node.track) {
        setDesktopClickedSong(null);
      } else {
        setDesktopClickedSong(node);
        setDesktopCardRect(rect);
      }
      return;
    }
    // Mobile: bottom carousel
    const idx = sortedSongs.findIndex(s => s.track === node.track);
    setCardIndex(idx >= 0 ? idx : 0);
    setActiveSongTrack(node.track);
    setSongCardMounted(true);
  }

  function handleCardIndexChange(i) {
    setCardIndex(i);
    setActiveSongTrack(sortedSongs[i].track);
  }

  function handleCardDismiss() {
    setActiveSongTrack(null);
  }

  function handleCardExited() {
    setSongCardMounted(false);
  }

  function handleVizClick() {
    if (isDesktop && desktopOverlayOpen) {
      onCloseOverlay?.();
      return;
    }
    if (isDesktop) {
      setDesktopClickedSong(null);
      return;
    }
    if (activeSongTrack == null) return;
    setActiveSongTrack(null);
    songCardRef.current?.close();
  }

  async function handleDownload() {
    const svgEl = vizRef.current;
    if (!svgEl || isDownloading) return;
    setIsDownloading(true);

    try {
      const W = 1170;
      const H = 2532;
      const renderW = Math.round(W * 1.16);
      const offsetX = -Math.round(W * 0.08);

      const vbParts = svgEl.getAttribute('viewBox').split(' ').map(Number);
      const vbW = vbParts[2];
      const vbH = vbParts[3];

      const scale = renderW / vbW;
      const contentH = Math.round(vbH * scale);
      const contentOffsetY = Math.round(H * 0.55) - Math.round(contentH / 2);

      const clone = svgEl.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', renderW);
      clone.setAttribute('height', contentH);

      const svgString = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = W;
          canvas.height = H;
          const ctx = canvas.getContext('2d');

          ctx.fillStyle = palette.bg;
          ctx.fillRect(0, 0, W, H);
          ctx.drawImage(img, offsetX, contentOffsetY, renderW, contentH);
          URL.revokeObjectURL(svgUrl);

          canvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${album.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-wallpaper.png`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            resolve();
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = svgUrl;
      });
    } finally {
      setIsDownloading(false);
    }
  }

  // Viz shift: left when desktop overlay open, up when mobile song card active
  let vizTransform = 'translateY(0)';
  if (isDesktop && desktopOverlayOpen) {
    vizTransform = 'translateX(-15%)';
  } else if (!isDesktop && activeSongTrack != null) {
    vizTransform = 'translateY(-10%)';
  }

  const chromeHidden = isDesktop && desktopOverlayOpen;

  return (
    <div className="fixed inset-0 overflow-hidden bg-surface-0" style={{ animation: `${isExiting ? 'vizFadeOut' : 'vizFadeIn'} 0.2s ease both` }}>

      {/* Visualization — full bleed */}
      <div
        className="absolute inset-0"
        style={{ background: palette.bg }}
        onClick={handleVizClick}
      >
        <div style={{
          width: '116%',
          height: '100%',
          marginLeft: '-8%',
          transform: vizTransform,
          transition: 'transform 0.4s ease',
        }}>
          <Visualization
            ref={vizRef}
            album={album}
            palette={palette}
            activeSongTrack={isDesktop ? (desktopClickedSong?.track ?? null) : activeSongTrack}
            onFlowerClick={handleFlowerClick}
            animate
          />
        </div>
      </div>

      {/* ── MOBILE header ── */}
      <div
        className="lg:hidden absolute top-0 left-0 right-0 flex items-start pl-4 pr-6 pt-2 pb-12 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${palette.bg} 40%, transparent)` }}
      >
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center shrink-0 mt-1 pointer-events-auto"
          style={{ color: vizTextPrimary }}
        >
          <ArrowLeft size={26} />
        </button>
        <button onClick={onEditClick} className="flex-1 text-center px-3 mt-2 pointer-events-auto">
          <p className="font-serif text-title leading-tight" style={{ color: vizTextPrimary }}>{album.title}</p>
          <p className="font-mono text-caption mt-0.5" style={{ color: vizTextPrimary }}>{album.artist}</p>
        </button>
        <div className="w-7 shrink-0" />
      </div>

      {/* ── MOBILE bottom bar ── */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-16 flex items-center justify-between px-8">
        <button onClick={onInfoClick} style={{ color: vizTextPrimary }}><Info size={22} /></button>
        <button onClick={onPaletteClick} style={{ color: vizTextPrimary }}><Palette size={22} /></button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="disabled:opacity-40"
          style={{ color: vizTextPrimary }}
          title="Download as wallpaper"
        >
          <Download size={22} />
        </button>
      </div>

      {/* ── DESKTOP back arrow (top-left) ── */}
      <button
        onClick={handleBack}
        className="hidden lg:flex absolute top-6 left-6 z-10 w-10 h-10 items-center justify-center rounded-full"
        style={{
          color: vizTextPrimary,
          opacity: chromeHidden ? 0 : 1,
          pointerEvents: chromeHidden ? 'none' : 'auto',
          transition: 'opacity 0.25s ease',
        }}
      >
        <ArrowLeft size={26} />
      </button>

      {/* ── DESKTOP album info (left edge, vertically centered) ── */}
      <button
        onClick={onEditClick}
        className="hidden lg:flex absolute left-8 z-10 flex-col items-start"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          color: vizTextPrimary,
          maxWidth: '16rem',
          opacity: chromeHidden ? 0 : 1,
          pointerEvents: chromeHidden ? 'none' : 'auto',
          transition: 'opacity 0.25s ease',
        }}
      >
        <p className="font-serif leading-tight text-left" style={{ fontSize: '1.6rem' }}>{album.title}</p>
        <p className="font-mono text-label mt-1.5 text-left" style={{ color: vizTextPrimary }}>{album.artist}</p>
      </button>

      {/* ── DESKTOP right icon strip ── */}
      <div
        className="hidden lg:flex absolute right-6 z-10 flex-col items-center gap-8"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <button onClick={onInfoClick} style={{ color: vizTextPrimary }}><Info size={22} /></button>
        <button onClick={onPaletteClick} style={{ color: vizTextPrimary }}><Palette size={22} /></button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="disabled:opacity-40"
          style={{ color: vizTextPrimary }}
          title="Download as wallpaper"
        >
          <Download size={22} />
        </button>
      </div>

      {/* ── DESKTOP click-to-reveal song card ── */}
      {isDesktop && desktopClickedSong && (
        <DesktopSongCard
          song={desktopClickedSong}
          rect={desktopCardRect}
          onClose={() => setDesktopClickedSong(null)}
        />
      )}

      {/* ── MOBILE song card carousel ── */}
      {!isDesktop && songCardMounted && (
        <SongCard
          ref={songCardRef}
          songs={sortedSongs}
          activeIndex={cardIndex}
          onIndexChange={handleCardIndexChange}
          onDismiss={handleCardDismiss}
          onExited={handleCardExited}
        />
      )}
    </div>
  );
}
