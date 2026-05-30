import grainLightSrc from '../assets/grain-light.webp';
import grainDarkSrc from '../assets/grain-dark.webp';

export default function GrainOverlay({ lightBg }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url(${lightBg ? grainLightSrc : grainDarkSrc})`,
        backgroundSize: '400px 400px',
        mixBlendMode: lightBg ? 'multiply' : 'screen',
        opacity: lightBg ? 0.55 : 0.40,
      }}
    />
  );
}
