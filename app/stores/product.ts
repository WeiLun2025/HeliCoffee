// app/stores/product.ts

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

// 實體菜單展示用的圖片 (對應 Sheet: Menu_Images)
export interface MenuImage {
  id: string
  title: string
  image_url: string
  order: number
}

// ★ 新增：輪播圖介面
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
  carouselItems: CarouselItem[] // ★ 新增狀態
  isLoading: boolean
  error: string | null
  lastFetchedProducts: number // 上次抓商品的時間
  lastFetchedMenu: number     // 上次抓菜單圖片的時間
  lastFetchedCarousel: number   // ★ 新增時間戳記
}

// ==========================================
// 2. 定義 Store
// ==========================================

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    menuImages: [],
    carouselItems: [], // ★ 初始化
    isLoading: false,
    error: null,
    lastFetchedProducts: 0,
    lastFetchedMenu: 0,
    lastFetchedCarousel: 0 // ★ 初始化
  }),

  getters: {
    // 取得咖啡類商品
    coffeeList: (state) => state.products.filter(item => item.category === 'coffee'),
    
    // 取得甜點類商品
    cakeList: (state) => state.products.filter(item => item.category === 'cake')
  },

  actions: {
    /**
     * 共用的 Fetch 處理器 (內部使用)
     * @param type GAS 參數 (?type=...)
     */
    async _fetchData(type: string) {
      // ★ 請將此處換成你的 GAS Web App URL
      const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycby0BtunfaTvNxZDpkSOquKFKshAMTQhL7F0T-BXkqG89c1u_95weKGGJ-2xqomF52fGtw/exec'
      
      try {
        const response = await fetch(`${GAS_BASE_URL}?type=${type}`)
        const result = await response.json()
        
        if (result.status === 'success') {
          return result.data
        } else {
          throw new Error(result.message || '無法取得資料')
        }
      } catch (err: any) {
        console.error(`[Fetch ${type} Error]:`, err)
        this.error = err.message || '連線錯誤'
        throw err // 拋出錯誤讓外部知道
      }
    },

    /**
     * 動作 A: 抓取線上商店商品 (Products)
     */
    async fetchProducts() {
      // 快取機制：5 分鐘內不重複抓取
      const now = Date.now()
      if (this.products.length > 0 && (now - this.lastFetchedProducts < 300000)) {
        return
      }

      this.isLoading = true
      this.error = null

      try {
        const data = await this._fetchData('products')
        // 更新狀態
        this.products = data
        this.lastFetchedProducts = now
      } catch (e) {
        // 錯誤已在 _fetchData 處理，這裡可留空或做額外處理
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 動作 B: 抓取實體菜單圖片 (Menu_Images)
     */
    async fetchMenuImages() {
      // 快取機制：圖片變動少，設定 10 分鐘快取
      const now = Date.now()
      if (this.menuImages.length > 0 && (now - this.lastFetchedMenu < 600000)) {
        return
      }

      this.isLoading = true
      this.error = null

      try {
        const data = await this._fetchData('menu_images')
        
        // 自動排序：依照 order 欄位由小到大
        this.menuImages = data.sort((a: any, b: any) => a.order - b.order)
        
        this.lastFetchedMenu = now
      } catch (e) {
        // 錯誤處理
      } finally {
        this.isLoading = false
      }
    },
    // ★ 新增：抓取首頁輪播圖
    async fetchCarousel() {
      const now = Date.now()
      // 快取 10 分鐘
      if (this.carouselItems.length > 0 && (now - this.lastFetchedCarousel < 600000)) return
      
      this.isLoading = true
      try {
        const data = await this._fetchData('carousel')
        // 排序
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