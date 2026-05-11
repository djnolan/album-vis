import { useEffect } from 'react';

const DEFAULT_COLOR = '#0E1117';

export function useThemeColor(color) {
  useEffect(() => {
    const meta = document.querySelector('meta[name=theme-color]');
    if (!meta) return;
    meta.setAttribute('content', color);
    return () => { meta.setAttribute('content', DEFAULT_COLOR); };
  }, [color]);
}
