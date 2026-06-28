import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number counting up from its previous value to `value` whenever
 * `value` changes. Uses requestAnimationFrame directly (no extra dependency)
 * with an ease-out curve so it settles smoothly rather than ticking linearly.
 */
export default function CountUp({ value = 0, duration = 700, className = '' }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    if (from === to) return;

    const start = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}
