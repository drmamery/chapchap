/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chapchap: {
          primary: '#FF6B2C',      // Orange vif - couleur principale
          secondary: '#1A1A2E',    // Bleu nuit profond
          accent: '#FFD700',       // Or africain
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          light: '#FFF7F3',        // Fond chaud
          dark: '#0F0F1A',         // Fond sombre
          muted: '#6B7280',
          orange: {
            50: '#FFF3EC',
            100: '#FFE4D1',
            200: '#FFCBA3',
            300: '#FFA06B',
            400: '#FF7A3D',
            500: '#FF6B2C',
            600: '#E5511A',
            700: '#C23A0D',
            800: '#9C2E0A',
            900: '#7D2308',
          },
          gold: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#FFD700',
            600: '#D97706',
            700: '#B45309',
          },
        },
      },
      fontFamily: {
        display: ['Syne', 'var(--font-syne)', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 1s ease infinite',
        'countdown': 'countdown 1s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'chapchap': '0 4px 24px rgba(255, 107, 44, 0.15)',
        'chapchap-lg': '0 8px 40px rgba(255, 107, 44, 0.25)',
        'dark-md': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card': '0 2px 16px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-chapchap': 'linear-gradient(135deg, #FF6B2C 0%, #FF9A56 50%, #FFD700 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FFF7F3 0%, #FFEDE2 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, #FF6B2C22 0px, transparent 50%), radial-gradient(at 80% 0%, #FFD70022 0px, transparent 50%), radial-gradient(at 0% 50%, #FF9A5622 0px, transparent 50%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '375px',
        '3xl': '1920px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    
  ],
};
