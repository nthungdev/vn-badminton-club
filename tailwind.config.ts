import type { Config } from 'tailwindcss'

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
  },
}

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ...colors,
        primary: colors['outer-space'],
      },
    },
  },
  plugins: [],
}
export default config
