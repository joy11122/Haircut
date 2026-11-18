import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { ink: '#20231F', paper: '#F5F3ED', olive: '#68745B', bronze: '#B58B5B', line: '#E5E2D9' }, fontFamily: { sans: ['Arial', 'Helvetica', 'sans-serif'], display: ['Georgia', 'serif'] }, boxShadow: { soft: '0 20px 60px rgba(32,35,31,.08)' } } },
  plugins: [],
};
export default config;
