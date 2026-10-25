const { hairlineWidth } = require('nativewind/theme');
const tokens = require('./lib/design/tokens.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        'surface-raised': 'rgb(var(--color-surface-raised) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'text-subtle': 'rgb(var(--color-text-subtle) / <alpha-value>)',
        'border-strong': 'rgb(var(--color-border-strong) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        'primary-soft': 'rgb(var(--color-primary-soft) / <alpha-value>)',
        'primary-ink': 'rgb(var(--color-primary-ink) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        'success-soft': 'rgb(var(--color-success-soft) / <alpha-value>)',
        'success-ink': 'rgb(var(--color-success-ink) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-soft': 'rgb(var(--color-warning-soft) / <alpha-value>)',
        'warning-ink': 'rgb(var(--color-warning-ink) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        'danger-soft': 'rgb(var(--color-danger-soft) / <alpha-value>)',
        'danger-ink': 'rgb(var(--color-danger-ink) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        'info-soft': 'rgb(var(--color-info-soft) / <alpha-value>)',
        'info-ink': 'rgb(var(--color-info-ink) / <alpha-value>)',
        have: 'rgb(var(--color-have) / <alpha-value>)',
        partial: 'rgb(var(--color-partial) / <alpha-value>)',
        need: 'rgb(var(--color-need) / <alpha-value>)',
        price: 'rgb(var(--color-price) / <alpha-value>)',
        staple: 'rgb(var(--color-staple) / <alpha-value>)',
        // legacy: remove after migration
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: 'rgb(var(--color-border-strong) / <alpha-value>)',
        ring: 'rgb(var(--color-primary) / <alpha-value>)',
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        foreground: 'rgb(var(--color-text) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--color-on-primary) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-surface-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-text) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          foreground: 'rgb(var(--color-on-primary) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-surface-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-surface-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-text) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--color-surface-raised) / <alpha-value>)',
          foreground: 'rgb(var(--color-text) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          foreground: 'rgb(var(--color-text) / <alpha-value>)',
        },
      },
      fontSize: Object.fromEntries(
        Object.entries(tokens.type).map(([name, role]) => [
          name,
          [`${role.size}px`, { lineHeight: `${role.lineHeight}px`, letterSpacing: `${role.letterSpacing}px` }],
        ])
      ),
      fontFamily: {
        display: ['BricolageGrotesque_800ExtraBold'],
        'display-bold': ['BricolageGrotesque_700Bold'],
        sans: ['DMSans_400Regular'],
        'sans-medium': ['DMSans_500Medium'],
        'sans-bold': ['DMSans_700Bold'],
        mono: ['IBMPlexMono_400Regular'],
        'mono-medium': ['IBMPlexMono_500Medium'],
        numeric: ['IBMPlexMono_500Medium'],
        label: ['IBMPlexMono_500Medium'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
};
