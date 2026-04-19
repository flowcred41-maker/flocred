import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter','system-ui'],
        serif: ['Fraunces','Georgia','serif'],
        mono: ['JetBrains Mono','monospace'],
      },
      colors: {
        dark: { 900:'#0D0D0D', 800:'#151515', 700:'#1C1C1C', 600:'#242424' },
        warm: { 50:'#F5F0E8', 100:'#EDE8DF', 200:'#DED8CC' },
        gold: { 50:'#FDF6E3', 300:'#DDB96A', 400:'#C9A84C', 500:'#B8922F', 600:'#9A7A24' },
        muted: '#6B6459',
      },
    },
  },
  plugins: [],
}
export default config
