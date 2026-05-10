// TODO: visual redesign — currently a v1 placeholder with text-only descriptions
import { X } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

export default function LegendOverlay({ onClose }) {
  useScrollLock(true);
  const items = [
    { label: 'SIZE', desc: 'how long the song is' },
    { label: 'PETALS', desc: 'tempo (BPM)' },
    { label: 'PETAL SHAPE', desc: 'accidental — rounded (natural), spiky (sharp), rectangular (flat)' },
    { label: 'CENTER SHAPE', desc: 'mode — oval hole (major), triangle hole (minor)' },
    { label: 'COLOR', desc: 'musical key, C through B' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative bg-surface-1 rounded-t-lg flex flex-col" style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}>

        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">How to Read This</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-10">
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
