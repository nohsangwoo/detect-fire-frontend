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
  },
  plugins: [],
}
export default config
