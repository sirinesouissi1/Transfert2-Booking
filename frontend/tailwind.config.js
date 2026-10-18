module.exports = {
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0A0A0B', // Noir pur
          2: '#121214',      // Noir grisâtre pour les cartes
          3: '#1A1A1D',
        },
        gold: {
          light: '#E5C17E',
          DEFAULT: '#C5A059', // Or classique élégant
          dark: '#967941',
        },
        cream: '#F9F6F0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'], // À importer via Google Fonts
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'slow-zoom': 'slow-zoom 20s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        'slow-zoom': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
}