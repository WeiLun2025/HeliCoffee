<script setup lang="ts">
const cartStore = useCartStore()

// App 初始化時，從 LocalStorage 讀取購物車
onMounted(() => {
  cartStore.initCart()
})

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