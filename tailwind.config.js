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
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        '707': ['"Helvetica Neue"', 'Helvetica', 'Arial', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        display: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif']
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
