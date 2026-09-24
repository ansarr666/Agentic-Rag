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
        background: "#f4f6f9", // Crisp light cool gray canvas from reference
        surface: {
          DEFAULT: "#ffffff",   // Pure crisp white for cards, sidebar, header
          elevated: "#f8fafc",   // Light slate surface
          hover: "#f1f5f9",      // Soft hover
          card: "#f8fafc"        // Inner card containers
        },
        border: {
          DEFAULT: "#e2e8f0",    // Crisp light border
          strong: "#cbd5e1",     // Slightly darker border for inputs
          subtle: "#f1f5f9"
        },
        primary: {
          DEFAULT: "#2563eb",    // Royal blue accent
          hover: "#1d4ed8",
          light: "#3b82f6",
          subtle: "#eff6ff"
        },
        // Inverted slate scale so all text-slate-* classes render crisp & high-contrast in light mode
        slate: {
          50: '#020617',
          100: '#0f172a',        // Dark slate for headings & prominent text
          200: '#1e293b',        // Dark slate for body text & labels
          300: '#334155',        // Medium dark slate
          400: '#64748b',        // Muted descriptions & subtitles (matches screenshot)
          500: '#94a3b8',        // Placeholder slate
          600: '#cbd5e1',
          700: '#e2e8f0',
          800: '#f1f5f9',
          900: '#f8fafc',
          950: '#ffffff'
        },
        accent: {
          DEFAULT: "#2563eb",
          emerald: "#16a34a",
          amber: "#d97706",
          rose: "#e11d48",
          purple: "#7e22ce"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow': '0 4px 14px 0 rgba(37, 99, 235, 0.20)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 14px -2px rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
}
