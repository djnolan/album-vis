import { useState, useRef } from 'react';
import { ArrowLeft, Info, Palette, Download } from 'lucide-react';
import Visualization from './Visualization';
import SongCard from './SongCard';
import { PALETTES } from '../data/palettes';
import { useScrollLock } from '../hooks/useScrollLock';

export default function VisualizationScreen({ album, paletteId, onBack, onPaletteClick, onInfoClick, onEditClick }) {
  useScrollLock(true);
  const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  const lightBg = !!palette.lightBg;
  const [activeSongTrack, setActiveSongTrack] = useState(null);
  const [songCardMounted, setSongCardMounted] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [formatId, setFormatId] = useState('wallpaper');
  const vizRef = useRef(null);
  const songCardRef = useRef(null);

  function handleBack() {
    setIsExiting(true);
    setTimeout(onBack, 200);
  }

  const vizTextPrimary = lightBg ? '#0E1117' : '#F0F2F5';
  const vizTextSecondary = lightBg ? '#3A3F4A' : '#8B93A1';

  const sortedSongs = [...album.songs].sort((a, b) => a.track - b.track);

  function handleFlowerClick(node) {
    const idx = sortedSongs.findIndex(s => s.track === node.track);
    setCardIndex(idx >= 0 ? idx : 0);
    setActiveSongTrack(node.track);
    setSongCardMounted(true);
  }

  function handleCardIndexChange(i) {
    setCardIndex(i);
    setActiveSongTrack(sortedSongs[i].track);
  }

  // Called by SongCard's internal close — shifts viz back immediately
  function handleCardDismiss() {
    setActiveSongTrack(null);
  }

  // Called after SongCard exit animation completes
  function handleCardExited() {
    setSongCardMounted(false);
  }

  // Tapping the viz backdrop — shift viz + animate card out simultaneously
  function handleVizClick() {
    if (activeSongTrack == null) return;
    setActiveSongTrack(null);
    songCardRef.current?.close();
  }

  async function handleDownload() {
    const svgEl = vizRef.current;
    if (!svgEl || isDownloading) return;
    setIsDownloading(true);
    setShowFormatPicker(false);

    try {
      const vbParts = svgEl.getAttribute('viewBox').split(' ').map(Number);
      const vbW = vbParts[2];
      const vbH = vbParts[3];

      let W, H, renderW, offsetX, contentOffsetY, bgColor, suffix;

      if (formatId === 'wallpaper') {
        W = 1170; H = 2532;
        renderW = Math.round(W * 1.16);
        offsetX = -Math.round(W * 0.08);
        const scale = renderW / vbW;
        contentOffsetY = Math.round(H * 0.55) - Math.round(vbH * scale / 2);
        bgColor = palette.bg; suffix = 'wallpaper';
      } else if (formatId === 'watch') {
        W = 396; H = 484;
        renderW = Math.round(W * 1.10);
        offsetX = -Math.round((renderW - W) / 2);
        const scale = renderW / vbW;
        contentOffsetY = Math.round((H - vbH * scale) / 2);
        bgColor = palette.bg; suffix = 'watchface';
      } else if (formatId === 'poster') {
        W = 3300; H = 5100;
        const scale = Math.min((W - 600) / vbW, (H * 0.55) / vbH);
        renderW = Math.round(vbW * scale);
        offsetX = Math.round((W - renderW) / 2);
        contentOffsetY = 300;
        bgColor = palette.bg; suffix = 'poster';
      } else {
        W = 4500; H = 5400;
        const scale = Math.min((W - 600) / vbW, (H * 0.65) / vbH);
        renderW = Math.round(vbW * scale);
        offsetX = Math.round((W - renderW) / 2);
        contentOffsetY = 200;
        bgColor = palette.bg; suffix = 'tshirt';
      }

      const contentH = Math.round(vbH * (renderW / vbW));

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

          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, W, H);
          ctx.drawImage(img, offsetX, contentOffsetY, renderW, contentH);
          URL.revokeObjectURL(svgUrl);

          canvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${album.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${suffix}.png`;
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

  return (
    <div className="fixed inset-0 overflow-hidden bg-surface-0" style={{ animation: `${isExiting ? 'vizFadeOut' : 'vizFadeIn'} 0.2s ease both` }}>

      {/* Visualization — full bleed behind header */}
      <div
        className="absolute inset-0"
        style={{ background: palette.bg }}
        onClick={handleVizClick}
      >
        <div style={{
          width: '116%',
          height: '100%',
          marginLeft: '-8%',
          transform: activeSongTrack != null ? 'translateY(-10%)' : 'translateY(0)',
          transition: 'transform 0.35s ease',
        }}>
          <Visualization
            ref={vizRef}
            album={album}
            palette={palette}
            activeSongTrack={activeSongTrack}
            onFlowerClick={handleFlowerClick}
            animate
          />
        </div>
      </div>

      {/* Header — floats over viz with gradient fade */}
      <div
        className="absolute top-0 left-0 right-0 flex items-start pl-4 pr-6 pt-2 pb-12 pointer-events-none"
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

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-between px-8">
        <button onClick={onInfoClick} style={{ color: vizTextPrimary }}><Info size={22} /></button>
        <button onClick={onPaletteClick} style={{ color: vizTextPrimary }}><Palette size={22} /></button>
        <button
          onClick={() => setShowFormatPicker(true)}
          disabled={isDownloading}
          className="disabled:opacity-40"
          style={{ color: vizTextPrimary }}
          title="Save visualization"
        >
          <Download size={22} />
        </button>
      </div>

      {/* Format picker */}
      {showFormatPicker && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          onClick={() => setShowFormatPicker(false)}
        >
          <div
            className="bg-surface-1 rounded-t-xl px-6 pt-6 pb-10 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="font-mono text-label uppercase tracking-widest" style={{ color: '#8B93A1' }}>Save as</p>
            <div className="flex flex-col gap-2">
              {[
                { id: 'wallpaper', label: 'Phone Wallpaper' },
                { id: 'watch',     label: 'Watch Face' },
                { id: 'poster',    label: 'Poster (11×17")' },
                { id: 'tshirt',    label: 'T-Shirt Print' },
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setFormatId(fmt.id)}
                  className="text-left px-4 py-3 rounded-lg font-sans text-body"
                  style={{
                    background: formatId === fmt.id ? 'rgba(123,159,212,0.15)' : 'transparent',
                    color: formatId === fmt.id ? '#7B9FD4' : '#F0F2F5',
                    border: `1.5px solid ${formatId === fmt.id ? '#7B9FD4' : 'transparent'}`,
                  }}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-4 rounded-lg font-sans text-body font-bold disabled:opacity-40"
              style={{ background: '#7B9FD4', color: '#0E1117' }}
            >
              {isDownloading ? 'Downloading…' : 'Download'}
            </button>
          </div>
        </div>
      )}

      {/* Song card */}
      {songCardMounted && (
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
