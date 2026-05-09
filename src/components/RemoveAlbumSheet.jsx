import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function RemoveAlbumSheet({ album, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-1 rounded-t-lg flex flex-col">

        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">Remove Your Album?</h2>
        </div>

        <div className="px-6 pb-8">
          <p className="font-mono text-caption text-text-secondary mb-6">{album.title}</p>
          <div className="flex flex-col gap-3">
            <PrimaryButton onClick={onConfirm}>Yes, remove it</PrimaryButton>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
