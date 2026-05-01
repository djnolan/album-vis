import { NATURAL_PETALS, SHARP_PETALS, FLAT_PETALS, MAJOR_PATH, MINOR_PATH } from '../data/petalPaths';

export const BPM_DIVISOR = 15;
export const SIZE_MIN = 36;
export const SIZE_MAX = 130;

function parseBBox(d) {
  const nums = d.match(/[-+]?\d*\.?\d+/g).map(Number);
  const xs = [], ys = [];
  for (let i = 0; i < nums.length - 1; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

export function seededRand(seed) {
  let s = Math.max(1, Math.round(Math.abs(seed)) % 2147483647);
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export default function Flower({ song, size, color, bg, globalRotation, dimmed = false }) {
  const { bpm, accidental, mode, track } = song;
  const petalCount = Math.max(3, Math.round(bpm / BPM_DIVISOR));
  const cx = size / 2, cy = size / 2;
  const cutR = size * 0.09;
  const centerR = accidental === 'natural' ? size * 0.09 : size * 0.14;
  const armLength = size * 0.42;
  const library = accidental === 'sharp' ? SHARP_PETALS : accidental === 'flat' ? FLAT_PETALS : NATURAL_PETALS;
  const rawW = Math.sqrt(9 / petalCount);
  const widthScale = accidental === 'sharp' && petalCount <= 5 ? Math.min(rawW, 1.15) : rawW;
  const rand = seededRand(track * 137 + petalCount * 31);
  const cutoutD = mode === 'major' ? MAJOR_PATH : MINOR_PATH;
  const cbb = parseBBox(cutoutD);
  const cutScale = (cutR * 2) / Math.max(cbb.w, cbb.h);
  const cutRotation = Math.round(rand() * 360);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible', opacity: dimmed ? 0.3 : 1 }}
    >
      <g transform={`rotate(${globalRotation},${cx},${cy})`}>
        {Array.from({ length: petalCount }).map((_, i) => {
          const d = library[i % library.length];
          const bb = parseBBox(d);
          const scaleY = armLength / bb.h;
          const scaleX = scaleY * widthScale;
          const jitterRange = accidental === 'sharp' && petalCount <= 5 ? 6 : 12;
          const jitter = (rand() - 0.5) * jitterRange;
          const angleDeg = (i / petalCount) * 360 + jitter;
          const baseY = accidental === 'sharp' ? bb.maxY + bb.h * 0.06 : bb.maxY;
          return (
            <g key={i} transform={`translate(${cx},${cy}) rotate(${angleDeg}) scale(${scaleX},${scaleY}) translate(${-bb.cx},${-baseY})`}>
              <path d={d} fill={color} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={centerR} fill={color} />
        <g transform={`translate(${cx},${cy}) rotate(${cutRotation}) scale(${cutScale}) translate(${-cbb.cx},${-cbb.cy})`}>
          <path d={cutoutD} fill={bg} />
        </g>
      </g>
    </svg>
  );
}
