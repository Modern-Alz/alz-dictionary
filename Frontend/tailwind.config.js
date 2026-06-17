/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFEFB',
          100: '#FAF6EC',
          200: '#F2EAD3',
          300: '#E6DCC6',
          400: '#D8CBA9',
        },
        ink: {
          50: '#F4EFE2',
          100: '#D7DEE8',
          200: '#A9B4C4',
          300: '#7C8AA0',
          500: '#5C6B7A',
          700: '#1E2A38',
          800: '#161E2A',
          900: '#11161F',
          950: '#0B0E15',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1A2231',
          darkAlt: '#232C3E',
        },
        azure: {
          50: '#EAF1FB',
          100: '#DCE9F8',
          200: '#BBD4F0',
          300: '#8FB7E4',
          400: '#5C8FCB',
          500: '#2F5D9F',
          600: '#244873',
          900: '#1F2F46',
        },
        gilt: {
          50: '#FBF3DC',
          100: '#F6E7B8',
          200: '#EDD68C',
          300: '#E0BB54',
          400: '#F0C75E',
          500: '#C99A2E',
          900: '#3A331E',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(30,42,56,0.06), 0 1px 2px rgba(30,42,56,0.04)',
        card: '0 6px 24px rgba(30,42,56,0.08)',
        lifted: '0 16px 40px rgba(30,42,56,0.14)',
        'glow-gold': '0 0 0 1px rgba(201,154,46,0.35), 0 0 28px rgba(240,199,94,0.35)',
        'glow-blue': '0 0 0 1px rgba(47,93,159,0.30), 0 0 28px rgba(127,177,232,0.35)',
        'card-dark': '0 6px 24px rgba(0,0,0,0.35)',
        'lifted-dark': '0 16px 40px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(240,199,94,0.45)' },
          '50%': { boxShadow: '0 0 32px 6px rgba(240,199,94,0.45)' },
        },
        glowPulseBlue: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(127,177,232,0.45)' },
          '50%': { boxShadow: '0 0 32px 6px rgba(127,177,232,0.45)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        sweep: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        dotBounce: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'glow-pulse': 'glowPulse 2.6s ease-in-out infinite',
        'glow-pulse-blue': 'glowPulseBlue 2.6s ease-in-out infinite',
        float: 'floatY 6s ease-in-out infinite',
        sweep: 'sweep 2.2s linear infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'spin-slow': 'spinSlow 12s linear infinite',
        'dot-bounce': 'dotBounce 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
