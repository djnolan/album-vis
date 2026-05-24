import { useState, useRef } from 'react';
import { ArrowLeft, Info, Palette, Download } from 'lucide-react';
import Visualization from './Visualization';
import DownloadOverlay from './DownloadOverlay';
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
      await document.fonts.ready;
      const vbParts = svgEl.getAttribute('viewBox').split(' ').map(Number);
      const vbW = vbParts[2];
      const vbH = vbParts[3];

      const clone = svgEl.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      if (formatId === 'wallpaper') {
        const W = 1170, H = 2532;
        const renderW = Math.round(W * 1.16);
        const offsetX = -Math.round(W * 0.08);
        const scale = renderW / vbW;
        const contentH = Math.round(vbH * scale);
        const contentOffsetY = Math.round(H * 0.55) - Math.round(contentH / 2);

        clone.setAttribute('width', renderW);
        clone.setAttribute('height', contentH);
        const svgString = new XMLSerializer().serializeToString(clone);
        const svgUrl = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
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

      } else if (formatId === 'watch') {
        const W = 800, H = 978;
        const renderW = Math.round(W * 1.10);
        const offsetX = -Math.round((renderW - W) / 2);
        const scale = renderW / vbW;
        const contentH = Math.round(vbH * scale);
        const contentOffsetY = Math.round((H - contentH) / 2);

        clone.setAttribute('width', renderW);
        clone.setAttribute('height', contentH);
        const svgString = new XMLSerializer().serializeToString(clone);
        const svgUrl = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, W, H);
            ctx.drawImage(img, offsetX, contentOffsetY, renderW, contentH);
            URL.revokeObjectURL(svgUrl);
            canvas.toBlob(blob => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${album.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-watchface.png`;
              link.click();
              setTimeout(() => URL.revokeObjectURL(link.href), 1000);
              resolve();
            }, 'image/png');
          };
          img.onerror = reject;
          img.src = svgUrl;
        });

      } else if (formatId === 'poster') {
        const W = 3300, H = 5100;
        const scale = Math.min((W - 600) / vbW, (H * 0.52) / vbH);
        const renderW = Math.round(vbW * scale);
        const contentH = Math.round(vbH * scale);
        const offsetX = Math.round((W - renderW) / 2);
        const contentOffsetY = 300;

        clone.setAttribute('width', renderW);
        clone.setAttribute('height', contentH);
        const svgString = new XMLSerializer().serializeToString(clone);
        const svgUrl = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, W, H);
            ctx.drawImage(img, offsetX, contentOffsetY, renderW, contentH);
            URL.revokeObjectURL(svgUrl);

            const textColor = palette.lightBg ? '#0E1117' : '#F0F2F5';
            const textSecondary = palette.lightBg ? 'rgba(14,17,23,0.55)' : 'rgba(240,242,245,0.55)';
            let y = contentOffsetY + contentH + 120;

            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.font = `italic 96px "Instrument Serif", serif`;
            ctx.fillText(album.title, W / 2, y);
            y += 80;

            ctx.font = `48px "DM Mono", monospace`;
            ctx.fillStyle = textSecondary;
            ctx.fillText(album.artist, W / 2, y);
            y += 120;

            // Legend: key → color samples
            const noteColors = palette.colorStart && palette.colorEnd
              ? sortedSongs.reduce((acc, s) => {
                  const key = s.key + (s.accidental === 'sharp' ? '♯' : s.accidental === 'flat' ? '♭' : '');
                  if (!acc.some(e => e.label === key)) acc.push({ label: key, mode: s.mode });
                  return acc;
                }, [])
              : [];

            if (noteColors.length) {
              const dotR = 18;
              const lineH = 76;
              const cols = Math.min(noteColors.length, 4);
              const colW = 560;
              const totalW = cols * colW;
              const startX = (W - totalW) / 2 + colW / 2;
              ctx.font = `30px "DM Mono", monospace`;
              ctx.fillStyle = textSecondary;
              noteColors.slice(0, 8).forEach((entry, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const ex = startX + col * colW;
                const ey = y + row * lineH;
                ctx.textAlign = 'left';
                ctx.fillText(`${entry.label} ${entry.mode}`, ex - colW / 2 + dotR * 2 + 20, ey + 10);
              });
            }

            canvas.toBlob(blob => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${album.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-poster.png`;
              link.click();
              setTimeout(() => URL.revokeObjectURL(link.href), 1000);
              resolve();
            }, 'image/png');
          };
          img.onerror = reject;
          img.src = svgUrl;
        });

      } else {
        // T-shirt: transparent bg, tight crop, title + artist text
        const W = 3000;
        const scale = Math.min((W * 0.80) / vbW, 1800 / vbH);
        const renderW = Math.round(vbW * scale);
        const contentH = Math.round(vbH * scale);
        const offsetX = Math.round((W - renderW) / 2);
        const contentOffsetY = 100;
        const titleSize = 120, artistSize = 76;
        const H = contentOffsetY + contentH + 80 + titleSize + 40 + artistSize + 160;

        clone.setAttribute('width', renderW);
        clone.setAttribute('height', contentH);
        const svgString = new XMLSerializer().serializeToString(clone);
        const svgUrl = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            // transparent background — no fillRect
            ctx.drawImage(img, offsetX, contentOffsetY, renderW, contentH);
            URL.revokeObjectURL(svgUrl);

            const textColor = palette.lightBg ? '#0E1117' : '#F0F2F5';
            const textSecondary = palette.lightBg ? 'rgba(14,17,23,0.55)' : 'rgba(240,242,245,0.55)';

            let y = contentOffsetY + contentH + 80 + titleSize;
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.font = `italic ${titleSize}px "Instrument Serif", serif`;
            ctx.fillText(album.title, W / 2, y);
            y += 40 + artistSize;
            ctx.font = `${artistSize}px "DM Mono", monospace`;
            ctx.fillStyle = textSecondary;
            ctx.fillText(album.artist, W / 2, y);

            canvas.toBlob(blob => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${album.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-tshirt.png`;
              link.click();
              setTimeout(() => URL.revokeObjectURL(link.href), 1000);
              resolve();
            }, 'image/png');
          };
          img.onerror = reject;
          img.src = svgUrl;
        });
      }
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

      {showFormatPicker && (
        <DownloadOverlay
          formatId={formatId}
          onFormatChange={setFormatId}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          onClose={() => setShowFormatPicker(false)}
        />
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
