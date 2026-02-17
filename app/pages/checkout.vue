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

// 定義運費費率 (Config)
const RATES = {
  CONVENIENCE: 60,
  HOME: 130,
  MAIL: 40
}

// Modal 狀態控制
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
  // 檢查基本資料
  if (!form.name || !form.phone || !form.email) {
    showModal('資料不完整', '請填寫姓名、電話與 Email', true)
    return
  }
  
  if ((form.shippingMethod === '711' || form.shippingMethod === 'family') && !form.storeInfo) {
    showModal('資料不完整', '請填寫超商門市名稱/店號', true)
    return
  }

  if ((form.shippingMethod === 'home' || form.shippingMethod === 'local') && !form.address) {
    showModal('資料不完整', '請填寫收件地址', true)
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
    const currentItems = JSON.parse(JSON.stringify(cartStore.items)) // 深拷貝

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
          items: currentItems, // ★ 把備份的清單塞進去
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
        <p class="text-center mb-4 text-stone-500">
          感謝您的訂購！<br>我們將盡快確認庫存並安排出貨。
        </p>
        
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
            <span class="font-bold text-stone-800">總金額</span>
            <span class="font-bold text-xl text-amber-800">NT$ {{ modalState.data.total }}</span>
          </div>
        </div>

        <div class="mt-4 p-3 bg-amber-50 rounded text-xs text-amber-900 leading-relaxed">
          <strong>付款提醒：</strong><br>
          後續將由專人核對運費與金額，並透過 Email 或電話聯繫您進行匯款。請留意您的聯絡方式。
        </div>
      </div>
    </AppModal>


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
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-700 outline-none">
          </div>
          <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="cartStore.hasCake" class="bg-pink-50 p-4 rounded-lg border border-pink-100">
              <label class="block text-sm font-bold text-pink-800 mb-2  items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 mr-2">
                  <path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
                </svg>
                手作甜點客製化需求
              </label>
              <input 
                v-model="form.dessertNote" 
                type="text" 
                placeholder="例如：都要減糖、起司蛋糕不要鮮奶油..." 
                class="w-full px-4 py-2 bg-white border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none text-pink-900 placeholder-pink-300"
              >
              <p class="text-xs text-pink-600 mt-1">若無特殊需求可留空。</p>
            </div>
          </transition>
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