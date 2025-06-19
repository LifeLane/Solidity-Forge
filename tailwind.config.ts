
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
        border: 'hsla(var(--border-rgb) / var(--border-alpha, 1))', // Can also be hsl(var(--border)) if defined in globals
        input: {
          DEFAULT: 'hsl(var(--input))', // References HSL var from globals.css
          border: 'hsl(var(--border))',
        },
        ring: 'hsl(var(--ring))', // References HSL var
        background: 'hsl(var(--background))', // References HSL var
        foreground: 'hsl(var(--foreground))', // References HSL var
        primary: {
          DEFAULT: 'hsl(var(--primary))', // References HSL var
          foreground: 'hsl(var(--primary-foreground))', // References HSL var
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))', // References HSL var
          foreground: 'hsl(var(--secondary-foreground))', // References HSL var
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))', // References HSL var
          foreground: 'hsl(var(--destructive-foreground))', // References HSL var
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))', // References HSL var
          foreground: 'hsl(var(--muted-foreground))', // References HSL var
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))', // References HSL var
          foreground: 'hsl(var(--accent-foreground))', // References HSL var
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))', // References HSL var
          foreground: 'hsl(var(--popover-foreground))', // References HSL var
        },
        card: {
          DEFAULT: 'hsl(var(--card))', // References HSL var for card background (with alpha)
          foreground: 'hsl(var(--card-foreground))', // References HSL var
        },
        'glass-section-border': 'hsla(var(--card-border-rgb) / var(--card-border-alpha, 1))', // Keep direct RGB for this one if it's specifically for the border visual
        
        // Direct color names for utility classes if needed, referencing the HSL versions for consistency
        'cyan': 'hsl(var(--primary))',
        'magenta': 'hsl(var(--accent))',
        
        'bg-start': 'rgb(var(--background-start-rgb))', // Used for direct gradient
        'bg-end': 'rgb(var(--background-end-rgb))',     // Used for direct gradient
        
        chart: { // These should reference their HSL counterparts from globals.css
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
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
          '0%, 100%': { boxShadow: '0 0 0px hsla(var(--primary-rgb), 0)' }, // Uses primary-rgb for the glow color
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
