<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '~/components/AppModal.vue'

const config = useRuntimeConfig()

// 定義表單資料
const form = ref({
  name: '',
  phone: '',
  date: '',
  time: '14:00', // 預設下午茶時段
  people: 2,
  note: ''
})

// 定義 Modal 的資料狀態
const modalState = ref({
  isOpen: false,
  title: '',
  isError: false,
  // 專門存放在 slot 顯示的資料
  data: {
    bookingId: '',
    name: '',
    date: '',
    time: '',
    people: 0,
    errorMessage: ''
  }
})

const isSubmitting = ref(false)

// 限制日期：不能選今天以前 (簡單實作)
const minDate = new Date().toISOString().split('T')[0]

// 可選時段 (可依店家營業時間調整)
const timeSlots = [
  '11:00', '11:30', '12:00', '12:30', '13:00', 
  '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00'
]

const submitBooking = async () => {
  if (!form.value.name || !form.value.phone || !form.value.date) {
    alert('請填寫完整訂位資訊 (姓名、電話、日期)')
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      action: 'reserve', // ★ 告訴後端這是訂位
      ...form.value
    }


    // ★ 請確認這裡是正確的 GAS URL (跟購物車用同一個)
    // const GAS_URL = 'https://script.google.com/macros/s/AKfycby0BtunfaTvNxZDpkSOquKFKshAMTQhL7F0T-BXkqG89c1u_95weKGGJ-2xqomF52fGtw/exec'
    const API_BASE_URL = config.public.apiBase // 這裡維持你習慣的變數名，但來源改了

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(payload) // GAS 需要 text/plain
    })

    const result = await response.json()

    if (result.status === 'success') {
      // 成功：填入資料並開啟 Modal
      modalState.value = {
        isOpen: true,
        title: '🎉 預約成功！',
        isError: false,
        data: {
          bookingId: result.bookingId, // 從後端回傳
          errorMessage: '',
          ...form.value // 把使用者原本填的也帶進去顯示
        }
      }
      
      // 清空表單
      form.value = { name: '', phone: '', date: '', time: '14:00', people: 2, note: '' }
    } else {
      throw new Error(result.message)
    }

  } catch (e: any) {
    // 失敗
    modalState.value = {
      isOpen: true,
      title: '預約失敗',
      isError: true,
      data: { errorMessage: e.message, bookingId: '', name: '', date: '', time: '', people: 0 }
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F5F2] py-12 px-4">
    <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
      
      <div class="md:w-1/2 relative bg-gray-800">
        <img 
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop" 
          alt="Cozy Coffee Shop" 
          class="absolute inset-0 w-full h-full object-cover opacity-80"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-10 text-white">
          <h2 class="text-3xl font-bold mb-2 tracking-wider">享受片刻寧靜</h2>
          <p class="text-gray-200 font-light">
            為確保您的用餐體驗，建議提前預約。<br>
            若有特殊需求 (如慶生、包場)，歡迎於備註中告知。
          </p>
          <div class="mt-6 flex items-center space-x-2 text-[#D4B483]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span class="font-bold">0912-407-147</span>
          </div>
        </div>
      </div>

      <div class="md:w-1/2 p-8 md:p-12">
        <h1 class="text-3xl font-bold text-[#2C1810] mb-8 flex items-center">
          <span class="w-2 h-8 bg-[#D4B483] mr-4 rounded-full"></span>
          預約席位
        </h1>

        <form @submit.prevent="submitBooking" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">姓名</label>
              <input 
                v-model="form.name"
                type="text" 
                required
                placeholder="王小明"
                class="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:bg-white outline-none transition"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">電話</label>
              <input 
                v-model="form.phone"
                type="tel" 
                required
                placeholder="0912-345-678"
                class="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:bg-white outline-none transition"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">日期</label>
              <input 
                v-model="form.date"
                type="date" 
                required
                :min="minDate"
                class="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:bg-white outline-none transition text-gray-700"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700">時間</label>
              <div class="relative">
                <select 
                  v-model="form.time"
                  class="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:bg-white outline-none transition appearance-none cursor-pointer"
                >
                  <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700">人數</label>
            <div class="flex items-center space-x-4">
              <input 
                type="range" 
                v-model.number="form.people" 
                min="1" 
                max="10" 
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2C1810]"
              >
              <span class="text-xl font-bold text-[#2C1810] w-12 text-center">{{ form.people }} 位</span>
            </div>
            <p class="text-xs text-gray-400">超過 10 位請直接來電預約。</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700">備註事項 (選填)</label>
            <textarea 
              v-model="form.note"
              rows="3" 
              placeholder="例如：需要兒童座椅、慶生..."
              class="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:bg-white outline-none transition"
            ></textarea>
          </div>

          <button 
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-[#2C1810] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3E2723] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? '預約處理中...' : '確認預約' }}
          </button>
        </form>
      </div>
    </div>
  </div>
  
  <AppModal 
    :is-open="modalState.isOpen"
    :title="modalState.title"
    :is-error="modalState.isError"
    @close="modalState.isOpen = false"
  >
    <div v-if="modalState.isError">
      <p class="text-red-600 font-bold">系統發生錯誤：</p>
      <p>{{ modalState.data.errorMessage }}</p>
    </div>

    <div v-else class="space-y-2">
      <p class="text-center mb-4 text-stone-500">感謝您的預約，期待您的光臨！</p>
      <div class="flex justify-between border-b border-stone-200 pb-2">
        <span class="font-bold text-stone-700">訂位編號</span>
        <span class="text-amber-700 font-mono font-bold">{{ modalState.data.bookingId }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-stone-500">姓名</span>
        <span class="font-medium">{{ modalState.data.name }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-stone-500">時間</span>
        <span class="font-medium">{{ modalState.data.date }} {{ modalState.data.time }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-stone-500">人數</span>
        <span class="font-medium">{{ modalState.data.people }} 位</span>
      </div>
    </div>
  </AppModal>

</template>