import { useEffect } from 'react';

const DEFAULT_COLOR = '#0E1117';

function setThemeColor(color) {
  const existing = document.querySelector('meta[name=theme-color]');
  if (existing) existing.remove();
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = color;
  document.head.appendChild(meta);
}

export function useThemeColor(color) {
  useEffect(() => {
    setThemeColor(color);
    return () => { setThemeColor(DEFAULT_COLOR); };
  }, [color]);
}
