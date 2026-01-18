<script setup lang="ts">
// Layout 通常不需要太多邏輯，主要負責結構
</script>

<template>
  <div class="flex flex-col min-h-screen font-sans text-[#2C1810] bg-[#F8F5F2]">
    <AppNavbar />

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-[#2C1810] text-stone-300 py-12 mt-12">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div class="text-center md:text-left">
            <h3 class="text-2xl font-bold text-white mb-2">☕ 河狸咖啡 Heli Coffee</h3>
            <p class="text-stone-400 text-sm">&copy; 2026 All Rights Reserved.</p>
          </div>

          <div class="flex items-center space-x-6">
            <!-- <a href="https://instagram.com" target="_blank" class="hover:text-[#E1306C] transition transform hover:scale-110">
              <span class="sr-only">Instagram</span>
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.488 2h-.173zm6.316 4.168c-.659 0-1.196.537-1.196 1.196s.537 1.196 1.196 1.196c.659 0 1.196-.537 1.196-1.196s-.537-1.196-1.196-1.196zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" clip-rule="evenodd" />
              </svg>
            </a> -->

            <a href="https://www.facebook.com/HeliCoffee.Taiwan/?locale=zh_TW" target="_blank" class="hover:text-[#1877F2] transition transform hover:scale-110">
              <span class="sr-only">Facebook</span>
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </footer>
    <!-- <footer class="bg-[#2C1810] text-[#F8F5F2] py-8 mt-auto">
      <div class="container mx-auto px-4 text-center">
        <p class="mb-2">河狸咖啡 Heli Coffee © {{ new Date().getFullYear() }}</p>
        <p class="text-sm text-gray-400">
          用心沖煮每一杯咖啡，溫暖每一個日常。
        </p>
      </div>
    </footer> -->

    <CartDrawer />
    
  </div>
</template>