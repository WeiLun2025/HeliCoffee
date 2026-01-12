<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const productStore = useProductStore()

// 當前顯示的索引
const currentIndex = ref(0)
// 計時器參照
let timer: any = null

// 切換到下一張
const nextSlide = () => {
  if (productStore.carouselItems.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % productStore.carouselItems.length
}

// 切換到上一張
const prevSlide = () => {
  if (productStore.carouselItems.length === 0) return
  currentIndex.value = 
    currentIndex.value === 0 
      ? productStore.carouselItems.length - 1 
      : currentIndex.value - 1
}

// 指定跳轉
const goToSlide = (index: number) => {
  currentIndex.value = index
}

// 自動播放邏輯
const startAutoPlay = () => {
  stopAutoPlay() // 先清除舊的以防重複
  timer = setInterval(nextSlide, 5000) // 5秒換一次
}

const stopAutoPlay = () => {
  if (timer) clearInterval(timer)
}

// 生命週期
onMounted(async () => {
  await productStore.fetchCarousel()
  if (productStore.carouselItems.length > 0) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div 
    class="relative w-full h-[60vh] md:h-[600px] overflow-hidden bg-gray-200 group"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
  >
    <div v-if="productStore.isLoading" class="flex items-center justify-center h-full text-gray-500">
      <span class="animate-pulse">載入精彩影像中...</span>
    </div>

    <div v-else class="relative w-full h-full">
      <div 
        v-for="(item, index) in productStore.carouselItems" 
        :key="item.id"
        class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
        :class="index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
      >
        <img 
          :src="item.image_url" 
          :alt="item.title" 
          class="w-full h-full object-cover"
        />
        
        <div class="absolute inset-0 bg-black/30"></div>

        <div class="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h2 class="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg tracking-widest">
            {{ item.title }}
          </h2>
          <p class="text-lg md:text-xl mb-8 font-light tracking-wide drop-shadow-md max-w-2xl">
            {{ item.subtitle }}
          </p>
          <NuxtLink 
            v-if="item.link" 
            :to="item.link"
            class="px-8 py-3 bg-[#D4B483] text-[#2C1810] font-bold rounded-full hover:bg-[#C2A370] transition duration-300 transform hover:scale-105"
          >
            了解更多
          </NuxtLink>
        </div>
      </div>
    </div>

    <button 
      @click="prevSlide" 
      class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition duration-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
    
    <button 
      @click="nextSlide" 
      class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition duration-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>

    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
      <button 
        v-for="(item, index) in productStore.carouselItems" 
        :key="`dot-${item.id}`"
        @click="goToSlide(index)"
        class="w-3 h-3 rounded-full transition-all duration-300"
        :class="index === currentIndex ? 'bg-[#D4B483] w-8' : 'bg-white/50 hover:bg-white'"
      ></button>
    </div>
  </div>
</template>