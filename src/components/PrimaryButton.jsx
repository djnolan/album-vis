export default function PrimaryButton({ onClick, children, className = '', compact = false }) {
  return (
    <button
      onClick={onClick}
      className={`${compact ? 'w-fit px-12' : 'w-full'} py-4 bg-accent text-surface-0 font-sans text-body font-bold leading-none rounded-md pointer-events-auto flex items-center justify-center gap-2 ${className}`}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
    >
      {children}
    </button>
  );
}
