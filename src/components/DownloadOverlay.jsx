import { X, Smartphone, Watch, Image, Shirt } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';

const FORMATS = [
  { id: 'wallpaper', label: 'Wallpaper',  Icon: Smartphone },
  { id: 'watch',     label: 'Watch Face', Icon: Watch      },
  { id: 'poster',    label: 'Poster',     Icon: Image      },
  { id: 'tshirt',    label: 'T-Shirt',    Icon: Shirt      },
];

export default function DownloadOverlay({ formatId, onFormatChange, onDownload, isDownloading, onClose }) {
  useScrollLock(true);
  const { close, backdropStyle, sheetStyle } = useSheetAnimation(onClose);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75" style={backdropStyle} onClick={close} />
      <div
        className="relative bg-surface-1 rounded-t-lg flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 48px)', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', ...sheetStyle }}
      >
        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-serif text-title text-text-primary">Save Your Visualization</h2>
          <button
            onClick={close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-10 flex flex-col gap-6">
          <div className="flex gap-2">
            {FORMATS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => onFormatChange(id)}
                className="flex flex-col items-center gap-1.5 flex-1 py-3 rounded-md"
                style={{
                  border: `1.5px solid ${formatId === id ? '#7B9FD4' : '#2A3140'}`,
                  background: formatId === id ? 'rgba(123,159,212,0.12)' : 'transparent',
                  color: formatId === id ? '#7B9FD4' : '#8B93A1',
                  transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                }}
              >
                <Icon size={20} />
                <span className="font-mono text-caption leading-none">{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="w-full py-4 rounded-md font-sans text-body font-bold disabled:opacity-40"
            style={{ background: '#7B9FD4', color: '#0E1117', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            {isDownloading ? 'DOWNLOADING…' : 'DOWNLOAD'}
          </button>
        </div>
      </div>
    </div>
  );
}
