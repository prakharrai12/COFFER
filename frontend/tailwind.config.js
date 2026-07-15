/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        sans: ['"General Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
        },
        canvas: 'var(--canvas)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
        },
        border: 'var(--border)',
        brand: {
          DEFAULT: 'var(--brand)',
          light: '#3FA37F',
          dark: '#1F5F4D',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: '#D3A55C',
          dark: '#B8863B',
        },
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        warning: 'var(--warning)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
      },
      transitionTimingFunction: {
        'coffer-in': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'coffer-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'coffer-snap': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
