/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
      './pages/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
      './app/**/*.{js,jsx}',
      './src/**/*.{js,jsx}',
    ],
    prefix: "",
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
          border: "var(--color-border)", /* light gray */
          input: "var(--color-input)", /* pure white */
          ring: "var(--color-ring)", /* deep teal-green */
          background: "var(--color-background)", /* warm off-white */
          foreground: "var(--color-foreground)", /* deep charcoal */
          primary: {
            DEFAULT: "var(--color-primary)", /* deep teal-green */
            foreground: "var(--color-primary-foreground)", /* white */
          },
          secondary: {
            DEFAULT: "var(--color-secondary)", /* clear blue */
            foreground: "var(--color-secondary-foreground)", /* white */
          },
          destructive: {
            DEFAULT: "var(--color-destructive)", /* strong red */
            foreground: "var(--color-destructive-foreground)", /* white */
          },
          muted: {
            DEFAULT: "var(--color-muted)", /* light gray */
            foreground: "var(--color-muted-foreground)", /* medium gray */
          },
          accent: {
            DEFAULT: "var(--color-accent)", /* bright cyan */
            foreground: "var(--color-accent-foreground)", /* white */
          },
          popover: {
            DEFAULT: "var(--color-popover)", /* pure white */
            foreground: "var(--color-popover-foreground)", /* deep charcoal */
          },
          card: {
            DEFAULT: "var(--color-card)", /* pure white */
            foreground: "var(--color-card-foreground)", /* deep charcoal */
          },
          success: {
            DEFAULT: "var(--color-success)", /* forest green */
            foreground: "var(--color-success-foreground)", /* white */
          },
          warning: {
            DEFAULT: "var(--color-warning)", /* amber orange */
            foreground: "var(--color-warning-foreground)", /* white */
          },
          error: {
            DEFAULT: "var(--color-error)", /* strong red */
            foreground: "var(--color-error-foreground)", /* white */
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        fontFamily: {
          heading: ["var(--font-heading)"],
          body: ["var(--font-body)"],
          caption: ["var(--font-caption)"],
          data: ["var(--font-data)"],
        },
        boxShadow: {
          'operations': 'var(--shadow-sm)',
          'critical': 'var(--shadow-lg)',
        },
        transitionDuration: {
          '150': '150ms',
          '250': '250ms',
        },
        transitionTimingFunction: {
          'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        },
        zIndex: {
          '1000': '1000',
          '1100': '1100',
          '1200': '1200',
          '1300': '1300',
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  }