import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        celadon: '#A6F5AE',
        pureblack: '#0D0D0D',
        purewhite: '#FFFFFF',
        cornflowerblue: '#6276F3',
        perano: '#9DBAF3',
        dustyred: '#EA475C',
        reefyellow: '#FFB300',
      },
    },
    animation: {
      'border-pulse': 'borderPulse 1s ease-in-out infinite',
      'fire-alert-border-pulse':
        'fire-alert-border-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'fire-modal-scale-in': 'fire-modal-scale-in 0.2s ease-out',
    },
    keyframes: {
      borderPulse: {
        '0%, 100%': { borderColor: 'transparent' },
        '50%': { borderColor: 'rgb(239, 68, 68)' },
      },
      'fire-alert-border-pulse': {
        '0%, 100%': { border: '2px solid transparent' },
        '50%': { border: '2px solid rgb(239, 68, 68)' },
      },
      'fire-modal-scale-in': {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
    },
  },
  plugins: [require('daisyui')],
}
export default config
