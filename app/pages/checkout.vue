<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '~/stores/cart'
import AppModal from '~/components/AppModal.vue'

const cartStore = useCartStore()
const router = useRouter()
const config = useRuntimeConfig()

// 綁定 Store 裡的暫存表單
const form = cartStore.customerDraft
const isSubmitting = ref(false)

// ★ 運費設定
const RATES = {
  CONVENIENCE: 60,
  HOME_NORMAL: 130, // 常溫宅配
  HOME_COLD: 160,   // 低溫宅配
  MAIL: 40          // 郵寄
}

// 供選擇的時間與日期限制
const minDate = new Date().toISOString().split('T')[0]
const timeSlots = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

const modalState = ref({
  isOpen: false,
  title: '',
  isError: false,
  data: {
    orderId: '',
    total: 0,
    itemCount: 0,
    items: [] as any[], // ★ 新增：用來存商品清單
    errorMessage: ''
  }
})

// 頁面載入檢查
onMounted(() => {
  if (cartStore.totalItems === 0) {
    showModal('購物車是空的', '請先至線上商店選購商品', true)
    // 延遲後跳轉
    setTimeout(() => router.push('/shop'), 1500)
  }
})

// ★ 運費計算核心邏輯
const shippingFee = computed(() => {
  // 自取或外送免運
  if (form.shippingMethod === 'local' || form.shippingMethod === 'pickup') return 0
  // 郵寄固定 40 元
  if (form.shippingMethod === 'mail') return RATES.MAIL

  // 計算滿千折 60 的優惠
  const discount = cartStore.subtotal >= 1000 ? 60 : 0

  // 超商：60 - 折扣
  if (form.shippingMethod === '711' || form.shippingMethod === 'family') {
    return RATES.CONVENIENCE - discount
  } 
  
  // 宅配：基礎運費 - 折扣
  if (form.shippingMethod === 'home') {
    const baseRate = cartStore.shippingCondition === 'cold' ? RATES.HOME_COLD : RATES.HOME_NORMAL
    return baseRate - discount
  }

  return 0
})

const finalTotal = computed(() => cartStore.subtotal + shippingFee.value)

// 防呆：如果是混和溫層，按鈕強制失效
const isMixedCart = computed(() => cartStore.shippingCondition === 'mixed')

