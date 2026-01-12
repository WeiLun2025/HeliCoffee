<script setup lang="ts">
// Nuxt 4 自動引入 components，無需手動 import CartDrawer
</script>

<template>
  <div class="flex flex-col min-h-screen font-sans text-[#2C1810] bg-[#F8F5F2]">
    <AppNavbar />

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-[#2C1810] text-[#F8F5F2] py-8 mt-auto">
      <div class="container mx-auto px-4 text-center">
        <p class="mb-2">河狸咖啡 Heli Coffee © {{ new Date().getFullYear() }}</p>
        <p class="text-sm text-gray-400">
          用心沖煮每一杯咖啡，溫暖每一個日常。
        </p>
      </div>
    </footer>

    <CartDrawer />
    
  </div>
</template>