import type { Config } from 'tailwindcss'
import TailwindCSSForm from '@tailwindcss/forms'
import Flowbite from 'flowbite-react/tailwind'

const colors = {
  'outer-space': {
    '50': '#f1fafa',
    '100': '#dbf1f2',
    '200': '#bbe2e6',
    '300': '#8dcdd3',
    '400': '#57aeb9',
    '500': '#3b929f',
    '600': '#347886',
    '700': '#30626e',
    '800': '#2e525c',
    '900': '#243c44',
    '950': '#172d35',
    DEFAULT: '#347886',
  },
  nutmeg: {
    '50': '#faf6f2',
    '100': '#f4eae0',
    '200': '#e9d3bf',
    '300': '#dab597',
    '400': '#cb926c',
    '500': '#c0774f',
    '600': '#b26444',
    '700': '#944f3a',
    '800': '#6e3c30',
    '900': '#61372d',
    '950': '#341b16',
    DEFAULT: '#b26444',
  },
}

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    Flowbite.content(),
  ],
  theme: {
    extend: {
      ringColor: colors['nutmeg'],
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ...colors,
        primary: colors['outer-space'],
        secondary: colors['nutmeg'],
      },
    },
  },
  plugins: [
    TailwindCSSForm,
    Flowbite.plugin(),
  ],
}
export default config
