/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        military: {
          olive: {
            DEFAULT: '#4B5320',
            deep: '#3A4118',
            light: '#626B2E',
            hover: '#586227'
          },
          green: {
            DEFAULT: '#2F3B2A',
            dark: '#1A2016',
            darkest: '#12160F',
            surface: '#1E251A',
            border: '#384632'
          },
          khaki: {
            DEFAULT: '#C2B280',
            light: '#D8CBA0',
            dark: '#9E8F5E',
            muted: 'rgba(194, 178, 128, 0.15)'
          },
          steel: {
            DEFAULT: '#4A5259',
            light: '#6B757D',
            dark: '#2B3035'
          },
          text: {
            primary: '#F0F2EB',
            secondary: '#D6D9D2',
            muted: '#8E9689',
            khaki: '#D8CBA0'
          },
          accent: {
            amber: '#E0A100',
            amberBg: 'rgba(224, 161, 0, 0.15)',
            red: '#B3261E',
            redBg: 'rgba(179, 38, 30, 0.15)',
            green: '#4C8C4A',
            greenBg: 'rgba(76, 140, 74, 0.15)',
            blue: '#2B6CB0'
          }
        }
      },
      fontFamily: {
        stencil: ['Oswald', 'Barlow Condensed', 'sans-serif'],
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace']
      },
      boxShadow: {
        'military-panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(194, 178, 128, 0.15)',
        'military-card': '0 2px 10px 0 rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(56, 70, 50, 0.6)',
        'military-glow': '0 0 15px rgba(194, 178, 128, 0.25)'
      }
    },
  },
  plugins: [],
}
