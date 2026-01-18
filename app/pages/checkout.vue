<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()
const config = useRuntimeConfig()

// 綁定 Store 裡的暫存表單
const form = cartStore.customerDraft
const isSubmitting = ref(false)

// 定義運費費率 (Config)
const RATES = {
  CONVENIENCE: 60,
  HOME: 130,
  MAIL: 40
}

// 頁面載入檢查
onMounted(() => {
  if (cartStore.totalItems === 0) {
    alert('購物車是空的，請先選購商品')
    router.push('/shop')
  }
})

// 運費計算邏輯
const shippingFee = computed(() => {
  if (form.locationType === 'hualien') {
    return 0
  }
  if (form.shippingMethod === '711' || form.shippingMethod === 'family') {
    return cartStore.subtotal >= 1000 ? 0 : RATES.CONVENIENCE
  } else if (form.shippingMethod === 'home') {
    if (cartStore.subtotal >= 1000) {
      return RATES.HOME - RATES.CONVENIENCE // 滿額折抵部分運費
    }
    return RATES.HOME
  } else if (form.shippingMethod === 'mail') {
    return RATES.MAIL
  }
  return 0
})

const finalTotal = computed(() => cartStore.subtotal + shippingFee.value)

// 監聽器：當地區改變，重置運送方式
watch(() => form.locationType, (newVal) => {
  form.storeInfo = ''
  if (newVal === 'hualien') {
    form.shippingMethod = 'local'
  } else {
    // 切換到外縣市，預設選 7-11
    if (form.shippingMethod === 'local') {
      form.shippingMethod = '711'
    }
  }
  cartStore.saveToLocalStorage()
})

// 監聽器：任何表單變動都儲存到 LocalStorage
watch(form, () => {
  cartStore.saveToLocalStorage()
}, { deep: true })

// 取得運送方式中文名稱
const getShippingMethodName = (method: string) => {
  const map: Record<string, string> = {
    local: '店家外送',
    '711': '7-11 取貨',
    family: '全家取貨',
    home: '黑貓宅急便',
    mail: '郵寄 (僅限濾掛)'
  }
  return map[method] || method
}

