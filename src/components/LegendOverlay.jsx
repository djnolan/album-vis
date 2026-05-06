// TODO: visual redesign — currently a v1 placeholder with text-only descriptions
import { X } from 'lucide-react';

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
      <div className="relative bg-surface-1 rounded-t-lg">
        {/* Handle pill */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pt-4 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-title text-text-primary">How to Read This</h2>
            <button onClick={onClose} className="text-text-secondary"><X size={20} /></button>
          </div>
          <div className="space-y-6">
            {items.map(({ label, desc }) => (
              <div key={label}>
                <p className="font-mono text-caption text-text-secondary uppercase tracking-widest mb-1">{label}</p>
                <p className="font-sans text-body text-text-primary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
