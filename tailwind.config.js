/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0E1117',
          1: '#161B24',
          2: '#1F2633',
        },
        border: '#2A3140',
        accent: '#7B9FD4',
        text: {
          primary: '#F0F2F5',
          secondary: '#8B93A1',
          tertiary: '#525A68',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['DM Mono', 'Courier New', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2rem',      { lineHeight: '1.05' }],
        'title':   ['1.375rem',  { lineHeight: '1.1' }],
        'body':    ['1rem',      { lineHeight: '1.4' }],
        'ui':      ['0.9375rem', { lineHeight: '1.4' }],
        'label':   ['0.875rem',  { lineHeight: '1.4', fontWeight: '500' }],
        'caption': ['0.75rem',   { lineHeight: '1.4' }],
      },
      borderRadius: {
        'sm':   '6px',
        'md':   '12px',
        'lg':   '20px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
