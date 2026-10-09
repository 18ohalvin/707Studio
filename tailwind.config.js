/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#000000',
          secondary: '#111111',
          muted: '#737373',
          border: '#e5e5e5',
          surface: '#fafafa',
          accent: '#ffffff',
        },
        // Status colours for a premium brand: pale moss, deep oxblood, muted bronze. No neon green, no loud red.
        moss: { 50: '#eff1ea', 100: '#e2e6d8', 200: '#cbd3bb', 300: '#aebb9a', 500: '#7b8b67', 600: '#667557', 700: '#55633f', 800: '#444f33' },
        oxblood: { 50: '#f6eeed', 100: '#ecdcda', 200: '#dcbebb', 300: '#c69a96', 500: '#7e2c32', 600: '#64212a', 700: '#4a161b', 800: '#3a1115' },
        bronze: { 50: '#f5f1e7', 100: '#eae3d1', 200: '#d9cfb3', 300: '#c4b690', 500: '#8f7c50', 600: '#766443', 700: '#5e4f33', 800: '#4a3e29' },
        editor: {
          bg: '#0c0d0e',
          canvas: '#16181a',
          card: '#1e2023',
          border: '#2c2f35',
          text: '#f3f4f6',
          muted: '#9ca3af',
          accent: '#ffffff',
          highlight: '#2563eb'
        }
      },
      fontFamily: {
        // One type family across the studio and every campaign: Helvetica Neue.
        // "mono" is kept as a class name for codes (Access IDs, URLs) but is
        // the same family with tabular figures (see main.css), not a monospace face.
        sans: ['"Helvetica Neue"', 'Helvetica', 'sans-serif'],
        '707': ['"Helvetica Neue"', 'Helvetica', 'sans-serif'],
        mono: ['"Helvetica Neue"', 'Helvetica', 'sans-serif'],
        display: ['"Helvetica Neue"', 'Helvetica', 'sans-serif']
      },
      fontSize: {
        'display-h1': ['28px', { lineHeight: '34px', letterSpacing: '0px' }],
        'heading-h2': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        'heading-h3': ['18px', { lineHeight: '24px', letterSpacing: '0px' }],
        'subtext-lead': ['16px', { lineHeight: '22px', letterSpacing: '0px' }],
        'bodytext': ['14px', { lineHeight: '20px', letterSpacing: '0px' }],
        'btn': ['14px', { lineHeight: '18px', letterSpacing: '0px' }],
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0px' }],
        'legal-micro': ['11px', { lineHeight: '14px', letterSpacing: '0px' }],
      },
      boxShadow: {
        'phone': '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 12px #1f2227, 0 0 0 14px #2a2e35',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
