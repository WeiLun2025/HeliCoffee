<script setup lang="ts">
import { onMounted } from 'vue'

// Nuxt 會自動引入 useProductStore，不需手動 import
const productStore = useProductStore()

// 頁面載入時，呼叫 Store 的動作來抓圖
onMounted(() => {
  productStore.fetchMenuImages()
})
</script>

<template>
  <div class="bg-[#F8F5F2] min-h-screen pb-20">
    <div class="pt-16 pb-12 text-center px-4">
      <h1 class="text-4xl font-bold text-[#2C1810] mb-4 tracking-widest">MENU</h1>
      <p class="text-gray-500 text-sm tracking-wide">
        店內供應品項依季節調整，實際內容以現場為主
      </p>
    </div>

    <div v-if="productStore.isLoading" class="max-w-4xl mx-auto px-4 space-y-8">
      <div v-for="n in 2" :key="n" class="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse"></div>
    </div>

    <div v-else class="max-w-4xl mx-auto px-4 md:px-0 space-y-8">
      <div 
        v-for="image in productStore.menuImages" 
        :key="image.id"
        class="bg-white p-2 md:p-4 rounded-xl shadow-lg border border-[#E6D5C3]"
      >
        <img 
          :src="image.image_url" 
          :alt="image.title"
          class="w-full h-auto rounded-lg"
          loading="lazy"
        />
      </div>
      
      <div v-if="productStore.menuImages.length === 0" class="text-center py-20 text-gray-400">
        <p>目前沒有線上菜單圖片，請直接來店裡看看吧！</p>
      </div>
    </div>

    <div class="fixed bottom-8 left-0 right-0 flex justify-center z-40 px-4">
      <NuxtLink 
        to="/shop"
        class="bg-[#2C1810]/90 backdrop-blur text-[#F8F5F2] px-8 py-3 rounded-full shadow-xl hover:bg-[#3E2723] transition flex items-center space-x-2 transform hover:scale-105 duration-300"
      >
        <span>想買咖啡豆？前往線上商店</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>