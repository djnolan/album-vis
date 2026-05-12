import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';

export default function RemoveAlbumSheet({ album, onConfirm, onClose }) {
  useScrollLock(true);
  const { close, backdropStyle, sheetStyle } = useSheetAnimation(onClose);

  function handleConfirm() {
    onConfirm();
    close();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75" style={backdropStyle} onClick={close} />
      <div className="relative bg-surface-1 rounded-t-lg flex flex-col" style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', ...sheetStyle }}>

        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">Remove Your Album?</h2>
        </div>

        <div className="px-6 pb-8">
          <p className="font-mono text-caption text-text-secondary mb-6">{album.title}</p>
          <div className="flex flex-col gap-3">
            <PrimaryButton onClick={handleConfirm}>Yes, remove it</PrimaryButton>
            <SecondaryButton onClick={close}>Cancel</SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
