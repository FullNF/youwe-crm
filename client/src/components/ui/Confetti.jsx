import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#6E56CF', '#10B981', '#F5A623', '#3B82F6', '#EF4444', '#F0F1F3'];
const PIECE_COUNT = 26;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Renders a brief, celebratory confetti burst from the center of the screen.
 * Mount this with `trigger` toggling true once (e.g. on stage -> "Won"), it
 * cleans itself up automatically. Kept short and not too dense so it reads
 * as a satisfying acknowledgment, not a distraction.
 */
export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    const next = Array.from({ length: PIECE_COUNT }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      x: randomBetween(-220, 220),
      y: randomBetween(-260, -60),
      rotate: randomBetween(-180, 180),
      delay: randomBetween(0, 0.12),
      color: COLORS[i % COLORS.length],
      size: randomBetween(6, 11),
      shape: i % 3 === 0 ? '50%' : '2px',
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1400);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate, scale: 0.6 }}
            transition={{ duration: 1.1, delay: p.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.shape,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
