import { Phone, MessageCircle } from 'lucide-react';
import { getCallHref, getWhatsAppHref } from '../../lib/phone';
import api from '../../lib/api';

/**
 * Small Call + WhatsApp icon buttons next to a phone number.
 * - No pre-filled WhatsApp message - this is for ongoing follow-ups with the
 *   same customer, so it just opens their chat thread directly.
 * - When there's no phone number on file, both icons render disabled
 *   (greyed out, not clickable) rather than disappearing, so the layout
 *   stays consistent across rows.
 * - Stops click propagation so it's safe to drop inside a clickable
 *   table row or card without accidentally triggering navigation.
 * - Tapping either one logs the contact attempt (clears the "unread" red
 *   dot, nudges stage to "Calling" if still New) - fire-and-forget, doesn't
 *   block the actual call/WhatsApp from opening.
 */
export default function ContactActions({ phone, recordId, size = 'sm', className = '', onLogged }) {
  const callHref = getCallHref(phone);
  const waHref = getWhatsAppHref(phone);
  const disabled = !callHref;

  const iconSize = size === 'sm' ? 13 : 15;
  const pad = size === 'sm' ? 'p-1.5' : 'p-2';

  const logContact = (method) => {
    if (!recordId) return;
    api.post(`/leads/${recordId}/log-contact`, { method }).then(() => onLogged?.()).catch(() => {});
  };

  if (disabled) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <span title="No phone number on file" className={`${pad} rounded-md text-ink-faint/50 cursor-not-allowed`}>
          <Phone size={iconSize} />
        </span>
        <span title="No phone number on file" className={`${pad} rounded-md text-ink-faint/50 cursor-not-allowed`}>
          <MessageCircle size={iconSize} />
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
      <a
        href={callHref}
        title="Call"
        onClick={() => logContact('call')}
        className={`${pad} rounded-md text-info hover:bg-info/15 hover:scale-110 hover:shadow-[0_0_14px_rgba(59,130,246,0.35)] transition-all duration-150 active:scale-90`}
      >
        <Phone size={iconSize} />
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
        onClick={() => logContact('whatsapp')}
        style={{ color: '#25D366' }}
        className={`${pad} rounded-md hover:bg-[#25D366]/15 hover:scale-110 transition-all duration-150 active:scale-90`}
      >
        <MessageCircle size={iconSize} />
      </a>
    </span>
  );
}
