<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const productStore = useProductStore()
const cartStore = useCartStore()

const activeTab = ref<'coffee' | 'cake'>('coffee')

onMounted(() => {
  productStore.fetchProducts()
})

const currentProducts = computed(() => {
  return activeTab.value === 'coffee' 
    ? productStore.coffeeList 
    : productStore.cakeList
})
</script>

<template>
  <div class="bg-white min-h-screen pb-20">
    <div class="pt-16 pb-8 text-center px-4 bg-stone-50 mb-10">
      <h1 class="text-3xl font-bold text-gray-800 mb-2 tracking-widest">ONLINE SHOP</h1>
      <p class="text-gray-500 text-sm">線上訂購，宅配到府</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="flex justify-center mb-10 space-x-2">
        <button 
          @click="activeTab = 'coffee'"
          class="px-6 py-2 rounded-full border transition-all"
          :class="activeTab === 'coffee' ? 'bg-yellow-800 text-white border-yellow-800' : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-800'"
        >
          ☕ 精品咖啡
        </button>
        <button 
          @click="activeTab = 'cake'"
          class="px-6 py-2 rounded-full border transition-all"
          :class="activeTab === 'cake' ? 'bg-yellow-800 text-white border-yellow-800' : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-800'"
        >
          🍰 手作甜點
        </button>
      </div>

      <div v-if="productStore.isLoading" class="text-center py-10">
        <p class="text-gray-400">商品載入中...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div 
          v-for="item in currentProducts" 
          :key="item.id"
          class="group flex flex-col"
        >
          <div class="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            <img 
              :src="item.image_url" 
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerpolicy="no-referrer"
            >
            <div v-if="item.is_new_arrival" class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">NEW</div>
          </div>

          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-bold text-gray-800">{{ item.name }}</h3>
              <p class="text-sm text-gray-500 line-clamp-2 mt-1">{{ item.description }}</p>
            </div>
            <span class="font-bold text-yellow-800">${{ item.price }}</span>
          </div>

          <button 
            @click="cartStore.addToCart(item)"
            class="mt-auto w-full border border-gray-900 text-gray-900 py-2 rounded hover:bg-gray-900 hover:text-white transition"
          >
            加入購物車
          </button>
        </div>
      </div>
      
      <div v-if="!productStore.isLoading && currentProducts.length === 0" class="text-center py-20 text-gray-400">
        <p>目前此分類尚無商品上架。</p>
      </div>

    </div>

    <CartDrawer />
  </div>
</template>