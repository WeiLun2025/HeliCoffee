import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const config = useRuntimeConfig()

// 定義新聞資料介面
export interface NewsItem {
  id: string
  date: string
  title: string
  content: string
  tag: string
  is_active: boolean
}

export const useNewsStore = defineStore('news', () => {
  const newsList = ref<NewsItem[]>([])
  const isLoading = ref(false)
  const lastFetched = ref(0) // 用來做簡易快取機制

  // 替換成你的 Google Apps Script 部署網址
  // 建議之後移到 .env 或 nuxt.config.ts
  // const API_URL = 'https://script.google.com/macros/s/AKfycby0BtunfaTvNxZDpkSOquKFKshAMTQhL7F0T-BXkqG89c1u_95weKGGJ-2xqomF52fGtw/exec' 
  const API_BASE_URL = config.public.apiBase

  // 取得並整理新聞 (Getter)
  const activeNews = computed(() => {
    return newsList.value
      .filter((item) => item.is_active) // 只顯示啟用
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 日期新到舊
  })

  // 抓取資料 (Action)
  const fetchNews = async () => {
    // 簡單快取：如果 5 分鐘內抓過，就不重抓
    const now = Date.now()
    if (newsList.value.length > 0 && (now - lastFetched.value < 5 * 60 * 1000)) {
      return
    }

    try {
      isLoading.value = true
      
      // 這裡假設你的 GAS doGet 會回傳 { data: { Home_News: [...] } }
      // 或是你需要傳參數 ?action=getNews
      const response = await fetch(`${API_BASE_URL}?type=news`)
      const json = await response.json()

      if (json.status === 'success') {
        newsList.value = json.data
      }

      // 根據你的 GAS 回傳結構調整這裡
      // 假設回傳結構是陣列，或者是在 data.Home_News 裡
      // 這裡先預設直接回傳陣列或是標準結構
      if (json && Array.isArray(json)) {
          newsList.value = json
      } else if (json.Home_News) {
          newsList.value = json.Home_News
      }

      lastFetched.value = now
    } catch (error) {
      console.error('Failed to fetch news:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    newsList,
    isLoading,
    activeNews,
    fetchNews
  }
})