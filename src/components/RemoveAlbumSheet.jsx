import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function RemoveAlbumSheet({ album, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-1 rounded-t-lg">
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-6 pt-4 pb-8">
          <h2 className="font-serif text-title text-text-primary leading-tight mb-1">
            Remove your album?
          </h2>
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
