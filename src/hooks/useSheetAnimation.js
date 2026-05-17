import { useState, useEffect } from 'react';

const DURATION = 340;
const EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';

export function useSheetAnimation(onClose, direction = 'up') {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function close() {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    setTimeout(onClose, DURATION);
  }

  const slideTransform = direction === 'right'
    ? `translateX(${visible ? '0%' : '100%'})`
    : `translateY(${visible ? '0%' : '100%'})`;

  return {
    close,
    backdropStyle: {
      opacity: visible ? 1 : 0,
      transition: `opacity ${DURATION}ms ease`,
    },
    sheetStyle: {
      transform: slideTransform,
      transition: `transform ${DURATION}ms ${EASING}`,
      willChange: 'transform',
    },
  };
}
