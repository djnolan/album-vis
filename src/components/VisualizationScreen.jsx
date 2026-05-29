import { useState, useRef } from 'react';
import { ArrowLeft, Info, Palette, Download, X } from 'lucide-react';
import Visualization from './Visualization';
import SongCard from './SongCard';
import DownloadOverlay from './DownloadOverlay';
import { PALETTES } from '../data/palettes';
import { useScrollLock } from '../hooks/useScrollLock';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { noOrphan } from '../utils/typography';
import grainSrc from '../assets/grain.jpg';

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

function DesktopSongCard({ song, pos, onClose }) {
  if (!song || !pos) return null;

  const { cx, cy, r } = pos;
  const CARD_H = 200;
  const OVERLAP = 12;

  // Prefer card to the right; flip left if it would overflow the viewport
  let left = cx + r - OVERLAP;
  if (left + CARD_W + 16 > window.innerWidth) {
    left = cx - r + OVERLAP - CARD_W;
  }
  left = Math.max(16, left);

  const top = Math.max(16, Math.min(cy - CARD_H / 2, window.innerHeight - CARD_H - 16));

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
            <p className="font-serif text-title" style={{ color: TOOLTIP_TEXT_PRIMARY }}>
              {noOrphan(song.name)}
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
  const [showDownload, setShowDownload] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  // Desktop click-to-reveal card state
  const [desktopClickedSong, setDesktopClickedSong] = useState(null);
  const [desktopCardPos, setDesktopCardPos] = useState(null);
  const vizRef = useRef(null);
  const songCardRef = useRef(null);

  function handleBack() {
    setIsExiting(true);
    setTimeout(onBack, 200);
  }

  const vizTextPrimary = lightBg ? '#0E1117' : '#F0F2F5';
  const vizTextSecondary = lightBg ? '#3A3F4A' : '#8B93A1';

  const sortedSongs = [...album.songs].sort((a, b) => a.track - b.track);

  function handleFlowerClick(node, pos) {
    if (isDesktop) {
      // Toggle: clicking the same flower again dismisses the card
      if (desktopClickedSong?.track === node.track) {
        setDesktopClickedSong(null);
      } else {
        setDesktopClickedSong(node);
        setDesktopCardPos(pos);
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
          transition: 'transform 460ms cubic-bezier(0.32, 0.72, 0, 1)',
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
          <p className="font-serif text-title" style={{ color: vizTextPrimary }}>{noOrphan(album.title)}</p>
          <p className="font-mono text-caption mt-0.5" style={{ color: vizTextPrimary }}>{album.artist}</p>
        </button>
        <div className="w-7 shrink-0" />
      </div>

      {/* ── MOBILE bottom bar ── */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-16 flex items-center justify-between px-8">
        <button onClick={onInfoClick} style={{ color: vizTextPrimary }}><Info size={22} /></button>
        <button onClick={onPaletteClick} style={{ color: vizTextPrimary }}><Palette size={22} /></button>
        <button onClick={() => setShowDownload(true)} style={{ color: vizTextPrimary }}>
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
        <p className="font-serif leading-[1.1] text-left" style={{ fontSize: '1.6rem' }}>{noOrphan(album.title)}</p>
        <p className="font-mono font-normal text-label mt-1.5 text-left" style={{ color: vizTextPrimary }}>{album.artist}</p>
      </button>

      {/* ── DESKTOP right icon strip ── */}
      <div
        className="hidden lg:flex absolute right-6 z-10 flex-col items-center gap-8"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <button onClick={onInfoClick} style={{ color: vizTextPrimary }}><Info size={22} /></button>
        <button onClick={onPaletteClick} style={{ color: vizTextPrimary }}><Palette size={22} /></button>
        <button onClick={() => setShowDownload(true)} style={{ color: vizTextPrimary }}>
          <Download size={22} />
        </button>
      </div>

      {/* ── DESKTOP click-to-reveal song card ── */}
      {isDesktop && desktopClickedSong && (
        <DesktopSongCard
          song={desktopClickedSong}
          pos={desktopCardPos}
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

      {/* ── Download format overlay ── */}
      {showDownload && (
        <DownloadOverlay
          onClose={() => setShowDownload(false)}
          vizRef={vizRef}
          album={album}
          palette={palette}
        />
      )}

      {/* ── Grain texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${grainSrc})`,
          backgroundSize: '300px 300px',
          mixBlendMode: 'overlay',
          opacity: 0.12,
        }}
      />
    </div>
  );
}
