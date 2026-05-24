import { useState } from 'react';
import { X, Smartphone, Watch, Image as ImageIcon, Shirt } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';
import PrimaryButton from './PrimaryButton';

const FORMATS = [
  { id: 'wallpaper', Icon: Smartphone, label: 'Phone Wallpaper' },
  { id: 'watch',     Icon: Watch,       label: 'Watch Face' },
  { id: 'poster',    Icon: ImageIcon,   label: 'Poster',    secondary: '11 × 17"' },
  { id: 'tshirt',    Icon: Shirt,       label: 'T-Shirt',   getSecondary: p => `get this printed on a ${p.shirtLabel} t-shirt` },
];

function safeFilename(title) {
  return title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

function triggerDownload(canvas, filename) {
  canvas.toBlob(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }, 'image/png');
}

async function svgToImage(svgEl, renderW, renderH, { removeBg = false } = {}) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', renderW);
  clone.setAttribute('height', renderH);
  if (removeBg) {
    const bgRect = clone.querySelector('rect');
    if (bgRect) bgRect.remove();
  }
  const svgString = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
    img.src = url;
  });
}

function getVbDims(svgEl) {
  const parts = svgEl.getAttribute('viewBox').split(' ').map(Number);
  return { vbW: parts[2], vbH: parts[3] };
}

async function exportWallpaper(svgEl, album, palette) {
  const W = 1170, H = 2532;
  const renderW = Math.round(W * 1.16);
  const offsetX = -Math.round(W * 0.08);
  const { vbW, vbH } = getVbDims(svgEl);
  const scale = renderW / vbW;
  const renderH = Math.round(vbH * scale);
  const offsetY = Math.round(H * 0.55) - Math.round(renderH / 2);

  const img = await svgToImage(svgEl, renderW, renderH);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  triggerDownload(canvas, `${safeFilename(album.title)}-wallpaper.png`);
}

async function exportWatch(svgEl, album, palette) {
  const W = 396, H = 484;
  const renderW = Math.round(W * 1.1);
  const { vbW, vbH } = getVbDims(svgEl);
  const scale = renderW / vbW;
  const renderH = Math.round(vbH * scale);
  const offsetX = Math.round((W - renderW) / 2);
  const offsetY = Math.round((H - renderH) / 2);

  const img = await svgToImage(svgEl, renderW, renderH);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  triggerDownload(canvas, `${safeFilename(album.title)}-watch-face.png`);
}

async function exportPoster(svgEl, album, palette) {
  await document.fonts.ready;
  const W = 3300, H = 5100;
  const textColor = palette.lightBg ? '#0E1117' : '#F0F2F5';
  const subColor  = palette.lightBg ? '#3A3F4A' : '#8B93A1';

  const VIZ_AREA_H = Math.round(H * 0.63);
  const H_MARGIN = 300, V_MARGIN = 200;
  const availW = W - H_MARGIN * 2;
  const availH = VIZ_AREA_H - V_MARGIN * 2;

  const { vbW, vbH } = getVbDims(svgEl);
  const scale = Math.min(availW / vbW, availH / vbH);
  const vizW = Math.round(vbW * scale);
  const vizH = Math.round(vbH * scale);
  const vizX = Math.round((W - vizW) / 2);
  const vizY = V_MARGIN + Math.round((availH - vizH) / 2);

  const img = await svgToImage(svgEl, vizW, vizH);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, vizX, vizY, vizW, vizH);

  const textY = VIZ_AREA_H + 200;
  ctx.textAlign = 'center';

  ctx.font = '120px "Instrument Serif", Georgia, serif';
  ctx.fillStyle = textColor;
  ctx.fillText(album.title, W / 2, textY);

  ctx.font = '500 72px "DM Mono", "Courier New", monospace';
  ctx.fillStyle = subColor;
  ctx.fillText(album.artist.toUpperCase(), W / 2, textY + 130);

  const legendText = 'size = duration  ·  petals = tempo  ·  color = root note  ·  shape = accidental  ·  center = major/minor';
  ctx.font = '44px "DM Mono", "Courier New", monospace';
  ctx.fillStyle = subColor;
  // Shrink font if legend overflows
  let fontSize = 44;
  while (ctx.measureText(legendText).width > W - 200 && fontSize > 28) {
    fontSize -= 2;
    ctx.font = `${fontSize}px "DM Mono", "Courier New", monospace`;
  }
  ctx.fillText(legendText, W / 2, textY + 340);

  triggerDownload(canvas, `${safeFilename(album.title)}-poster.png`);
}