// 監聽器：當地區改變，重置運送方式
watch(() => form.locationType, (newVal) => {
  form.storeInfo = ''
  if (newVal === 'hualien') {
    form.shippingMethod = 'local'
  } else {
    // 外縣市：如果是甜點只能選宅配，咖啡預設 7-11
    form.shippingMethod = cartStore.shippingCondition === 'cold' ? 'home' : '711'
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
    local: '花蓮市外送',
    pickup: '來店自取',
    '711': '7-11 取貨',
    family: '全家取貨',
    home: cartStore.shippingCondition === 'cold' ? '低溫宅配' : '常溫宅配',
    mail: '郵寄 (僅限濾掛)'
  }
  return map[method] || method
}

// Helper: 顯示彈窗
const showModal = (title: string, msg: string, isError: boolean = false) => {
  modalState.value = {
    isOpen: true,
    title,
    isError,
    data: { ...modalState.value.data, errorMessage: msg }
  }
}

// 處理 Modal 關閉後的邏輯
const handleModalClose = () => {
  modalState.value.isOpen = false
  // 如果是成功送出訂單 (有 orderId 且無錯誤)，關閉後跳回商店
  if (!modalState.value.isError && modalState.value.data.orderId) {
    router.push('/shop') // ★ 跳轉回線上商店
  }
}

// 送出訂單
const submitOrder = async () => {
  if (isMixedCart.value) {
    showModal('無法結帳', '咖啡與甜點因配送溫層不同，無法合併結帳。請分兩次結帳。', true)
    return
  }

  if (!form.name || !form.phone || !form.email) {
    showModal('資料不完整', '請填寫姓名、電話與 Email', true)
    return
  }
  
  if ((form.shippingMethod === '711' || form.shippingMethod === 'family') && !form.storeInfo) {
    showModal('資料不完整', '請填寫超商門市名稱/店號', true)
    return
  }

  if ((form.shippingMethod === 'home' || form.shippingMethod === 'local') && !form.address) {
    showModal('資料不完整', '請填寫地址', true)
    return
  }

  if ((form.shippingMethod === 'pickup' || form.shippingMethod === 'local') && (!form.pickupDate || !form.pickupTime)) {
    showModal('資料不完整', '請選擇取貨/外送的日期與時間', true)
    return
  }

  isSubmitting.value = true

  try {
    // 組合地址字串
    let addressString = ''
    if (form.shippingMethod === 'pickup') {
      addressString = `[來店自取] 日期：${form.pickupDate} 時間：${form.pickupTime}`
    } else if (form.shippingMethod === 'local') {
      addressString = `[花蓮外送] ${form.address} (約定時間：${form.pickupDate} ${form.pickupTime})`
    } else if (form.shippingMethod === '711') {
      addressString = `[7-11取貨] ${form.storeInfo}`
    } else if (form.shippingMethod === 'family') {
      addressString = `[全家取貨] ${form.storeInfo}`
    } else {
      addressString = `[宅配] ${form.address}`
    }

    // ★ 修改這裡：組合備註
    // 如果有填寫甜點備註，把它加到一般備註的前面，用括號包起來比較明顯
    let finalNote = form.note
    if (form.dessertNote) {
      finalNote = `【甜點需求：${form.dessertNote}】\n${form.note}`
    }

    const customerPayload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: addressString,
      note: finalNote, // ★ 傳送組合後的備註
      dessert_note: form.dessertNote || '',
      shipping_details: `方式:${getShippingMethodName(form.shippingMethod)} | 運費:$${shippingFee.value}`
    }

    // ★ 關鍵：先把當下的金額、數量、商品清單存起來 (因為成功後會清空購物車)
    const currentTotal = finalTotal.value
    const currentItemCount = cartStore.items.length
    const currentItems = JSON.parse(JSON.stringify(cartStore.items))

    const orderData = {
      action: 'order',
      customer: customerPayload,
      items: cartStore.items,
      total: currentTotal
    }

    const API_BASE_URL = config.public.apiBase

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(orderData)
    })

    const result = await response.json()

    if (result.status === 'success') {
      // 1. 清空購物車
      cartStore.clearCart() 
      
      // 2. 設定成功彈窗資料
      modalState.value = {
        isOpen: true,
        title: '🎉 訂單已送出！',
        isError: false,
        data: {
          orderId: result.orderId, 
          total: currentTotal,
          itemCount: currentItemCount,
          items: currentItems,
          errorMessage: ''
        }
      }
    } else {
      throw new Error(result.message || '未知錯誤')
    }

  } catch (e: any) {
    console.error(e)
    showModal('訂單送出失敗', e.message, true)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen py-12 px-4">
    
    <AppModal 
      :is-open="modalState.isOpen"
      :title="modalState.title"
      :is-error="modalState.isError"
      @close="handleModalClose"
    >
      <div v-if="modalState.isError">
        <p class="text-red-600 font-bold mb-2">發生錯誤：</p>
        <p>{{ modalState.data.errorMessage }}</p>
      </div>

      <div v-else class="space-y-3">
        <div class="bg-amber-50 p-4 rounded-lg text-amber-900 text-sm leading-relaxed text-justify mb-4 font-medium border border-amber-200">
          在您送出表單訂購後，我們會在確認表單後聯絡您，跟您確認訂購內容、運費及寄／送貨資訊等資訊，請您於確認金額後三日內轉帳至指定帳戶（付款資訊將於確認訂單時提供）。
        </div>
        
        <div class="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-3">
          <div class="flex justify-between border-b border-stone-200 pb-2">
            <span class="font-bold text-stone-700">訂單編號</span>
            <span class="text-amber-700 font-mono font-bold text-sm">{{ modalState.data.orderId || '處理中...' }}</span>
          </div>
          
          <div>
            <span class="text-xs font-bold text-stone-500 mb-1 block">訂購內容</span>
            <ul class="text-sm space-y-1 max-h-32 overflow-y-auto pr-1">
              <li v-for="item in modalState.data.items" :key="item.id" class="flex justify-between text-stone-700">
                <span>{{ item.name }}</span>
                <span class="font-mono text-stone-500">x{{ item.quantity }}</span>
              </li>
            </ul>
          </div>

          <div class="flex justify-between pt-2 border-t border-stone-200 mt-2">
            <span class="font-bold text-stone-800">預估金額</span>
            <span class="font-bold text-xl text-amber-800">NT$ {{ modalState.data.total }}</span>
          </div>
        </div>
      </div>
    </AppModal>


    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      
      <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
          配送與收件資訊
        </h2>

        <div v-if="isMixedCart" class="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <strong class="block mb-1">無法合併結帳</strong>
            <span class="text-sm">購物車內同時包含「常溫咖啡」與「低溫甜點」，因配送溫層不同，無法合併計算運費。請先將其中一種商品移除，分兩次送出訂單。</span>
          </div>
        </div>
        
        <form @submit.prevent="submitOrder" class="space-y-6" :class="{'opacity-50 pointer-events-none': isMixedCart}">
          
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
            
            <div v-if="form.locationType === 'hualien'" class="space-y-3">
              <label class="flex items-center space-x-2 border p-3 rounded bg-white hover:border-yellow-600 transition" :class="{'border-yellow-600 ring-1 ring-yellow-600': form.shippingMethod === 'local'}">
                <input type="radio" v-model="form.shippingMethod" value="local" class="text-yellow-800">
                <div class="flex items-center">
                  <span class="w-6 h-6 bg-yellow-600 text-white text-xs flex items-center justify-center rounded mr-2 font-bold">🛵</span>
                  <div>
                    <span class="font-bold">店家外送</span>
                    <p class="text-xs text-gray-500">免運費，專人送達</p>
                  </div>
                </div>
              </label>
              <label class="flex items-center space-x-2 border p-3 rounded bg-white hover:border-yellow-600 transition" :class="{'border-yellow-600 ring-1 ring-yellow-600': form.shippingMethod === 'pickup'}">
                <input type="radio" v-model="form.shippingMethod" value="pickup" class="text-yellow-800">
                <div class="flex items-center">
                  <span class="w-6 h-6 bg-stone-600 text-white text-xs flex items-center justify-center rounded mr-2 font-bold">店</span>
                  <div>
                    <span class="font-bold">來店自取</span>
                    <p class="text-xs text-gray-500">免運費，於約定時間來店領取</p>
                  </div>
                </div>
              </label>
            </div>

            <div v-else class="space-y-3">
              <template v-if="cartStore.shippingCondition === 'normal'">
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
                  <span v-if="cartStore.subtotal >= 1000" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">免運</span>
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
                  <span v-if="cartStore.subtotal >= 1000" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">免運</span>
                </label>
              </template>

              <label class="flex items-center justify-between cursor-pointer border p-3 rounded bg-white hover:border-yellow-600 transition" :class="{'border-yellow-600 ring-1 ring-yellow-600': form.shippingMethod === 'home'}">
                <div class="flex items-center space-x-2">
                  <input type="radio" v-model="form.shippingMethod" value="home" class="text-yellow-800">
                  <div class="flex items-center">
                    <span class="w-6 h-6 bg-amber-600 text-white text-xs flex items-center justify-center rounded mr-2 font-bold">宅</span>
                    <div>
                      <span class="font-bold">{{ cartStore.shippingCondition === 'cold' ? '低溫宅配 (甜點專用)' : '常溫宅配' }}</span>
                      <p class="text-xs text-gray-500">滿千可折抵 $60 運費 (需補差額)</p>
                    </div>
                  </div>
                </div>
              </label>

              
              <!-- 先隱藏，這邊的邏輯有疑慮 -->
              <!-- <label v-if="cartStore.shippingCondition === 'normal'" class="flex items-center space-x-2 cursor-pointer p-2">
                <input type="radio" v-model="form.shippingMethod" value="mail" class="text-yellow-800">
                <span class="text-sm">郵寄 (僅限試飲濾掛包) - 固定 ${{ RATES.MAIL }}</span>
              </label> -->
            </div>
          </div>

          <div v-if="form.shippingMethod === 'local' || form.shippingMethod === 'pickup'" class="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <label class=" text-sm font-bold text-amber-900 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              請選擇{{ form.shippingMethod === 'local' ? '希望送達' : '來店取貨' }}時間
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <input v-model="form.pickupDate" type="date" :min="minDate" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm">
              </div>
              <div>
                <select v-model="form.pickupTime" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white">
                  <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="form.shippingMethod === '711'">
            <label class="block text-sm font-medium text-gray-700 mb-1">7-11 門市名稱 / 店號 <span class="text-red-500">*</span></label>
            <input v-model="form.storeInfo" type="text" required placeholder="例如：統醫門市 / 123456" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
            <a href="https://emap.pcsc.com.tw/" target="_blank" class="flex items-center text-xs text-green-600 hover:text-green-800 hover:underline mt-2 font-medium">開啟 7-11 電子地圖查詢</a>
          </div>

          <div v-else-if="form.shippingMethod === 'family'">
            <label class="block text-sm font-medium text-gray-700 mb-1">全家 門市名稱 / 店號/服務代號 <span class="text-red-500">*</span></label>
            <input v-model="form.storeInfo" type="text" required placeholder="例如：板橋新光店 / 016666" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-700 outline-none">
            <a href="https://www.family.com.tw/Marketing/Map" target="_blank" class="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline mt-2 font-medium">開啟 全家 店舖查詢</a>
          </div>

          <div v-else-if="form.shippingMethod !== 'pickup'">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ form.shippingMethod === 'local' ? '外送地址' : '收件地址' }} <span class="text-red-500">*</span></label>
            <input v-model="form.address" type="text" required placeholder="請填寫完整地址" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">訂購人姓名 <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">聯絡電話 <span class="text-red-500">*</span></label>
              <input v-model="form.phone" type="tel" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
            <input v-model="form.email" type="email" required placeholder="example@email.com" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
          </div>

          <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="cartStore.hasCake" class="bg-pink-50 p-4 rounded-lg border border-pink-100">
              <label class=" text-sm font-bold text-pink-800 mb-2 flex items-center">手作甜點客製化需求</label>
              <input v-model="form.dessertNote" type="text" placeholder="例如：都要減糖、起司蛋糕不要鮮奶油..." class="w-full px-4 py-2 bg-white border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none text-pink-900 placeholder-pink-300">
              <p class="text-xs text-pink-600 mt-1">若無特殊需求可留空。</p>
            </div>
          </transition>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">一般備註事項</label>
            <textarea v-model="form.note" rows="2" placeholder="例如：管理室代收、避開中午時段..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none"></textarea>
          </div>
        </form>
      </div>

      <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
          費用明細
        </h2>

        <div class="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 text-sm" :class="{'opacity-50': isMixedCart}">
          <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between border-b border-gray-50 pb-2">
            <div>
              <span class="font-bold text-gray-700">{{ item.name }}</span>
              <span class="text-gray-400 mx-2">x</span>
              <span>{{ item.quantity }}</span>
            </div>
            <div class="font-medium">${{ item.price * item.quantity }}</div>
          </div>
        </div>

        <div class="bg-stone-50 p-4 rounded-lg space-y-3 mb-6" :class="{'opacity-50': isMixedCart}">
          <div class="flex justify-between text-gray-600">
            <span>商品小計</span>
            <span>${{ cartStore.subtotal }}</span>
          </div>
          
          <div class="flex justify-between text-gray-600 items-center">
            <span>預估運費 ({{ getShippingMethodName(form.shippingMethod) }})</span>
            <span v-if="shippingFee === 0" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">免運費</span>
            <span v-else>${{ shippingFee }}</span>
          </div>

          <div class="pt-3 border-t border-gray-200 flex justify-between text-xl font-bold text-gray-900">
            <span>預估總金額</span>
            <span>${{ finalTotal }}</span>
          </div>
        </div>

        <div class="mb-4 text-xs text-stone-500 bg-stone-100 p-3 rounded text-justify leading-relaxed">
          <strong class="text-stone-700">📌 結帳須知：</strong><br>
          在您送出表單訂購後，我們會在確認表單後聯絡您，跟您確認訂購內容、運費及寄／送貨資訊等資訊，請您於確認金額後三日內轉帳至指定帳戶（付款資訊將於確認訂單時提供）。
        </div>

        <button 
          @click="submitOrder" 
          :disabled="isSubmitting || isMixedCart"
          class="w-full text-white py-4 rounded-xl font-bold text-lg transition shadow-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isMixedCart ? 'bg-gray-400' : 'bg-yellow-800 hover:bg-yellow-900'"
        >
          <span v-if="isSubmitting">訂單傳送中...</span>
          <span v-else-if="isMixedCart">溫層衝突，無法結帳</span>
          <span v-else>確認送出訂單</span>
        </button>
      </div>
    </div>
  </div>
</template>