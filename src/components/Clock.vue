<template>
  <div class="text-center flex flex-col items-center animate-fade-in">
    <div
      class="text-8xl lg:text-9xl font-bold mb-4 tracking-tight drop-shadow-2xl text-white relative"
    >
      <span
        class="bg-gradient-to-br from-white via-white to-white/80 bg-clip-text text-transparent"
      >
        {{ currentTime }}
      </span>
    </div>
    <div class="text-xl lg:text-2xl text-white/70 font-semibold tracking-widest uppercase">
      {{ currentDate }}
    </div>
    <div class="mt-2 flex items-center gap-2 text-sm text-white/50">
      <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
      <span>{{ greeting }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const currentDate = ref('')
const greeting = ref('')
let intervalId: number | null = null

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  greeting.value = getGreeting()
}

onMounted(() => {
  updateTime()
  intervalId = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
