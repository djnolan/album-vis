import { useEffect, useState, useMemo, forwardRef } from 'react';
import * as d3 from 'd3';
import Flower, { seededRand, SIZE_MIN, SIZE_MAX } from './Flower';
import { PALETTES } from '../data/palettes';

const NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteKey(key, accidental) {
  if (accidental === 'sharp') return key + '#';
  if (accidental === 'flat') {
    // map flat to its enharmonic sharp for color lookup
    const flatMap = { C: 'B', D: 'C#', E: 'D#', F: 'E', G: 'F#', A: 'G#', B: 'A#' };
    return flatMap[key] ?? key;
  }
  return key;
}

function computeLayout(songs) {
  const W = 540, H = 580;
  const durations = songs.map(s => s.duration);
  const minDur = Math.min(...durations);
  const maxDur = Math.max(...durations);
  const sizeScale = d3.scalePow().exponent(0.45).domain([minDur, maxDur]).range([SIZE_MIN, SIZE_MAX]);
  const rand = seededRand(99);

  const nodes = songs.map((song, i) => {
    const r = sizeScale(song.duration);
    const angle = i * 2.4;
    const radius = 60 + i * 18;
    return {
      ...song,
      r,
      x: W / 2 + Math.cos(angle) * radius * 0.6 + (rand() - 0.5) * 20,
      y: H / 2 + Math.sin(angle) * radius * 0.7 + (rand() - 0.5) * 20,
      globalRotation: Math.round(rand() * 360),
    };
  });

  d3.forceSimulation(nodes)
    .force('collide', d3.forceCollide(d => d.r * 0.80).strength(1.0).iterations(6))
    .force('x', d3.forceX(W / 2).strength(0.04))
    .force('y', d3.forceY(H / 2).strength(0.04))
    .force('center', d3.forceCenter(W / 2, H / 2).strength(0.08))
    .stop()
    .tick(800);

  return nodes;
}

const Visualization = forwardRef(function Visualization({ album, palette, activeSongTrack, onFlowerClick }, ref) {
  const [nodes, setNodes] = useState([]);

  const colorRamp = useMemo(() => (
    d3.scaleSequential()
      .domain([0, 11])
      .interpolator(d3.interpolateHcl(palette.colorStart, palette.colorEnd))
  ), [palette]);

  function keyColor(key, accidental) {
    const idx = NOTE_ORDER.indexOf(noteKey(key, accidental));
    return idx >= 0 ? colorRamp(idx) : '#999';
  }

  useEffect(() => {
    setNodes(computeLayout(album.songs));
  }, [album]);

  if (!nodes.length) return null;

  const pad = 16;
  const allX = nodes.flatMap(n => [n.x - n.r, n.x + n.r]);
  const allY = nodes.flatMap(n => [n.y - n.r, n.y + n.r]);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const vbW = maxX - minX + pad * 2;
  const vbH = maxY - minY + pad * 2;

  return (
    <svg
      ref={ref}
      width="100%"
      height="100%"
      viewBox={`${minX - pad} ${minY - pad} ${vbW} ${vbH}`}
      style={{ display: 'block' }}
    >
      <rect x={minX - pad} y={minY - pad} width={vbW} height={vbH} fill={palette.bg} />
      {nodes.map(node => {
        const isActive = activeSongTrack === node.track;
        const dimmed = activeSongTrack != null && !isActive;
        return (
          <g
            key={node.track}
            transform={`translate(${node.x - node.r}, ${node.y - node.r})`}
            onClick={(e) => { if (onFlowerClick) e.stopPropagation(); onFlowerClick?.(node); }}
            style={{ cursor: 'pointer' }}
          >
            <Flower
              song={node}
              size={node.r * 2}
              color={keyColor(node.key, node.accidental)}
              bg={palette.bg}
              globalRotation={node.globalRotation}
              dimmed={dimmed}
            />
          </g>
        );
      })}
    </svg>
  );
});

export default Visualization;
