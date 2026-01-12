<script setup>
import { onMounted } from 'vue'
import { useNewsStore } from '~/stores/news'

const newsStore = useNewsStore()

onMounted(() => {
  newsStore.fetchNews()
})

// 標籤顏色對應 (Helper)
const getTagColor = (tag) => {
  const map = {
    '公告': 'bg-red-100 text-red-700',
    '新品': 'bg-amber-100 text-amber-700',
    '優惠': 'bg-green-100 text-green-700'
  }
  return map[tag] || 'bg-gray-100 text-gray-700'
}
// 在 <script setup> 中加入這個 helper function
const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  // 轉回當地時間 (瀏覽器會自動抓使用者的時區，如台灣)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<template>
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-amber-900 tracking-wide mb-2">
          最新消息
        </h2>
        <p class="text-stone-500">News & Events</p>
      </div>

      <div v-if="newsStore.isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="item in newsStore.activeNews" 
          :key="item.id"
          class="group bg-stone-50 p-6 rounded-xl border border-stone-100 hover:shadow-md hover:border-amber-200 transition duration-300"
        >
          <div class="flex justify-between items-start mb-4">
            <span class="text-sm font-mono text-stone-500 bg-white px-2 py-1 rounded border border-stone-100">
              {{ formatDate(item.date) }}
            </span>
            <span 
              :class="getTagColor(item.tag)"
              class="text-xs font-bold px-3 py-1 rounded-full"
            >
              {{ item.tag }}
            </span>
          </div>

          <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-700 transition">
            {{ item.title }}
          </h3>
          <p class="text-stone-600 leading-relaxed line-clamp-3">
            {{ item.content }}
          </p>
          
          <div class="mt-4 pt-4 border-t border-stone-200">
             <span class="text-amber-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
               閱讀更多 <span>→</span>
             </span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>