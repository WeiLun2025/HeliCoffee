<script setup>
defineProps({
  isOpen: Boolean,
  title: String,
  isError: Boolean
})

const emit = defineEmits(['close'])
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="emit('close')">
      
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        
        <div :class="isError ? 'bg-red-600' : 'bg-[#2C1810]'" class="h-4 w-full shrink-0"></div>

        <div class="p-6 text-center flex-1 overflow-y-auto">
          <div class="mb-5 inline-flex items-center justify-center w-16 h-16 rounded-full shrink-0" :class="isError ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-800'">
            <svg v-if="!isError" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>

          <h3 class="text-2xl font-bold text-gray-800 mb-4">{{ title }}</h3>
          
          <div class="text-gray-600 mb-6 text-left bg-stone-50 p-4 rounded-lg border border-stone-100 text-sm leading-relaxed">
            <slot />
          </div>

          <button 
            @click="emit('close')"
            class="w-full py-3 px-4 rounded-xl font-bold text-white transition transform active:scale-95 shrink-0"
            :class="isError ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2C1810] hover:bg-[#3E2723]'"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>