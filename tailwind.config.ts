
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'], // Keep class for ShadCN components, but base theme is dark
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "min(6vw, 96px)", // As per spec
      screens: {
        "2xl": "1280px", // Max content width as per spec
      },
    },
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        'share-tech-mono': ['Share Tech Mono', 'monospace'],
        'space-mono': ['Space Mono', 'monospace'],
        'uncut-sans': ['Uncut Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'], // Default body
        headline: ['Orbitron', 'sans-serif'], // Default headline
        code: ['Source Code Pro', 'monospace'], // For code blocks specifically
        cli: ['Space Mono', 'monospace'], // For terminal-like text
      },
      fontSize: { // Approximate mapping from spec
        'display-lg': ['clamp(3rem, 6vw, 4.5rem)', { lineHeight: '1.1', fontWeight: '700' }], // H1: 64-72px
        'display-md': ['clamp(2.25rem, 4vw, 3.5rem)', { lineHeight: '1.2', fontWeight: '700' }], // H2: 42-56px
        'display-sm': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.3', fontWeight: '600' }], // H3: 28-32px
        'body-lg': ['clamp(1.125rem, 1.5vw, 1.25rem)', { lineHeight: '1.6' }], // Body: 18-20px
        'body-cli': ['1rem', { lineHeight: '1.5' }], // CLI Text: 16px
      },
      colors: {
        border: 'hsla(var(--border-rgb) / var(--border-alpha, 1))',
        input: {
          DEFAULT: 'hsl(var(--input-background-rgb))',
          border: 'hsl(var(--border-rgb))', // Default input border
        },
        ring: 'hsl(var(--ring-rgb))',
        background: 'hsl(var(--background-rgb))', // Single color, gradient handled in body
        foreground: 'hsl(var(--foreground-rgb))',
        primary: {
          DEFAULT: 'hsl(var(--primary-rgb))',
          foreground: 'hsl(var(--primary-foreground-rgb))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary-rgb))',
          foreground: 'hsl(var(--secondary-foreground-rgb))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive-rgb))',
          foreground: 'hsl(var(--destructive-foreground-rgb))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted-rgb))',
          foreground: 'hsl(var(--muted-foreground-rgb))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent-rgb))',
          foreground: 'hsl(var(--accent-foreground-rgb))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover-background-rgb))',
          foreground: 'hsl(var(--popover-foreground-rgb))',
        },
        card: {
          DEFAULT: 'hsla(var(--card-background-rgb) / var(--card-background-alpha, 1))',
          foreground: 'hsl(var(--card-foreground-rgb))',
        },
        'glass-section-border': 'hsla(var(--card-border-rgb) / var(--card-border-alpha, 1))',
        'cyan': 'hsl(var(--primary-rgb))',
        'magenta': 'hsl(var(--accent-rgb))',
        'bg-start': 'rgb(var(--background-start-rgb))',
        'bg-end': 'rgb(var(--background-end-rgb))',
        chart: {
          '1': 'hsl(var(--chart-1-rgb))',
          '2': 'hsl(var(--chart-2-rgb))',
          '3': 'hsl(var(--chart-3-rgb))',
          '4': 'hsl(var(--chart-4-rgb))',
          '5': 'hsl(var(--chart-5-rgb))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)', // 16px from spec for sections
        md: 'calc(var(--radius) - 4px)', // 10px for buttons
        sm: 'calc(var(--radius) - 8px)',
        '2xl': '16px', // Explicitly for glass sections
      },
      spacing: { // For section spacing
        'section-y': 'clamp(80px, 10vh, 120px)',
        'section-x': 'min(6vw, 96px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-border': {
          '0%, 100%': { boxShadow: '0 0 0px hsla(var(--primary-rgb), 0)' },
          '50%': { boxShadow: '0 0 12px 2px hsla(var(--primary-rgb), 0.15), 0 0 6px 1px hsla(var(--primary-rgb), 0.1)' },
        },
        'glitch-flicker': {
          '0%, 100%': { opacity: '1', transform: 'skewX(0deg)' },
          '25%': { opacity: '0.8', transform: 'skewX(-0.5deg) translateY(-1px)' },
          '50%': { opacity: '1', transform: 'skewX(0.5deg) translateY(1px)' },
          '75%': { opacity: '0.9', transform: 'skewX(0.25deg)' },
        },
        'blink': {
          'from, to': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'gradient-border-pulse': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-border': 'pulse-border 6s linear infinite',
        'glitch-flicker': 'glitch-flicker 1.5s infinite alternate',
        'terminal-blink': 'blink 1s step-end infinite',
        'gradient-border-pulse': 'gradient-border-pulse 3s linear infinite',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(12px)', // Default blur from spec
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
