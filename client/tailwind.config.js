/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0A0B0F', // app background
          raised: '#0E1015',
        },
        surface: {
          DEFAULT: '#13151A', // card background
          hover: '#171A21',
          border: '#22242C',
        },
        accent: {
          DEFAULT: '#6E56CF', // primary brand violet (signature color)
          hover: '#7C63DE',
          soft: 'rgba(110, 86, 207, 0.14)',
        },
        amber: {
          DEFAULT: '#F5A623',
          soft: 'rgba(245, 166, 35, 0.14)',
        },
        success: {
          DEFAULT: '#10B981',
          soft: 'rgba(16, 185, 129, 0.14)',
        },
        danger: {
          DEFAULT: '#EF4444',
          soft: 'rgba(239, 68, 68, 0.14)',
        },
        info: {
          DEFAULT: '#3B82F6',
          soft: 'rgba(59, 130, 246, 0.14)',
        },
        ink: {
          DEFAULT: '#F0F1F3', // primary text
          muted: '#8A8D98', // secondary text
          faint: '#5B5E6B', // tertiary / placeholder
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -8px rgba(0,0,0,0.5)',
        'card-hover': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 16px 32px -12px rgba(0,0,0,0.55), 0 0 24px -8px rgba(110,86,207,0.25)',
        popover: '0 12px 32px -8px rgba(0,0,0,0.6)',
        'glow-accent': '0 0 0 1px rgba(110,86,207,0.4), 0 0 20px rgba(110,86,207,0.35), 0 0 48px rgba(110,86,207,0.18)',
        'glow-danger': '0 0 0 1px rgba(239,68,68,0.4), 0 0 18px rgba(239,68,68,0.35)',
        'glow-success': '0 0 0 1px rgba(16,185,129,0.4), 0 0 18px rgba(16,185,129,0.3)',
        'glow-amber': '0 0 0 1px rgba(245,166,35,0.4), 0 0 18px rgba(245,166,35,0.3)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        popIn: { '0%': { opacity: 0, transform: 'scale(0.92)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(110,86,207,0.45)' },
          '50%': { boxShadow: '0 0 0 6px rgba(110,86,207,0)' },
        },
        dangerPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' },
          '50%': { boxShadow: '0 0 0 5px rgba(239,68,68,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(14px, -18px) scale(1.05)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-18px, 14px) scale(1.08)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.18s ease-out',
        slideUp: 'slideUp 0.22s ease-out',
        popIn: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        glowPulse: 'glowPulse 2.2s ease-in-out infinite',
        dangerPulse: 'dangerPulse 1.8s ease-in-out infinite',
        float: 'float 9s ease-in-out infinite',
        floatSlow: 'floatSlow 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
