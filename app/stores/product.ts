import { defineStore } from 'pinia'

// ==========================================
// 1. 定義資料介面 (Interfaces)
// ==========================================

// 線上商店用的商品 (對應 Sheet: Products)
export interface Product {
  id: string
  name: string
  category: 'coffee' | 'cake'
  price: number
  description: string
  image_url: string
  is_active: boolean
  is_new_arrival: boolean
}

// 實體菜單展示用的圖片 (對應 Sheet: Menu)
export interface MenuImage {
  id: string
  title: string
  image_url: string
  order: number
}

// 輪播圖介面 (對應 Sheet: Home_Carousel)
export interface CarouselItem {
  id: string
  image_url: string
  title: string
  subtitle: string
  link: string
  order: number
}

// Store 的狀態介面
interface ProductState {
  products: Product[]
  menuImages: MenuImage[]
  carouselItems: CarouselItem[]
  isLoading: boolean
  error: string | null
  lastFetchedProducts: number
  lastFetchedMenu: number
  lastFetchedCarousel: number
}

// ==========================================
// 2. 定義 Store
// ==========================================

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    menuImages: [],
    carouselItems: [],
    isLoading: false,
    error: null,
    lastFetchedProducts: 0,
    lastFetchedMenu: 0,
    lastFetchedCarousel: 0
  }),

  getters: {
    coffeeList: (state) => state.products.filter(item => item.category === 'coffee'),
    cakeList: (state) => state.products.filter(item => item.category === 'cake')
  },

  actions: {
    /**
     * 共用的 Fetch 處理器 (內部使用)
     */
    async _fetchData(type: string) {
      const config = useRuntimeConfig()
      // 如果環境變數還沒設，請在下方引號填入你的 GAS 網址
      const GAS_BASE_URL = config.public.gasUrl || 'https://script.google.com/macros/s/AKfycby0BtunfaTvNxZDpkSOquKFKshAMTQhL7F0T-BXkqG89c1u_95weKGGJ-2xqomF52fGtw/exec'
      try {
        const response = await fetch(`${GAS_BASE_URL}?type=${type}`)
        const result = await response.json()
        
        if (result.status === 'success') {
          // 在回傳前，統一轉換圖片網址
          return result.data // ★ 直接回傳，乾淨俐落
        } else {
          throw new Error(result.message || '無法取得資料')
        }
      } catch (err: any) {
        console.error(`[Fetch ${type} Error]:`, err)
        this.error = err.message || '連線錯誤'
        throw err
      }
    },

    /**
     * 動作 A: 抓取線上商店商品
     */
    async fetchProducts() {
      const now = Date.now()
      if (this.products.length > 0 && (now - this.lastFetchedProducts < 300000)) return

      this.isLoading = true
      this.error = null

      try {
        const data = await this._fetchData('products')
        this.products = data
        this.lastFetchedProducts = now
      } catch (e) {
        // Error handled in _fetchData
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 動作 B: 抓取實體菜單圖片
     */
    async fetchMenuImages() {
      const now = Date.now()
      if (this.menuImages.length > 0 && (now - this.lastFetchedMenu < 600000)) return

      this.isLoading = true
      this.error = null

      try {
        const data = await this._fetchData('menu_images')
        // 排序
        this.menuImages = data.sort((a: any, b: any) => a.order - b.order)
        this.lastFetchedMenu = now
      } catch (e) {
        // Error handled in _fetchData
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 動作 C: 抓取首頁輪播圖
     */
    async fetchCarousel() {
      const now = Date.now()
      if (this.carouselItems.length > 0 && (now - this.lastFetchedCarousel < 600000)) return
      
      this.isLoading = true
      try {
        const data = await this._fetchData('carousel')
        this.carouselItems = data.sort((a: any, b: any) => a.order - b.order)
        this.lastFetchedCarousel = now
      } catch (e) {
        console.error('輪播圖載入失敗', e)
      } finally { 
        this.isLoading = false 
      }
    }
  }
})