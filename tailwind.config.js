/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          DEFAULT: '#4F6EF7',
        },
        brand: {
          blue:   '#4F6EF7',
          purple: '#8B5CF6',
          teal:   '#14B8A6',
          pink:   '#EC4899',
        },
      },
      boxShadow: {
        card: '0 2px 16px rgba(79,110,247,0.08)',
        'card-hover': '0 8px 32px rgba(79,110,247,0.16)',
        glow: '0 0 24px rgba(79,110,247,0.25)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease',
        'slide-up':   'slideUp 0.3s ease',
        'slide-down': 'slideDown 0.3s ease',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4F6EF7 0%, #8B5CF6 100%)',
        'gradient-hero':  'linear-gradient(135deg, #1E2448 0%, #2D3A8C 50%, #4F6EF7 100%)',
        'gradient-card':  'linear-gradient(135deg, rgba(79,110,247,0.08) 0%, rgba(139,92,246,0.08) 100%)',
      },
    },
  },
  plugins: [],
}
