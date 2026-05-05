export default function SecondaryButton({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-4 bg-surface-2 text-text-primary font-sans text-body font-bold leading-none rounded-md ${className}`}
    >
      {children}
    </button>
  );
}
