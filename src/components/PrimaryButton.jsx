export default function PrimaryButton({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 bg-accent text-surface-0 font-sans text-body font-bold leading-none rounded-sm ${className}`}
    >
      {children}
    </button>
  );
}
