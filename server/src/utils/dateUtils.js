/**
 * Lightweight date helpers. The sheet stores dates as free-text strings
 * (matching how the team already types them, e.g. "21-Jun" or "27-Jun-26"),
 * so parsing is forgiving rather than strict.
 */

function parseFlexibleDate(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  const native = new Date(raw);
  if (!isNaN(native.getTime()) && /\d{4}/.test(raw)) return native;

  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const m = raw.match(/^(\d{1,2})-([A-Za-z]{3,})(?:-(\d{2,4}))?$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthKey = m[2].slice(0, 3).toLowerCase();
    if (months[monthKey] !== undefined) {
      let year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
      if (year < 100) year += 2000;
      return new Date(year, months[monthKey], day);
    }
  }

  return null;
}

function daysBetween(a, b = new Date()) {
  const d1 = parseFlexibleDate(a);
  if (!d1) return null;
  const ms = b.getTime() - d1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function isPast(input, referenceDate = new Date()) {
  const d = parseFlexibleDate(input);
  if (!d) return false;
  return d.getTime() < referenceDate.getTime();
}

function nowIso() {
  return new Date().toISOString();
}

function formatDisplayDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

module.exports = { parseFlexibleDate, daysBetween, isPast, nowIso, formatDisplayDate };
