import { useState } from 'react';
import { X, Smartphone, Watch, Scroll, Shirt } from 'lucide-react';
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
  { id: 'watch',     Icon: Watch,      label: 'Watch Face' },
  { id: 'poster',    Icon: Scroll,     label: 'Poster',    blurb: '13 × 19 inch poster' },
  { id: 'tshirt',    Icon: Shirt,      label: 'T-Shirt',   getBlurb: p => `Print this on a ${p.shirtLabel} t-shirt` },
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

// ── Cutout mask — for punching transparent holes in the t-shirt export ────────
//
// Identifies flower-centre cutout paths by their fill colour (palette.bg) and
// renders them as solid black on a transparent field.  Everything else is set
// to fill="none".  The resulting image is then drawn onto the main canvas with
// globalCompositeOperation='destination-out' to erase those pixels to true
// transparency — without changing Flower.jsx or any live rendering logic.

async function buildCutoutMask(svgEl, renderW, renderH, bgHex) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', renderW);
  clone.setAttribute('height', renderH);

  // Remove background rect
  const bgRect = clone.querySelector('rect');
  if (bgRect) bgRect.remove();

  // Strip CSS animation/transition styles (SVG transform attrs are unaffected)
  clone.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));

  // Cutout paths carry fill === palette.bg; petal/circle fills come from d3
  // as rgb() strings so the comparison is precise with zero false positives.
  const bgLower = bgHex.toLowerCase();
  clone.querySelectorAll('[fill]').forEach(el => {
    const fill = el.getAttribute('fill');
    if (fill && fill.toLowerCase() === bgLower) {
      el.setAttribute('fill', '#000000');
    } else {
      el.setAttribute('fill', 'none');
      el.removeAttribute('stroke');
    }
  });

  const svgString = new XMLSerializer().serializeToString(clone);
  const blob      = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url       = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img   = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('cutout mask failed')); };
    img.src = url;
  });
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
  // ── DPI & points conversion ────────────────────────────────────────────────
  const DPI = 300;
  const P   = DPI / 72;  // 1 typographic point in canvas pixels (~4.167 at 300 DPI)

  // ── Canvas: 13×19", ¾" margin ─────────────────────────────────────────────
  const W = 13 * DPI, H = 19 * DPI;  // 3900 × 5700
  const MARGIN    = Math.round(0.75 * DPI);  // 225px
  const CONTENT_W = W - 2 * MARGIN;          // 3450px

  // ── Colors ────────────────────────────────────────────────────────────────
  const isLight = !!palette.lightBg;
  const strong = isLight ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)';
  const muted  = isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
  const border = isLight ? 'rgba(0,0,0,0.2)'  : 'rgba(255,255,255,0.2)';

  // ── Font sizes (pt → canvas px) ───────────────────────────────────────────
  const TITLE_SIZE          = Math.round(20 * P);  //  ~83px — album title
  const LEGEND_HEADING_SIZE = Math.round(13 * P);  //  ~54px — "Each flower…"
  const ARTIST_SIZE         = Math.round(10 * P);  //  ~42px — artist name
  const HEAD_SIZE           = Math.round(8  * P);  //  ~33px — legend item headings
  const BLURB_SIZE          = Math.round(8  * P);  //  ~33px — blurb text
  const LABEL_SIZE          = Math.round(7  * P);  //  ~29px — flower labels

  // ── Flower sizes (pt → canvas px, ≥1.5× previous) ────────────────────────
  const COLOR_FLOWER  = Math.round(15 * P);  // ~63px (was 10pt)
  const SHAPE_FLOWER  = Math.round(23 * P);  // ~96px (was 15pt)
  const CENTER_FLOWER = Math.round(23 * P);  // ~96px (was 15pt)
  const BLURB_LINE_H  = Math.round(BLURB_SIZE * 1.2);  // tighter line height

  // ── 5-column grid spanning full content width ─────────────────────────────
  const COL_GAP    = Math.round(24 * P);  // 1.5× previous
  const GRID_COL_W = Math.round((CONTENT_W - 4 * COL_GAP) / 5);
  const gridX      = col => MARGIN + (col - 1) * (GRID_COL_W + COL_GAP);

  // ── Layout gaps (pt → canvas px) ──────────────────────────────────────────
  const G_TITLE_TO_BORDER  = Math.round(20 * P);  // more space under legend title
  const G_BORDER_TO_HEAD   = Math.round(6  * P);
  const G_HEAD_TO_BLURB    = Math.round(15 * P);  // margin under item headings
  const G_BLURB_TO_GRAPHIC = Math.round(14 * P);  // more space above flower groups
  const G_LABEL_GAP        = Math.round(2  * P);
  const G_BOTTOM_PAD       = Math.round(8  * P);

  // ── Bottom section: height computed from content, pinned to bottom margin ─
  const SECTION_H =
    LEGEND_HEADING_SIZE + G_TITLE_TO_BORDER + G_BORDER_TO_HEAD +
    HEAD_SIZE + G_HEAD_TO_BLURB +
    2 * BLURB_LINE_H + G_BLURB_TO_GRAPHIC +
    CENTER_FLOWER + G_LABEL_GAP + LABEL_SIZE + G_BOTTOM_PAD;

  const BOTTOM_SECTION_TOP = H - MARGIN - SECTION_H;

  // Album/artist — top-right
  const TITLE_BASELINE  = MARGIN + TITLE_SIZE;
  const ARTIST_BASELINE = TITLE_BASELINE + Math.round(ARTIST_SIZE * 1.6);

  const LEGEND_HEADING_Y = BOTTOM_SECTION_TOP + LEGEND_HEADING_SIZE;
  const COL_BORDER_TOP   = LEGEND_HEADING_Y + G_TITLE_TO_BORDER;
  const LEGEND_HEAD_Y    = COL_BORDER_TOP + G_BORDER_TO_HEAD + HEAD_SIZE;
  const LEGEND_BLURB_Y   = LEGEND_HEAD_Y + G_HEAD_TO_BLURB;
  const LEGEND_GRAPHIC_TOP = LEGEND_BLURB_Y + 2 * BLURB_LINE_H + G_BLURB_TO_GRAPHIC;

  // ── Visualization — starts below album/artist text ────────────────────────
  const VIZ_TOP     = ARTIST_BASELINE + Math.round(0.3 * DPI);
  const VIZ_BOTTOM  = BOTTOM_SECTION_TOP - Math.round(0.15 * DPI);
  const VIZ_AVAIL_H = VIZ_BOTTOM - VIZ_TOP;

  // ── Load fonts ────────────────────────────────────────────────────────────
  await Promise.all([
    document.fonts.load(`${TITLE_SIZE}px "Instrument Serif"`),
    document.fonts.load(`${LEGEND_HEADING_SIZE}px "Instrument Serif"`),
    document.fonts.load(`${ARTIST_SIZE}px "DM Mono"`),
    document.fonts.load(`${HEAD_SIZE}px "DM Mono"`),
    document.fonts.load(`${BLURB_SIZE}px "DM Mono"`),
    document.fonts.load(`${LABEL_SIZE}px "DM Mono"`),
  ]);

  // ── Compute viz scale ─────────────────────────────────────────────────────
  const { vbW, vbH } = getVbDims(svgEl);
  const vizScale = (CONTENT_W * 1.08) / vbW;
  const vizW = Math.round(vbW * vizScale);
  const vizH = Math.round(vbH * vizScale);
  const vizX = MARGIN - Math.round((vizW - CONTENT_W) / 2);
  const vizY = VIZ_TOP + Math.round((VIZ_AVAIL_H - vizH) * 0.15);

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

  // ── Album/artist — top-left ───────────────────────────────────────────────
  ctx.textAlign = 'left';
  ctx.font      = `${TITLE_SIZE}px "Instrument Serif", Georgia, serif`;
  ctx.fillStyle = strong;
  ctx.fillText(album.title, MARGIN, TITLE_BASELINE);

  ctx.font      = `${ARTIST_SIZE}px "DM Mono", "Courier New", monospace`;
  ctx.fillStyle = muted;
  ctx.fillText(album.artist, MARGIN, ARTIST_BASELINE);

  // ── Legend — 5 columns spanning full content width ───────────────────────
  ctx.font      = `${LEGEND_HEADING_SIZE}px "Instrument Serif", Georgia, serif`;
  ctx.fillStyle = strong;
  ctx.textAlign = 'left';
  ctx.fillText('Each flower represents a song', MARGIN, LEGEND_HEADING_Y);

  const legendItems = [
    { heading: 'Size = duration',         blurb: "The size of the flower is based on the song's length.",                      graphic: null },
    { heading: 'Petals = tempo',          blurb: "The number of petals reflects the song's beats per minute.",                graphic: null },
    { heading: 'Color = base note',       blurb: "The color of the flower shows the root note of the song's key.",            graphic: { flowers: colorFlowers,  labels: NOTES,                       size: COLOR_FLOWER,  gap: Math.round(3  * P) } },
    { heading: 'Shape = note change',     blurb: "The shape of the petals shows whether the key is natural, sharp, or flat.", graphic: { flowers: shapeFlowers,  labels: ['natural', 'sharp', 'flat'], size: SHAPE_FLOWER,  gap: Math.round(10 * P) } },
    { heading: 'Center shape = key type', blurb: "The center cutout shows whether the song is in a major or minor key.",      graphic: { flowers: centerFlowers, labels: ['major', 'minor'],           size: CENTER_FLOWER, gap: Math.round(10 * P) } },
  ];

  for (let col = 0; col < 5; col++) {
    const colX = gridX(1 + col);
    const { heading, blurb, graphic } = legendItems[col];

    ctx.font      = `${HEAD_SIZE}px "DM Mono", "Courier New", monospace`;
    ctx.fillStyle = strong;
    ctx.textAlign = 'left';
    ctx.fillText(heading.toUpperCase(), colX, LEGEND_HEAD_Y);

    ctx.font      = `${BLURB_SIZE}px "DM Mono", "Courier New", monospace`;
    ctx.fillStyle = muted;
    wrapText(ctx, blurb, colX, LEGEND_BLURB_Y, GRID_COL_W, BLURB_LINE_H);

    if (graphic) {
      const { flowers, labels, size: fSize, gap } = graphic;
      for (let i = 0; i < flowers.length; i++) {
        const fx = colX + i * (fSize + gap);
        ctx.drawImage(flowers[i], fx, LEGEND_GRAPHIC_TOP, fSize, fSize);
        ctx.font      = `${LABEL_SIZE}px "DM Mono", "Courier New", monospace`;
        ctx.fillStyle = muted;
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], fx + fSize / 2, LEGEND_GRAPHIC_TOP + fSize + G_LABEL_GAP + LABEL_SIZE);
      }
    }
  }

  triggerDownload(canvas, `${safeFilename(album.title)}-poster.png`);
}

