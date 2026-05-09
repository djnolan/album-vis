import { useState, useRef } from 'react';
import { ArrowLeft, Info, Palette, Download } from 'lucide-react';
import Visualization from './Visualization';
import SongCard from './SongCard';
import { PALETTES } from '../data/palettes';

export default function VisualizationScreen({ album, paletteId, onBack, onPaletteClick, onInfoClick, onEditClick }) {
  const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  const lightBg = !!palette.lightBg;
  const [activeSongTrack, setActiveSongTrack] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const vizRef = useRef(null);

  const vizTextPrimary = lightBg ? '#0E1117' : '#F0F2F5';
  const vizTextSecondary = lightBg ? '#3A3F4A' : '#8B93A1';

  const sortedSongs = [...album.songs].sort((a, b) => a.track - b.track);

  function handleFlowerClick(node) {
    const idx = sortedSongs.findIndex(s => s.track === node.track);
    setCardIndex(idx >= 0 ? idx : 0);
    setActiveSongTrack(node.track);
  }

  function handleCardIndexChange(i) {
    setCardIndex(i);
    setActiveSongTrack(sortedSongs[i].track);
  }

  function handleDismiss() {
    setActiveSongTrack(null);
  }

  async function handleDownload() {
    const svgEl = vizRef.current;
    if (!svgEl || isDownloading) return;
    setIsDownloading(true);

    try {
      // iPhone 14 native resolution — looks great on any modern phone
      const W = 1170;
      const H = 2532;

      // Match the screen's 116% width treatment: render wider then clip sides
      const renderW = Math.round(W * 1.16);
      const offsetX = -Math.round(W * 0.08);

      // Read the SVG's viewBox to get exact content dimensions
      const vbParts = svgEl.getAttribute('viewBox').split(' ').map(Number);
      const vbW = vbParts[2];
      const vbH = vbParts[3];

      // Scale content to renderW width, compute exact content height
      const scale = renderW / vbW;
      const contentH = Math.round(vbH * scale);

      // Place the content center at exactly 55% from the top
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

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: palette.bg }}>
      {/* Header */}
      <div className="flex items-start pl-3 pr-6 pt-2 pb-2">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center shrink-0 mt-1"
          style={{ color: vizTextPrimary }}
        >
          <ArrowLeft size={26} />
        </button>
        <button onClick={onEditClick} className="flex-1 text-center px-3 mt-3">
          <p className="font-serif text-title leading-tight" style={{ color: vizTextPrimary }}>{album.title}</p>
          <p className="font-mono text-caption mt-0.5" style={{ color: vizTextSecondary }}>{album.artist}</p>
        </button>
        <div className="w-7 shrink-0" />
      </div>

      {/* Visualization */}
      <div
        className="flex-1 overflow-hidden"
        style={{ background: palette.bg }}
        onClick={activeSongTrack != null ? handleDismiss : undefined}
      >
        <div style={{ width: '116%', height: '100%', marginLeft: '-8%' }}>
          <Visualization
            ref={vizRef}
            album={album}
            palette={palette}
            activeSongTrack={activeSongTrack}
            onFlowerClick={handleFlowerClick}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-16 flex items-center justify-between px-8">
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

      {/* Song card */}
      {activeSongTrack != null && (
        <SongCard
          songs={sortedSongs}
          activeIndex={cardIndex}
          onIndexChange={handleCardIndexChange}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
