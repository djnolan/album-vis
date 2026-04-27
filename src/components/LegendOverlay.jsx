// TODO: visual redesign — currently a v1 placeholder with text-only descriptions
export default function LegendOverlay({ onClose }) {
  const items = [
    { label: 'SIZE', desc: 'how long the song is' },
    { label: 'PETALS', desc: 'tempo (BPM)' },
    { label: 'PETAL SHAPE', desc: 'accidental — rounded (natural), spiky (sharp), rectangular (flat)' },
    { label: 'CENTER SHAPE', desc: 'mode — oval hole (major), triangle hole (minor)' },
    { label: 'COLOR', desc: 'musical key, C through B' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-neutral-900 rounded-t-2xl px-5 pt-5 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">How to Read This</h2>
          <button onClick={onClose} className="text-white/60 text-2xl leading-none">×</button>
        </div>
        <div className="space-y-4">
          {items.map(({ label, desc }) => (
            <div key={label}>
              <p className="text-white text-xs font-bold tracking-widest mb-0.5">{label}</p>
              <p className="text-white/60 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
