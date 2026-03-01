// app/stores/cart.ts
import { defineStore } from 'pinia'
// 引用 Product 介面
import type { Product } from './product'

export interface CartItem extends Product {
  quantity: number
}

// 定義表單資料結構
interface CustomerDraft {
  locationType: string
  shippingMethod: string
  storeInfo: string
  name: string
  phone: string
  email: string
  address: string
  note: string
  dessertNote: string // 甜點客製化
  pickupDate: string // 取貨/外送日期
  pickupTime: string // 取貨/外送時間
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    isCartOpen: false,
    // 暫存客戶填寫的資料
    customerDraft: {
      locationType: 'hualien',
      shippingMethod: 'local',
      storeInfo: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      note: '',
      dessertNote: '',     // 甜點專屬備註
      pickupDate: '',      // 預設空白
      pickupTime: '14:00', // 預設下午兩點
    } as CustomerDraft
  }),

  getters: {
    subtotal: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    totalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    // subtotal: (state) => {
    //   return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    // },
    
    // totalItems: (state) => {
    //   return state.items.reduce((total, item) => total + item.quantity, 0)
    // },

    // 溫層判斷邏輯
    shippingCondition: (state) => {
      if (state.items.length === 0) return 'none'
      
      const hasCoffee = state.items.some(item => item.category === 'coffee')
      const hasCake = state.items.some(item => item.category === 'cake')

      if (hasCoffee && hasCake) return 'mixed'
      if (hasCake) return 'cold'
      return 'normal'
    },
    // ★ 新增 Getter：檢查購物車內是否有蛋糕
    hasCake: (state) => state.items.some(item => item.category === 'cake')
    // hasCake: (state) => {
    //   return state.items.some(item => item.category === 'cake')
    // }
  },

  actions: {
    addToCart(product: Product) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
      
      this.isCartOpen = true
      this.saveToLocalStorage()
    },

    decreaseQuantity(id: string) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        item.quantity--
        if (item.quantity <= 0) {
          this.removeItem(id)
        }
      }
      this.saveToLocalStorage()
    },

    removeItem(id: string) {
      this.items = this.items.filter(item => item.id !== id)
      this.saveToLocalStorage()
    },

    clearCart() {
      this.items = []
      // 清空購物車時，重置表單 (保留體驗一致性)
      this.customerDraft = {
        locationType: 'hualien',
        shippingMethod: 'local',
        storeInfo: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        dessertNote: '',
        pickupDate: '',       // 取貨/外送日期
        pickupTime: '15:00',  // 取貨/外送時間
      }
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      // Nuxt 中必須確認是在客戶端執行
      if (import.meta.client) {
        const payload = {
          items: this.items,
          customerDraft: this.customerDraft
        }
        localStorage.setItem('heli-cart', JSON.stringify(payload))
      }
    },

    initCart() {
      if (import.meta.client) {
        const saved = localStorage.getItem('heli-cart')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            // 相容舊版資料
            if (Array.isArray(parsed)) {
              this.items = parsed
            } else {
              this.items = parsed.items || []
              if (parsed.customerDraft) {
                // ★ 修改這裡：使用解構賦值來「合併」
                // 先拿預設值 (包含 dessertNote: '')，再蓋上 LocalStorage 的舊資料
                this.customerDraft = {
                  ...this.customerDraft, 
                  ...parsed.customerDraft
                }
              }
            }
          } catch (e) {
            console.error('購物車讀取失敗', e)
          }
        }
      }
    }
  }
})