async function exportTShirt(svgEl, album, palette) {
  await document.fonts.ready;
  const W = 4500, H = 5400;
  const textColor = palette.lightBg ? '#0E1117' : '#F0F2F5';
  const subColor  = palette.lightBg ? '#3A3F4A' : '#8B93A1';

  const VIZ_AREA_H = Math.round(H * 0.62);
  const H_MARGIN = 350, V_MARGIN = 200;
  const availW = W - H_MARGIN * 2;
  const availH = VIZ_AREA_H - V_MARGIN * 2;

  const { vbW, vbH } = getVbDims(svgEl);
  const scale = Math.min(availW / vbW, availH / vbH);
  const vizW = Math.round(vbW * scale);
  const vizH = Math.round(vbH * scale);
  const vizX = Math.round((W - vizW) / 2);
  const vizY = V_MARGIN + Math.round((availH - vizH) / 2);

  const img = await svgToImage(svgEl, vizW, vizH, { removeBg: true });
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  // No background fill — transparent PNG
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, vizX, vizY, vizW, vizH);

  const textY = VIZ_AREA_H + 220;
  ctx.textAlign = 'center';

  ctx.font = '130px "Instrument Serif", Georgia, serif';
  ctx.fillStyle = textColor;
  ctx.fillText(album.title, W / 2, textY);

  ctx.font = '500 80px "DM Mono", "Courier New", monospace';
  ctx.fillStyle = subColor;
  ctx.fillText(album.artist.toUpperCase(), W / 2, textY + 150);

  triggerDownload(canvas, `${safeFilename(album.title)}-tshirt.png`);
}

async function runExport(format, svgEl, album, palette) {
  switch (format) {
    case 'wallpaper': return exportWallpaper(svgEl, album, palette);
    case 'watch':     return exportWatch(svgEl, album, palette);
    case 'poster':    return exportPoster(svgEl, album, palette);
    case 'tshirt':    return exportTShirt(svgEl, album, palette);
  }
}

function FormatButton({ fmt, palette, selected, onSelect }) {
  const { Icon, label, secondary, getSecondary } = fmt;
  const secondaryText = getSecondary ? getSecondary(palette) : secondary;
  const isSelected = selected === fmt.id;

  return (
    <button
      onClick={() => onSelect(fmt.id)}
      className="flex items-center gap-4 w-full px-5 py-4 rounded-md transition-colors"
      style={{
        background: isSelected ? 'rgba(123,159,212,0.15)' : 'transparent',
        border: `1.5px solid ${isSelected ? '#7B9FD4' : 'rgba(42,49,64,0.8)'}`,
      }}
    >
      <Icon
        size={22}
        style={{ color: isSelected ? '#7B9FD4' : '#8B93A1', flexShrink: 0 }}
      />
      <div className="flex flex-col items-start text-left">
        <span
          className="font-sans text-body font-medium leading-snug"
          style={{ color: isSelected ? '#F0F2F5' : '#8B93A1' }}
        >
          {label}
        </span>
        {secondaryText && (
          <span className="font-mono text-caption mt-0.5" style={{ color: '#525A68' }}>
            {secondaryText}
          </span>
        )}
      </div>
    </button>
  );
}

export default function DownloadOverlay({ onClose, vizRef, album, palette }) {
  useScrollLock(true);
  const { close, backdropStyle, sheetStyle } = useSheetAnimation(onClose, 'up');
  const [selected, setSelected] = useState('wallpaper');
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    const svgEl = vizRef.current;
    if (!svgEl || isDownloading) return;
    setIsDownloading(true);
    try {
      await runExport(selected, svgEl, album, palette);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75" style={backdropStyle} onClick={close} />
      <div
        className="relative bg-surface-1 rounded-t-lg flex flex-col"
        style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', ...sheetStyle }}
      >
        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">
            Download
          </h2>
          <button
            onClick={close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-6 flex flex-col gap-2">
          {FORMATS.map(fmt => (
            <FormatButton
              key={fmt.id}
              fmt={fmt}
              palette={palette}
              selected={selected}
              onSelect={setSelected}
            />
          ))}

          <div className="mt-3">
            <PrimaryButton onClick={handleDownload} className={isDownloading ? 'opacity-40' : ''}>
              {isDownloading ? 'Exporting…' : 'Download'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
