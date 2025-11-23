<template>
  <div class="text-center max-w-2xl mx-auto p-6 rounded-2xl glass transition-all duration-500 hover:bg-white/10">
    <div v-if="loading" class="text-white/60 animate-pulse">Loading inspiration...</div>
    <div v-else class="space-y-4 animate-fade-in">
      <p class="text-lg md:text-xl font-medium italic text-white/90 mb-3 leading-relaxed">
        "{{ quote.text }}"
      </p>
      <p class="text-sm font-bold text-white/60 uppercase tracking-widest">
        — {{ quote.author }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Quote {
  text: string
  author: string
}

const quote = ref<Quote>({ text: '', author: '' })
const loading = ref(true)

const fallbackQuotes: Quote[] = [
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: 'John Lennon',
  },
  {
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
  },
  {
    text: 'It is during our darkest moments that we must focus to see the light.',
    author: 'Aristotle',
  },
  {
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
  },
]

const getRandomFallbackQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
  return fallbackQuotes[randomIndex]!
}

const getNewQuote = async () => {
  loading.value = true

  try {
    const response = await fetch('https://api.quotable.io/random?minLength=50&maxLength=150')
    if (response.ok) {
      const data = await response.json()
      quote.value = {
        text: data.content,
        author: data.author,
      }
    } else {
      throw new Error('API failed')
    }
  } catch {
    quote.value = getRandomFallbackQuote()
  }

  loading.value = false
}

onMounted(() => {
  getNewQuote()
})
</script>
