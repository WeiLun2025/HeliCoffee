<script setup lang="ts">
// 這裡之後可以加入簡單的進場動畫邏輯
</script>

<template>
  <div class="bg-white">
    <div class="relative py-20 bg-[#f8f9fa] border-b border-gray-100">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          只想分享<span class="text-yellow-700">咖啡純粹的美好</span>
        </h1>
        <p class="text-xl text-gray-600 leading-relaxed font-light">
          這不僅是一杯飲品，更是一種生活方式的延伸。<br>
          希望每一位走進店裡的客人，都能在這個小小空間裡，找到屬於自己的片刻寧靜。
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-20">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="relative aspect-[4/5] rounded-lg overflow-hidden shadow-xl group">
          <img 
            src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=1000" 
            alt="河狸咖啡店內氛圍" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          >
          <div class="absolute inset-4 border border-white/30 rounded pointer-events-none"></div>
        </div>

        <div class="prose prose-lg text-gray-600">
          <h3 class="text-2xl font-bold text-gray-800 mb-4">這裡是我們夢想的起點</h3>
          <p class="mb-6">
            老闆與闆娘皆為土生土長的<span class="font-bold text-yellow-800">花蓮人</span>。
            懷抱著「在家鄉開一家溫馨咖啡店」的夢想，我們選擇落腳在花蓮遠東百貨旁。
          </p>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-4">小空間，大溫度</h3>
          <p class="mb-6">
            店內空間雖不寬敞，最多僅能容納 22 位顧客，但這正是我們想要的距離。
            我們用心營造溫暖氛圍，堅持手作精神，親自嚴選每顆生豆。
            讓每一位來訪的客人，都能感受到如同家一般的自在與寧靜。
          </p>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 py-20">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">咖啡與甜點的日常</h3>
            <p class="text-gray-600">
              除了咖啡之外，老闆娘也會親手製作甜點，為您的下午茶增添一抹甜蜜。
              <br><br>
              <span class="text-sm bg-gray-100 px-2 py-1 rounded">企業訂購</span>
              <span class="text-sm text-gray-500 ml-2">歡迎政府機關或企業團體訂購，可提供估價單或收據。</span>
            </p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">一期一會，每月限定</h3>
            <p class="text-gray-600">
              由於咖啡豆屬於季節性作物，我們少量購入不同產地的優質生豆，依當季狀況更新豆單。
              <br><br>
              每一批豆子皆由老闆親自挑選與烘焙，只為呈現最純粹、最有層次的風味。
            </p>
          </div>

        </div>
      </div>
    </div>

    <div class="py-20 text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">準備好品嚐一杯好咖啡了嗎？</h2>
      <NuxtLink 
        to="/menu" 
        class="inline-block bg-yellow-700 text-white px-8 py-3 rounded-full hover:bg-yellow-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
      >
        查看美味菜單
      </NuxtLink>
    </div>
  </div>
</template>