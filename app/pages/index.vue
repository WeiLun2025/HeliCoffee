<script setup lang="ts">
// 首頁邏輯主要由各個元件自己處理
</script>

<template>
  <div>
    <HomeCarousel />

    <section class="py-16 md:py-24 bg-[#F8F5F2]">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-[#2C1810] mb-6 tracking-wider">
          歡迎來到河狸咖啡
        </h1>
        <p class="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
          在這裡，我們相信一杯好咖啡能改變一整天的心情。<br>
          選用頂級精品豆，搭配每日手作甜點，<br>
          為忙碌的您提供一個能夠深呼吸的角落。
        </p>
        
        <div class="mt-10 flex justify-center gap-4">
          <NuxtLink to="/menu" class="px-8 py-3 border-2 border-[#2C1810] text-[#2C1810] font-bold hover:bg-[#2C1810] hover:text-[#F8F5F2] transition duration-300">
            瀏覽菜單
          </NuxtLink>
          <NuxtLink to="/shop" class="px-8 py-3 bg-[#2C1810] text-[#F8F5F2] font-bold hover:bg-[#3E2723] transition duration-300">
            線上訂購
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>