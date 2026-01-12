<script setup lang="ts">
import { ref } from 'vue'
// 1. 引入 Store (Nuxt 自動引入，不需要 import)
const cartStore = useCartStore()

// 控制手機版選單開關
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const navLinks = [
  { name: '關於我們', path: '/about' },
  { name: '美味菜單', path: '/menu' },
  { name: '線上訂購', path: '/shop' },
  { name: '立即訂位', path: '/booking' }
]
</script>

<template>
  <nav class="bg-[#2C1810] text-[#F8F5F2] sticky top-0 z-50 shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <NuxtLink to="/" class="text-2xl font-bold tracking-wider hover:text-[#D4B483] transition">
          河狸咖啡 Heli Coffee
        </NuxtLink>

        <div class="hidden md:flex space-x-8 items-center">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="hover:text-[#D4B483] transition duration-300 font-medium"
          >
            {{ link.name }}
          </NuxtLink>
          
          <button 
            @click="cartStore.isCartOpen = !cartStore.isCartOpen"
            class="relative hover:text-[#D4B483] transition p-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 group-hover:scale-110 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            
            <span 
              v-if="cartStore.totalItems > 0"
              class="absolute -top-1 -right-1 bg-[#D4B483] text-[#2C1810] text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] flex items-center justify-center animate-bounce"
            >
              {{ cartStore.totalItems }}
            </span>
          </button>
        </div>

        <button @click="toggleMobileMenu" class="md:hidden p-2 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-show="isMobileMenuOpen" class="md:hidden py-4 border-t border-[#3E2723]">
        <div class="flex flex-col space-y-4">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="block px-2 py-1 hover:text-[#D4B483]"
            @click="isMobileMenuOpen = false"
          >
            {{ link.name }}
          </NuxtLink>
          
          <button 
            @click="cartStore.isCartOpen = true; isMobileMenuOpen = false"
            class="flex items-center space-x-2 px-2 py-1 hover:text-[#D4B483] text-left w-full"
          >
             <span>我的購物車</span>
             <span v-if="cartStore.totalItems > 0" class="bg-[#D4B483] text-[#2C1810] text-xs font-bold px-2 py-0.5 rounded-full">
               {{ cartStore.totalItems }}
             </span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>