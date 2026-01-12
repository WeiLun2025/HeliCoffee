<script setup lang="ts">
import { useProductStore } from '~/stores/product'
// 引入剛剛寫好的 store
const productStore = useProductStore()

// 控制目前的分類 Tab (預設顯示咖啡)
const activeTab = ref<'coffee' | 'cake'>('coffee')

// 頁面載入時，呼叫 store 抓資料
onMounted(() => {
  productStore.fetchProducts()
})

// 根據 Tab 切換顯示的資料
const currentProducts = computed(() => {
  return activeTab.value === 'coffee' 
    ? productStore.coffeeList 
    : productStore.cakeList
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
        美味<span class="text-yellow-700">菜單</span>
      </h1>
      <p class="text-gray-500 max-w-2xl mx-auto">
        嚴選世界各地的精品咖啡豆，搭配每日手作的新鮮甜點。<br>
        每一口，都是我們對品質的堅持。
      </p>
    </div>

    <div class="flex justify-center mb-12 space-x-4">
      <button 
        @click="activeTab = 'coffee'"
        class="px-8 py-3 rounded-full text-lg font-medium transition-all duration-300"
        :class="activeTab === 'coffee' 
          ? 'bg-yellow-700 text-white shadow-lg scale-105' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
      >
        ☕ 精品咖啡
      </button>
      <button 
        @click="activeTab = 'cake'"
        class="px-8 py-3 rounded-full text-lg font-medium transition-all duration-300"
        :class="activeTab === 'cake' 
          ? 'bg-yellow-700 text-white shadow-lg scale-105' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
      >
        🍰 手作甜點
      </button>
    </div>

    <div v-if="productStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="n in 6" :key="n" class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-96 animate-pulse">
        <div class="bg-gray-200 h-48 w-full"></div>
        <div class="p-6 space-y-4">
          <div class="h-6 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div v-else-if="productStore.error" class="text-center py-12 bg-red-50 rounded-lg text-red-600">
      <p>⚠️ 資料載入失敗：{{ productStore.error }}</p>
      <button @click="productStore.fetchProducts()" class="mt-4 underline hover:text-red-800">再試一次</button>
    </div>

    <div v-else-if="currentProducts.length === 0" class="text-center py-20 text-gray-500">
      <p class="text-xl">目前該分類尚無商品上架，敬請期待。</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="item in currentProducts" 
        :key="item.id"
        class="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
      >
        <div class="relative h-64 overflow-hidden bg-gray-100">
          <img 
            :src="item.image_url" 
            :alt="item.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          >
          <div v-if="item.is_new_arrival" class="absolute top-4 left-4 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            NEW ARRIVAL
          </div>
        </div>

        <div class="p-6 flex-grow flex flex-col">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">
              {{ item.name }}
            </h3>
            <span class="text-lg font-bold text-yellow-700">
              ${{ item.price }}
            </span>
          </div>
          
          <p class="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
            {{ item.description }}
          </p>

          <button class="w-full py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-colors duration-300">
            加入購物車
          </button>
        </div>
      </div>
    </div>
  </div> 
</template>