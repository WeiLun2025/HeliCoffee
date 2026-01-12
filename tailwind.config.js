/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          100: '#f5f5dc', // 米色
          300: '#d2b48c', // 淺褐
          500: '#8b4513', // 深褐 (主色)
          800: '#4b3621', // 深咖啡 (文字/重音)
          900: '#2f1b0c', // 極深
        }
      }
    }
  },
  plugins: [],
}