// 送出訂單
const submitOrder = async () => {
  if (!form.name || !form.phone) {
    alert('請填寫姓名與電話')
    return
  }
  
  if ((form.shippingMethod === '711' || form.shippingMethod === 'family') && !form.storeInfo) {
    alert('請填寫超商門市名稱/店號')
    return
  }

  if ((form.shippingMethod === 'home' || form.shippingMethod === 'local') && !form.address) {
    alert('請填寫收件地址')
    return
  }

  isSubmitting.value = true

  try {
    // 組合地址字串
    let addressString = ''
    if (form.shippingMethod === '711') {
      addressString = `[7-11取貨] ${form.storeInfo}`
    } else if (form.shippingMethod === 'family') {
      addressString = `[全家取貨] ${form.storeInfo}`
    } else if (form.locationType === 'hualien') {
      addressString = `[花蓮外送] ${form.address}`
    } else {
      addressString = `[宅配] ${form.address}`
    }

    const customerPayload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: addressString,
      note: form.note,
      // 這裡記錄詳細運送資訊給後台
      shipping_details: `方式:${getShippingMethodName(form.shippingMethod)} | 運費:$${shippingFee.value}`
    }

    const orderData = {
      action: 'order', // 告訴 GAS 這是訂單
      customer: customerPayload,
      items: cartStore.items,
      total: finalTotal.value
    }

    // ★ 請確認這裡是正確的 GAS URL
    // const GAS_URL = 'https://script.google.com/macros/s/AKfycby0BtunfaTvNxZDpkSOquKFKshAMTQhL7F0T-BXkqG89c1u_95weKGGJ-2xqomF52fGtw/exec'
    const API_BASE_URL = config.public.apiBase

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      // GAS 需要使用 text/plain 以避免 CORS 預檢 (雖然有時 application/json 也可以，但 text/plain 最穩)
      body: JSON.stringify(orderData)
    })

    const result = await response.json()

    if (result.status === 'success') {
      const savedSubtotal = cartStore.subtotal
      cartStore.clearCart() // 清空購物車與表單
      
      alert(`訂單已送出！\n商品金額：$${savedSubtotal}\n\n運費與最終金額將由專人核對後，主動聯繫您進行匯款。`)
      router.push('/')
    } else {
      throw new Error(result.message || '未知錯誤')
    }

  } catch (e: any) {
    console.error(e)
    alert('訂單送出失敗：' + e.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen py-12 px-4">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      
      <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
          配送與收件資訊
        </h2>
        
        <form @submit.prevent="submitOrder" class="space-y-6">
          
          <div class="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <label class="block text-sm font-bold text-gray-700 mb-3">請問您的配送區域？</label>
            <div class="flex space-x-4">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="form.locationType" value="hualien" class="text-yellow-800 focus:ring-yellow-800">
                <span>花蓮市 / 吉安鄉</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="form.locationType" value="other" class="text-yellow-800 focus:ring-yellow-800">
                <span>外縣市 / 其他鄉鎮</span>
              </label>
            </div>
          </div>

          <div class="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <label class="block text-sm font-bold text-gray-700 mb-3">運送方式</label>
            
            <div v-if="form.locationType === 'hualien'" class="space-y-2">
              <label class="flex items-center space-x-2">
                <input type="radio" v-model="form.shippingMethod" value="local" checked class="text-yellow-800">
                <span>店家免費外送 (需預約)</span>
              </label>
            </div>

            <div v-else class="space-y-3">
              <label class="flex items-center justify-between cursor-pointer border p-3 rounded bg-white hover:border-yellow-600 transition" :class="{'border-yellow-600 ring-1 ring-yellow-600': form.shippingMethod === '711'}">
                <div class="flex items-center space-x-2">
                  <input type="radio" v-model="form.shippingMethod" value="711" class="text-yellow-800">
                  <div class="flex items-center">
                    <span class="w-6 h-6 bg-green-600 text-white text-xs flex items-center justify-center rounded mr-2 font-bold">7</span>
                    <div>
                      <span class="font-bold">7-11 取貨</span>
                      <p class="text-xs text-gray-500">滿 $1000 免運，未滿收 ${{ RATES.CONVENIENCE }}</p>
                    </div>
                  </div>
                </div>
                <span v-if="cartStore.subtotal >= 1000" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">已享免運</span>
              </label>

              <label class="flex items-center justify-between cursor-pointer border p-3 rounded bg-white hover:border-blue-600 transition" :class="{'border-blue-600 ring-1 ring-blue-600': form.shippingMethod === 'family'}">
                <div class="flex items-center space-x-2">
                  <input type="radio" v-model="form.shippingMethod" value="family" class="text-yellow-800">
                  <div class="flex items-center">
                    <span class="w-6 h-6 bg-blue-500 text-white text-xs flex items-center justify-center rounded mr-2 font-bold">F</span>
                    <div>
                      <span class="font-bold">全家取貨</span>
                      <p class="text-xs text-gray-500">滿 $1000 免運，未滿收 ${{ RATES.CONVENIENCE }}</p>
                    </div>
                  </div>
                </div>
                <span v-if="cartStore.subtotal >= 1000" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">已享免運</span>
              </label>

              <label class="flex items-center justify-between cursor-pointer border p-3 rounded bg-white hover:border-yellow-600 transition" :class="{'border-yellow-600 ring-1 ring-yellow-600': form.shippingMethod === 'home'}">
                <div class="flex items-center space-x-2">
                  <input type="radio" v-model="form.shippingMethod" value="home" class="text-yellow-800">
                  <div>
                    <span class="font-bold">黑貓宅急便 (低溫/常溫)</span>
                    <p class="text-xs text-gray-500">補運費差額，專人配送到府</p>
                  </div>
                </div>
              </label>

              <label class="flex items-center space-x-2 cursor-pointer p-2">
                <input type="radio" v-model="form.shippingMethod" value="mail" class="text-yellow-800">
                <span class="text-sm">郵寄 (僅限試飲濾掛包) - ${{ RATES.MAIL }}</span>
              </label>
            </div>
          </div>

          <div v-if="form.shippingMethod === '711'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              7-11 門市名稱 / 店號
            </label>
            <input v-model="form.storeInfo" type="text" required placeholder="例如：統醫門市 / 123456" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
            <a href="https://emap.pcsc.com.tw/" target="_blank" class="flex items-center text-xs text-green-600 hover:text-green-800 hover:underline mt-2 font-medium">
              開啟 7-11 電子地圖查詢
            </a>
          </div>

          <div v-else-if="form.shippingMethod === 'family'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              全家 門市名稱 / 店號/服務代號
            </label>
            <input v-model="form.storeInfo" type="text" required placeholder="例如：板橋新光店 / 016666" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-700 outline-none">
            <a href="https://www.family.com.tw/Marketing/Map" target="_blank" class="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline mt-2 font-medium">
              開啟 全家 店舖查詢
            </a>
          </div>

          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ form.locationType === 'hualien' ? '外送地址' : '收件地址' }}
            </label>
            <input v-model="form.address" type="text" required placeholder="請填寫完整地址" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">收件人姓名</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
              <input v-model="form.phone" type="tel" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email (選填)</label>
            <input v-model="form.email" type="email" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">備註事項</label>
            <textarea v-model="form.note" rows="2" placeholder="例如：管理室代收、避開中午時段..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none"></textarea>
          </div>
        </form>
      </div>

      <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
          費用明細
        </h2>

        <div class="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 text-sm">
          <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between border-b border-gray-50 pb-2">
            <div>
              <span class="font-bold text-gray-700">{{ item.name }}</span>
              <span class="text-gray-400 mx-2">x</span>
              <span>{{ item.quantity }}</span>
            </div>
            <div class="font-medium">${{ item.price * item.quantity }}</div>
          </div>
        </div>

        <div class="bg-stone-50 p-4 rounded-lg space-y-3 mb-6">
          <div class="flex justify-between text-gray-600">
            <span>商品小計</span>
            <span>${{ cartStore.subtotal }}</span>
          </div>
          
          <div class="flex justify-between text-gray-600 items-center">
            <span>運費 ({{ getShippingMethodName(form.shippingMethod) }})</span>
            <span v-if="shippingFee === 0" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">免運費</span>
            <span v-else>${{ shippingFee }}</span>
          </div>

          <div class="pt-3 border-t border-gray-200 flex justify-between text-xl font-bold text-gray-900">
            <span>總金額</span>
            <span>${{ finalTotal }}</span>
          </div>
        </div>

        <div v-if="cartStore.shippingCondition === 'mixed'" class="mb-6 bg-orange-50 border border-orange-100 text-orange-800 px-4 py-3 rounded text-xs">
          <strong>⚠️ 訂單包含常溫與冷藏商品</strong><br>
          若選擇黑貓宅配，可能需要分開寄送或統一冷藏，實際運費將由專人與您確認。
        </div>

        <button 
          @click="submitOrder" 
          :disabled="isSubmitting"
          class="w-full bg-yellow-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-yellow-900 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting">訂單處理中...</span>
          <span v-else>確認送出訂單 (${{ finalTotal }})</span>
        </button>
        
        <p class="text-center text-xs text-gray-400 mt-4">
          送出後請留意 Email 或電話通知，確認款項後出貨
        </p>

      </div>
    </div>
  </div>
</template>