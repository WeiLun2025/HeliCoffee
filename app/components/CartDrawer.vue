<script setup lang="ts">
const cartStore = useCartStore()

// 根據溫層顯示提示文字
const shippingTip = computed(() => {
  switch (cartStore.shippingCondition) {
    case 'normal': return '本單將使用常溫配送'
    case 'cool': return '本單將使用低溫/冷藏配送'
    case 'mixed': return '⚠️ 訂單包含常溫與冷藏商品，運費將分開計算或以冷藏寄送，將由專人與您確認。'
    default: return ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="cartStore.isCartOpen" 
        class="fixed inset-0 bg-black/50 z-[60]"
        @click="cartStore.isCartOpen = false"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div 
        v-if="cartStore.isCartOpen"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
      >
        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-stone-50">
          <h2 class="text-xl font-bold text-gray-800">購物清單</h2>
          <button @click="cartStore.isCartOpen = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-grow overflow-y-auto p-5">
          <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 opacity-20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <p>購物車是空的</p>
            <button @click="cartStore.isCartOpen = false" class="text-yellow-700 font-medium hover:underline">去逛逛商品</button>
          </div>

          <ul v-else class="space-y-6">
            <li v-for="item in cartStore.items" :key="item.id" class="flex gap-4">
              <div class="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <img :src="item.image_url" :alt="item.name" class="w-full h-full object-cover">
              </div>
              
              <div class="flex-grow flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-gray-800">{{ item.name }}</h3>
                  <p class="text-sm text-gray-500">{{ item.category === 'coffee' ? '常溫' : '冷藏' }}</p>
                </div>
                <div class="flex justify-between items-end">
                  <div class="text-yellow-700 font-medium">${{ item.price }}</div>
                  
                  <div class="flex items-center border border-gray-200 rounded">
                    <button @click="cartStore.decreaseQuantity(item.id)" class="px-2 py-1 hover:bg-gray-100">-</button>
                    <span class="px-2 text-sm">{{ item.quantity }}</span>
                    <button @click="cartStore.addToCart(item)" class="px-2 py-1 hover:bg-gray-100">+</button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="cartStore.items.length > 0" class="border-t border-gray-100 p-6 bg-stone-50">
          <div v-if="cartStore.shippingCondition === 'mixed'" class="mb-4 bg-orange-50 text-orange-800 text-xs p-3 rounded border border-orange-100">
            {{ shippingTip }}
          </div>
          <div v-else class="mb-4 text-xs text-gray-500 text-center">
            {{ shippingTip }}
          </div>

          <div class="flex justify-between items-center mb-4 text-lg font-bold">
            <span>小計 (不含運)</span>
            <span>${{ cartStore.subtotal }}</span>
          </div>
          
          <div class="space-y-3">
            <NuxtLink 
              to="/checkout" 
              @click="cartStore.isCartOpen = false"
              class="block w-full bg-gray-900 text-white text-center py-3 rounded-lg hover:bg-gray-800 transition font-medium shadow-md"
            >
              填寫訂購單
            </NuxtLink>

            <button 
              @click="cartStore.isCartOpen = false"
              class="block w-full bg-white text-gray-600 text-center py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium"
            >
              繼續選購其他商品
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>