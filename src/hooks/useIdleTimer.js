import { useEffect, useRef } from 'react';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 Menit sesi berakhir
const IDLE_WARN = 13 * 60 * 1000;    // 13 Menit peringatan

export function useIdleTimer({ onWarn, onTimeout, active = true }) {
  const idleTimer = useRef(null);
  const warnTimer = useRef(null);

  const resetTimer = () => {
    if (!active) return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);

    warnTimer.current = setTimeout(() => {
      onWarn?.();
    }, IDLE_WARN);

    idleTimer.current = setTimeout(() => {
      onTimeout?.();
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    if (!active) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
    };
  }, [active]);

  return { resetTimer };
}