<template>
  <main
    class="min-h-screen flex flex-col items-center justify-center p-4 w-full relative overflow-hidden"
  >
    <!-- Dynamic Background -->
    <div
      class="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
      :style="backgroundStyle"
    ></div>

    <!-- Settings Button -->
    <button
      @click="isSettingsOpen = true"
      class="fixed top-6 right-6 z-40 p-3 glass rounded-full hover:bg-white/20 transition-all group"
      title="Settings (,)"
      aria-label="Open settings"
    >
      <SettingsIcon
        :size="24"
        class="text-white/70 group-hover:text-white transition-colors group-hover:rotate-90 transition-transform duration-300"
      />
    </button>

    <div class="container mx-auto max-w-5xl relative z-10 flex flex-col gap-12">
      <!-- Time and Search -->
      <section class="flex flex-col items-center justify-center gap-8 animate-fade-in">
        <Clock v-if="settings.showClock" />
        <Search :search-engine="settings.searchEngine" />
      </section>

      <!-- Content Grid -->
      <div class="flex flex-col gap-8 w-full animate-slide-up">
        <div v-if="settings.showBookmarks" class="flex flex-col gap-6">
          <Bookmarks />
        </div>
        <div v-if="settings.showWebsites" class="flex flex-col gap-6">
          <Websites :category-visibility="settings.categoryVisibility" />
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <Settings
      :is-open="isSettingsOpen"
      @close="isSettingsOpen = false"
      @settings-changed="handleSettingsChanged"
    />

    <!-- Quick Notes Panel -->
    <QuickNotes :is-open="isNotesOpen" @close="isNotesOpen = false" />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Settings as SettingsIcon } from 'lucide-vue-next'
import Clock from './Clock.vue'
import Search from './SearchBar.vue'
import Websites from './Websites.vue'
import Bookmarks from './Bookmarks.vue'
import Settings, { type AppSettings } from './Settings.vue'
import QuickNotes from './QuickNotes.vue'

const isSettingsOpen = ref(false)
const isNotesOpen = ref(false)

const defaultSettings: AppSettings = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  blurIntensity: 10,
  overlayOpacity: 0.2,
  showClock: true,
  showBookmarks: true,
  showWebsites: true,
  searchEngine: 'google',
  fontSize: 100,
  categoryVisibility: {
    socialMedia: true,
    officeApps: true,
    developerApps: true,
    cloudApps: true,
    educationApps: true,
    designApps: true,
  },
}

const settings = ref<AppSettings>({ ...defaultSettings })

// Load settings on mount
onMounted(() => {
  try {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      settings.value = { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
})

const handleSettingsChanged = (newSettings: AppSettings) => {
  settings.value = newSettings
}

const backgroundStyle = computed(() => ({
  background: settings.value.background,
  filter: `blur(${settings.value.blurIntensity}px)`,
  opacity: 1 - settings.value.overlayOpacity,
}))

// Keyboard shortcuts
onMounted(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    if (e.key === ',' || e.key === 's') {
      e.preventDefault()
      isSettingsOpen.value = true
    } else if (e.key === 'n') {
      e.preventDefault()
      isNotesOpen.value = !isNotesOpen.value
    } else if (e.key === 'Escape') {
      isSettingsOpen.value = false
      isNotesOpen.value = false
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
})
</script>