async function exportTShirt(svgEl, album, palette) {
  // ── Resolution & units ────────────────────────────────────────────────────
  const DPI = 400;
  const P   = DPI / 72;   // 1 typographic point in canvas pixels (~5.556)

  // ── Canvas width = 12" at 400 DPI; height computed from content ───────────
  // No margins — the image is cropped tightly against the artwork.
  const W = 12 * DPI;   // 4800px

  // ── Font sizes ────────────────────────────────────────────────────────────
  const TITLE_SIZE  = Math.round(24 * P);   // ~133px — album title
  const ARTIST_SIZE = Math.round(12 * P);   // ~67px  — artist name

  await Promise.all([
    document.fonts.load(`${TITLE_SIZE}px "Instrument Serif"`),
    document.fonts.load(`400 ${ARTIST_SIZE}px "DM Mono"`),
  ]);

  // ── Visualisation: scale to full canvas width, preserve aspect ratio ──────
  const { vbW, vbH } = getVbDims(svgEl);
  const vizScale = W / vbW;
  const vizW     = W;
  const vizH     = Math.round(vbH * vizScale);

  // ── Text layout — flush below viz, minimal spacing ────────────────────────
  const TITLE_BASELINE  = vizH + TITLE_SIZE;
  const ARTIST_BASELINE = TITLE_BASELINE + Math.round(ARTIST_SIZE * 1.6);
  const H               = ARTIST_BASELINE + Math.round(ARTIST_SIZE * 0.6);

  // ── Text colours: pure white or black for clean print-on-demand output ────
  const textColor = palette.lightBg ? '#000000' : '#FFFFFF';

  // ── Load viz image and cutout mask in parallel ────────────────────────────
  const [img, maskImg] = await Promise.all([
    svgToImage(svgEl, vizW, vizH, { removeBg: true }),
    buildCutoutMask(svgEl, vizW, vizH, palette.bg),
  ]);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  // Pass 1: draw visualisation (bg rect already removed, centres still filled)
  ctx.drawImage(img, 0, 0, vizW, vizH);

  // Pass 2: punch transparent holes through the flower centres
  ctx.globalCompositeOperation = 'destination-out';
  ctx.drawImage(maskImg, 0, 0, vizW, vizH);
  ctx.globalCompositeOperation = 'source-over';

  // Album title
  ctx.font      = `${TITLE_SIZE}px "Instrument Serif", Georgia, serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(album.title, W / 2, TITLE_BASELINE);

  // Artist name
  ctx.font      = `400 ${ARTIST_SIZE}px "DM Mono", "Courier New", monospace`;
  ctx.fillStyle = textColor;
  ctx.fillText(album.artist, W / 2, ARTIST_BASELINE);

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

function FormatButton({ fmt, selected, onSelect }) {
  const { Icon, label } = fmt;
  const isSelected = selected === fmt.id;

  return (
    <button
      onClick={() => onSelect(fmt.id)}
      className="flex flex-col items-center justify-center gap-3 w-full h-full px-4 py-5 rounded-md transition-colors"
      style={{
        background: isSelected ? '#0E1117' : 'transparent',
        border: `1.5px solid ${isSelected ? '#7B9FD4' : 'rgba(42,49,64,0.8)'}`,
      }}
    >
      <Icon size={30} strokeWidth={1.25} style={{ color: isSelected ? '#7B9FD4' : '#8B93A1' }} />
      <span
        className="font-sans text-body font-medium leading-snug text-center"
        style={{ color: isSelected ? '#F0F2F5' : '#8B93A1' }}
      >
        {label}
      </span>
    </button>
  );
}

export default function DownloadOverlay({ onClose, vizRef, album, palette }) {
  useScrollLock(true);
  const { close, backdropStyle, sheetStyle } = useSheetAnimation(onClose, 'up');
  const [selected, setSelected]           = useState('wallpaper');
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFmt = FORMATS.find(f => f.id === selected);
  const blurbText   = selectedFmt?.getBlurb ? selectedFmt.getBlurb(palette) : selectedFmt?.blurb;

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
            Save Your Album Art
          </h2>
          <button
            onClick={close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4" style={{ gridAutoRows: '1fr' }}>
            {FORMATS.map(fmt => (
              <FormatButton
                key={fmt.id}
                fmt={fmt}
                selected={selected}
                onSelect={setSelected}
              />
            ))}
          </div>

          {/* Reserved blurb row — always occupies its height so the sheet doesn't resize */}
          <p className="font-mono text-caption text-text-secondary text-center px-1" style={{ opacity: blurbText ? 1 : 0 }}>
            {blurbText || ' '}
          </p>

          <PrimaryButton
            onClick={handleDownload}
            className={`uppercase tracking-wider${isDownloading ? ' opacity-40' : ''}`}
          >
            {isDownloading ? 'Exporting…' : 'Download'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
