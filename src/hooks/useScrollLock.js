import { useEffect } from 'react';

// Shared across all hook instances — only one DOM mutation no matter how many
// overlays are open simultaneously.
let lockCount = 0;
let savedScrollY = 0;

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function applyLock() {
  if (isIOS()) {
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
  } else {
    document.body.style.overflow = 'hidden';
  }
}

function releaseLock() {
  if (isIOS()) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
  } else {
    document.body.style.overflow = '';
  }
}

export function useScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;

    if (lockCount === 0) applyLock();
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount === 0) releaseLock();
    };
  }, [isOpen]);
}
