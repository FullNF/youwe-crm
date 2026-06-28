/**
 * Normalizes a phone number to a bare digit string with country code.
 * Assumes Indian numbers (10 digits with no country code) by default,
 * since the team operates in India - if a number already has a country
 * code (11+ digits), it's left as-is.
 */
function withCountryCode(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `91${digits}` : digits;
}

export function getCallHref(phone) {
  const number = withCountryCode(phone);
  return number ? `tel:+${number}` : null;
}

export function getWhatsAppHref(phone, message) {
  const number = withCountryCode(phone);
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
