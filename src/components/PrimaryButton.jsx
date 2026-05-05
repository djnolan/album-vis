export default function PrimaryButton({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-4 bg-accent text-surface-0 font-sans text-body font-bold leading-none rounded-md ${className}`}
    >
      {children}
    </button>
  );
}
