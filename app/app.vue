<script setup lang="ts">
// 這裡可以放全域的 SEO 設定 (Meta tags)
useHead({
  title: '河狸咖啡 Heli Coffee',
  meta: [
    { name: 'description', content: '河狸咖啡 - 提供精緻手沖咖啡與手作甜點的溫馨空間' }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>