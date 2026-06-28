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
        popover: '0 12px 32px -8px rgba(0,0,0,0.6)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.18s ease-out',
        slideUp: 'slideUp 0.22s ease-out',
      },
    },
  },
  plugins: [],
};
