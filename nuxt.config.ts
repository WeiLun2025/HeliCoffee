// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  // 1. 環境變數與 Runtime Config
  // 這是 SheetOps 的核心，我們之後會把 GAS 的 URL 放在這裡
  runtimeConfig: {
    public: {
      // 之後我們會將部署好的 GAS Web App URL 填入 .env 檔案
      apiBase: process.env.NUXT_PUBLIC_API_BASE || ''
    }
  },

  // 2. Pinia 設定 (可選，預設即可)
  // pinia: {
  //   storesDirs: ['./stores/**'],
  // },
  
  // 讓 TypeScript 檢查更嚴格一些，符合我們的高品質要求
  typescript: {
    strict: true
  }
})