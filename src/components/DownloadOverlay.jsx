import { useState } from 'react';
import { X, Smartphone, Watch, Image as ImageIcon, Shirt } from 'lucide-react';
import { NATURAL_PETALS, SHARP_PETALS, FLAT_PETALS, MAJOR_PATH, MINOR_PATH } from '../data/petalPaths';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';
import PrimaryButton from './PrimaryButton';

// ── Flower rendering utilities (mirrors LegendOverlay logic for canvas export) ──

function parseBBox(d) {
  const nums = d.match(/[-+]?\d*\.?\d+/g).map(Number);
  const xs = [], ys = [];
  for (let i = 0; i < nums.length - 1; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    w:  Math.max(...xs) - Math.min(...xs),
    h:  Math.max(...ys) - Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function seededRand(seed) {
  let s = Math.max(1, Math.round(Math.abs(seed)) % 2147483647);
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function hexToRgb(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}

function lerpColor(a, b, t) {
  const [r1,g1,b1] = hexToRgb(a);
  const [r2,g2,b2] = hexToRgb(b);
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
}

function luminance(hex) {
  try {
    const [r,g,b] = hexToRgb(hex).map(v => {
      v /= 255;
      return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  } catch { return 0; }
}

function resolveFlowerColor(colorStart, colorEnd) {
  if (!colorStart || !colorEnd) return '#F0F2F5';
  try {
    const mid = lerpColor(colorStart, colorEnd, 0.5);
    return luminance(colorEnd) > 0.08 ? mid : '#F0F2F5';
  } catch { return '#F0F2F5'; }
}

function buildNoteColors(colorStart, colorEnd) {
  const T = { C:0/11, D:2/11, E:4/11, F:5/11, G:7/11, A:9/11, B:11/11 };
  return ['C','D','E','F','G','A','B'].map(n => lerpColor(colorStart, colorEnd, T[n]));
}

function miniFlowerSvg(size, petalCount, accidental, mode, color, bgColor, seed, globalRotation) {
  const cx = size/2, cy = size/2;
  const cutR    = size * 0.09;
  const centerR = accidental === 'natural' ? size * 0.09 : size * 0.14;
  const armLength = size * 0.42;
  const library = accidental === 'sharp' ? SHARP_PETALS : accidental === 'flat' ? FLAT_PETALS : NATURAL_PETALS;
  const rawW = Math.sqrt(9 / petalCount);
  const widthScale = accidental === 'sharp' && petalCount <= 5 ? Math.min(rawW, 1.15) : rawW;
  const rand = seededRand(seed);
  const cutoutD = mode === 'major' ? MAJOR_PATH : MINOR_PATH;
  const cbb = parseBBox(cutoutD);
  const cutScale = (cutR * 2) / Math.max(cbb.w, cbb.h);
  const cutRotation = Math.round(rand() * 360);

  const petals = Array.from({ length: petalCount }, (_, i) => {
    const d   = library[i % library.length];
    const bb  = parseBBox(d);
    const scaleY = armLength / bb.h;
    const scaleX = scaleY * widthScale;
    const jitterRange = accidental === 'sharp' && petalCount <= 5 ? 6 : 12;
    const jitter = (rand() - 0.5) * jitterRange;
    const angleDeg = (i / petalCount) * 360 + jitter;
    const baseY = accidental === 'sharp' ? bb.maxY + bb.h * 0.06 : bb.maxY;
    return `<g transform="translate(${cx},${cy}) rotate(${angleDeg}) scale(${scaleX},${scaleY}) translate(${-bb.cx},${-baseY})"><path d="${d}" fill="${color}"/></g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><g transform="rotate(${globalRotation},${cx},${cy})">${petals}<circle cx="${cx}" cy="${cy}" r="${centerR}" fill="${color}"/><g transform="translate(${cx},${cy}) rotate(${cutRotation}) scale(${cutScale}) translate(${-cbb.cx},${-cbb.cy})"><path d="${cutoutD}" fill="${bgColor}"/></g></g></svg>`;
}

async function loadMiniFlower(size, petalCount, accidental, mode, color, bgColor, seed, globalRotation) {
  const svg  = miniFlowerSvg(size, petalCount, accidental, mode, color, bgColor, seed, globalRotation);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('mini flower failed')); };
    img.src = url;
  });
}

// ── Canvas text helpers ────────────────────────────────────────────────────────

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = word;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, curY);
  return curY;
}

// ── Shared export utilities ────────────────────────────────────────────────────

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
  const url  = URL.createObjectURL(blob);
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

// ── Format export functions ────────────────────────────────────────────────────

async function exportWallpaper(svgEl, album, palette) {
  const W = 1170, H = 2532;
  const renderW = Math.round(W * 1.16);
  const offsetX = -Math.round(W * 0.08);
  const { vbW, vbH } = getVbDims(svgEl);
  const scale   = renderW / vbW;
  const renderH = Math.round(vbH * scale);
  const offsetY = Math.round(H * 0.55) - Math.round(renderH / 2);

  const img    = await svgToImage(svgEl, renderW, renderH);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  triggerDownload(canvas, `${safeFilename(album.title)}-wallpaper.png`);
}

async function exportWatch(svgEl, album, palette) {
  const W = 1584, H = 1936;  // 4× the 396×484 screen size
  const renderW = Math.round(W * 1.1);
  const { vbW, vbH } = getVbDims(svgEl);
  const scale   = renderW / vbW;
  const renderH = Math.round(vbH * scale);
  const offsetX = Math.round((W - renderW) / 2);
  const offsetY = Math.round((H - renderH) / 2);

  const img    = await svgToImage(svgEl, renderW, renderH);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  triggerDownload(canvas, `${safeFilename(album.title)}-watch-face.png`);
}

async function exportPoster(svgEl, album, palette) {
  // ── Canvas & margin ────────────────────────────────────────────────────────
  const W = 3300, H = 5100;
  const MARGIN    = 150;
  const CONTENT_W = W - 2*MARGIN;

  // ── Colors: rgba 0.9 (strong) or 0.6 (muted) ──────────────────────────────
  const isLight = !!palette.lightBg;
  const strong = isLight ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)';
  const muted  = isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
  const border = isLight ? 'rgba(0,0,0,0.2)'  : 'rgba(255,255,255,0.2)';

  // ── Font sizes ────────────────────────────────────────────────────────────
  const TITLE_SIZE          = 32;
  const ARTIST_SIZE         = 23;
  const LEGEND_HEADING_SIZE = 17;
  const HEAD_SIZE           = 13;
  const BLURB_SIZE          = 10;
  const LABEL_SIZE          = 10;

  // ── Flower sizes ──────────────────────────────────────────────────────────
  const COLOR_FLOWER  = 28;
  const SHAPE_FLOWER  = 36;
  const CENTER_FLOWER = 44;
  const BLURB_LINE_H  = 14;

  // ── Bottom two-column section (album left, legend right) ──────────────────
  // Working backwards from H − MARGIN: legend title + gap + items
  const BOTTOM_SECTION_TOP = 4750;

  // Album block — bottom-left
  const TITLE_BASELINE  = BOTTOM_SECTION_TOP + TITLE_SIZE;
  const ARTIST_BASELINE = TITLE_BASELINE + Math.round(ARTIST_SIZE * 1.6);  // +37

  // Legend block — bottom-right, right edge flush with W − MARGIN
  const COL_GAP         = 16;
  const COL_W           = 350;
  const LEGEND_LEFT     = W - MARGIN - (5 * COL_W + 4 * COL_GAP);  // 1336

  const LEGEND_HEADING_Y = BOTTOM_SECTION_TOP + LEGEND_HEADING_SIZE;  // 4767
  const COL_BORDER_TOP   = LEGEND_HEADING_Y + 28;                     // 4795

  // No inner padding — text starts at colX
  const LEGEND_HEAD_Y      = COL_BORDER_TOP + 8 + HEAD_SIZE;          // 4816
  const LEGEND_BLURB_Y     = LEGEND_HEAD_Y + 14;                      // 4830
  // Graphics pinned from poster bottom so they align across columns
  const LEGEND_GRAPHIC_TOP = H - MARGIN - CENTER_FLOWER - LABEL_SIZE - 14;  // 4872

  // ── Visualization — no top header, so starts near top of poster ───────────
  const VIZ_TOP     = MARGIN + 30;             // 180
  const VIZ_BOTTOM  = BOTTOM_SECTION_TOP - 40; // 4710
  const VIZ_AVAIL_H = VIZ_BOTTOM - VIZ_TOP;   // 4530

  // ── Load fonts ────────────────────────────────────────────────────────────
  await Promise.all([
    document.fonts.load(`${TITLE_SIZE}px "Instrument Serif"`),
    document.fonts.load(`${LEGEND_HEADING_SIZE}px "Instrument Serif"`),
    document.fonts.load(`500 ${ARTIST_SIZE}px "DM Mono"`),
    document.fonts.load(`500 ${HEAD_SIZE}px "DM Mono"`),
    document.fonts.load(`${BLURB_SIZE}px "DM Mono"`),
    document.fonts.load(`${LABEL_SIZE}px "DM Mono"`),
  ]);

  // ── Compute viz scale ─────────────────────────────────────────────────────
  const { vbW, vbH } = getVbDims(svgEl);
  const vizScale = CONTENT_W / vbW;          // always fill full width
  const vizW = CONTENT_W;
  const vizH = Math.round(vbH * vizScale);
  const vizX = MARGIN;
  const vizY = VIZ_TOP;                       // pin to top, not vertically centered

  // ── Load all assets in parallel ───────────────────────────────────────────
  const flowerColor = resolveFlowerColor(palette.colorStart, palette.colorEnd);
  const noteColors  = buildNoteColors(palette.colorStart, palette.colorEnd);
  const NOTES       = ['C','D','E','F','G','A','B'];

  const [vizImg, ...legendImgs] = await Promise.all([
    svgToImage(svgEl, vizW, vizH),
    ...noteColors.map((c, i) => loadMiniFlower(COLOR_FLOWER,  6, 'natural', 'major', c,           palette.bg, i*3+1, i*17)),
    loadMiniFlower(SHAPE_FLOWER,  6, 'natural', 'major', flowerColor, palette.bg, 2,  20),
    loadMiniFlower(SHAPE_FLOWER,  6, 'sharp',   'major', flowerColor, palette.bg, 6,  15),
    loadMiniFlower(SHAPE_FLOWER,  6, 'flat',    'major', flowerColor, palette.bg, 10, 15),
    loadMiniFlower(CENTER_FLOWER, 6, 'natural', 'major', flowerColor, palette.bg, 4,  10),
    loadMiniFlower(CENTER_FLOWER, 6, 'natural', 'minor', flowerColor, palette.bg, 8,  10),
  ]);

  const colorFlowers  = legendImgs.slice(0, 7);
  const shapeFlowers  = legendImgs.slice(7, 10);
  const centerFlowers = legendImgs.slice(10, 12);

  // ── Draw canvas ────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.drawImage(vizImg, vizX, vizY, vizW, vizH);

  // ── Album block — bottom-left ─────────────────────────────────────────────
  ctx.textAlign = 'left';
  ctx.font      = `${TITLE_SIZE}px "Instrument Serif", Georgia, serif`;
  ctx.fillStyle = strong;
  ctx.fillText(album.title, MARGIN, TITLE_BASELINE);

  ctx.font      = `500 ${ARTIST_SIZE}px "DM Mono", "Courier New", monospace`;
  ctx.fillStyle = muted;
  ctx.fillText(album.artist, MARGIN, ARTIST_BASELINE);

  // ── Legend block — bottom-right, right edge flush with W − MARGIN ─────────
  ctx.font      = `${LEGEND_HEADING_SIZE}px "Instrument Serif", Georgia, serif`;
  ctx.fillStyle = strong;
  ctx.textAlign = 'left';
  ctx.fillText('Each flower represents a song', LEGEND_LEFT, LEGEND_HEADING_Y);

  const legendItems = [
    { heading: 'Size = Duration',    blurb: "The size of the flower is based on the song's length.",              graphic: null },
    { heading: 'Petals = Tempo',     blurb: "The number of petals reflects the song's beats per minute.",        graphic: null },
    { heading: 'Color = Root Note',  blurb: "The color of the flower shows the root note of the song's key.",    graphic: { flowers: colorFlowers,  labels: NOTES,                       size: COLOR_FLOWER,  gap: 4  } },
    { heading: 'Shape = Accidental', blurb: "The petal shape shows whether the key is natural, sharp, or flat.", graphic: { flowers: shapeFlowers,  labels: ['natural', 'sharp', 'flat'], size: SHAPE_FLOWER,  gap: 14 } },
    { heading: 'Center = Key Type',  blurb: "The center cutout shows whether the song is in a major or minor key.", graphic: { flowers: centerFlowers, labels: ['major', 'minor'],          size: CENTER_FLOWER, gap: 14 } },
  ];

  for (let col = 0; col < 5; col++) {
    const colX = LEGEND_LEFT + col * (COL_W + COL_GAP);
    const { heading, blurb, graphic } = legendItems[col];

    // Top border only
    ctx.strokeStyle = border;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(colX, COL_BORDER_TOP);
    ctx.lineTo(colX + COL_W, COL_BORDER_TOP);
    ctx.stroke();

    // Heading — strong, no inner padding
    ctx.font      = `500 ${HEAD_SIZE}px "DM Mono", "Courier New", monospace`;
    ctx.fillStyle = strong;
    ctx.textAlign = 'left';
    ctx.fillText(heading.toUpperCase(), colX, LEGEND_HEAD_Y);

    // Blurb — muted
    ctx.font      = `${BLURB_SIZE}px "DM Mono", "Courier New", monospace`;
    ctx.fillStyle = muted;
    wrapText(ctx, blurb, colX, LEGEND_BLURB_Y, COL_W, BLURB_LINE_H);

    // Graphic — pinned to poster bottom, left-aligned to colX
    if (graphic) {
      const { flowers, labels, size: fSize, gap } = graphic;
      for (let i = 0; i < flowers.length; i++) {
        const fx = colX + i * (fSize + gap);
        ctx.drawImage(flowers[i], fx, LEGEND_GRAPHIC_TOP, fSize, fSize);
        ctx.font      = `${LABEL_SIZE}px "DM Mono", "Courier New", monospace`;
        ctx.fillStyle = muted;
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], fx + fSize / 2, LEGEND_GRAPHIC_TOP + fSize + LABEL_SIZE + 4);
      }
    }
  }

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
  const vizW  = Math.round(vbW * scale);
  const vizH  = Math.round(vbH * scale);
  const vizX  = Math.round((W - vizW) / 2);
  const vizY  = V_MARGIN + Math.round((availH - vizH) / 2);

  const img    = await svgToImage(svgEl, vizW, vizH, { removeBg: true });
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, vizX, vizY, vizW, vizH);

  const textY = VIZ_AREA_H + 220;
  ctx.textAlign = 'center';

  ctx.font = '130px "Instrument Serif", Georgia, serif';
  ctx.fillStyle = textColor;
  ctx.fillText(album.title, W / 2, textY);

  ctx.font = '500 80px "DM Mono", "Courier New", monospace';
  ctx.fillStyle = subColor;
  ctx.fillText(album.artist, W / 2, textY + 150);

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

// ── UI components ──────────────────────────────────────────────────────────────

function FormatButton({ fmt, palette, selected, onSelect }) {
  const { Icon, label, secondary, getSecondary } = fmt;
  const secondaryText = getSecondary ? getSecondary(palette) : secondary;
  const isSelected    = selected === fmt.id;

  return (
    <button
      onClick={() => onSelect(fmt.id)}
      className="flex items-center gap-4 w-full px-5 py-4 rounded-md transition-colors"
      style={{
        background: isSelected ? 'rgba(123,159,212,0.15)' : 'transparent',
        border: `1.5px solid ${isSelected ? '#7B9FD4' : 'rgba(42,49,64,0.8)'}`,
      }}
    >
      <Icon size={22} style={{ color: isSelected ? '#7B9FD4' : '#8B93A1', flexShrink: 0 }} />
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
  const [selected, setSelected]         = useState('wallpaper');
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
