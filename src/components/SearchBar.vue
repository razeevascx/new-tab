<template>
  <div class="w-full max-w-2xl relative group">
    <div class="absolute inset-y-0 left-4 flex items-center z-10">
      <div class="relative" id="search-engine-dropdown">
        <button
          @click="toggleDropdown"
          class="flex items-center gap-2 hover:bg-white/10 rounded-lg p-1.5 transition-colors"
          title="Change search engine"
        >
          <!-- Google Icon -->
          <svg v-if="currentEngine === 'google'" class="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>

          <!-- DuckDuckGo Icon -->
          <svg
            v-else-if="currentEngine === 'duckduckgo'"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="11" fill="#DE5833" />
            <path
              d="M12 5c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"
              fill="white"
            />
            <circle cx="9.5" cy="11" r="1" fill="white" />
            <circle cx="14.5" cy="11" r="1" fill="white" />
            <path d="M12 14c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z" fill="white" />
          </svg>

          <!-- Bing Icon -->
          <svg v-else-if="currentEngine === 'bing'" class="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M5 3v18l4.5-2.5 7.5 4V8.5L9 3H5z" fill="#008373" />
            <path d="M9 3l8 5.5v14.5l-7.5-4L5 21V3h4z" fill="#00BCF2" />
          </svg>

          <!-- Yahoo Icon -->
          <svg
            v-else-if="currentEngine === 'yahoo'"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="11" fill="#6001D2" />
            <path
              d="M8 7l2.5 5.5L8 18h2l1.5-3.5L13 18h2l-2.5-5.5L15 7h-2l-1.5 3.5L10 7H8z"
              fill="white"
            />
          </svg>

          <!-- Brave Icon -->
          <svg
            v-else-if="currentEngine === 'brave'"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
              fill="#FB542B"
            />
            <path
              d="M12 4l-7 4v5c0 4.52 3.13 8.75 7 9.93 3.87-1.18 7-5.41 7-9.93V8l-7-4z"
              fill="white"
            />
            <path d="M12 7l-4 2.5v3.5c0 2.5 1.5 5 4 6 2.5-1 4-3.5 4-6V9.5L12 7z" fill="#FB542B" />
          </svg>

          <!-- Ecosia Icon -->
          <svg
            v-else-if="currentEngine === 'ecosia'"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="11" fill="#56B05B" />
            <path
              d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
              fill="white"
            />
            <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#56B05B" />
          </svg>

          <!-- Startpage Icon -->
          <svg
            v-else-if="currentEngine === 'startpage'"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect x="2" y="2" width="20" height="20" rx="3" fill="#1E3A8A" />
            <path d="M8 8h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" fill="white" />
          </svg>

          <ChevronDown :size="14" class="text-white/50" />
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div
            v-if="showDropdown"
            class="absolute top-full left-0 mt-2 glass rounded-lg p-2 min-w-[180px] shadow-xl z-50"
          >
            <button
              v-for="engine in engines"
              :key="engine.id"
              @click="selectEngine(engine.id)"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                currentEngine === engine.id
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10 text-white/80 hover:text-white',
              ]"
            >
              <component :is="engine.icon" class="w-5 h-5 shrink-0" />
              <span class="font-medium">{{ engine.name }}</span>
              <Check v-if="currentEngine === engine.id" :size="16" class="ml-auto text-white" />
            </button>
          </div>
        </Transition>
      </div>

      <div class="h-4 w-px bg-white/20 ml-2"></div>
    </div>

    <input
      type="text"
      v-model="query"
      @keydown.enter="search"
      @focus="isFocused = true"
      @blur="isFocused = false"
      :placeholder="`Search ${searchEngineName}...`"
      :class="[
        'w-full py-5 pl-20 pr-14 backdrop-blur-xl border rounded-2xl text-lg text-white placeholder-white/50',
        'focus:outline-none transition-all duration-300 shadow-2xl',
        isFocused
          ? 'bg-white/20 border-white/40 ring-4 ring-white/20 scale-[1.02]'
          : 'bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20',
      ]"
      autofocus
    />

    <!-- Search Button -->
    <button
      @click="search"
      class="absolute inset-y-0 right-2 flex items-center px-4 text-white/70 hover:text-white transition-colors"
      aria-label="Search"
    >
      <SearchIcon class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { Search as SearchIcon, ChevronDown, Check } from 'lucide-vue-next'

type SearchEngine = 'google' | 'duckduckgo' | 'bing' | 'yahoo' | 'brave' | 'ecosia' | 'startpage'

const props = withDefaults(
  defineProps<{
    searchEngine?: SearchEngine
  }>(),
  {
    searchEngine: 'google',
  },
)

const emit = defineEmits<{
  'update:searchEngine': [engine: SearchEngine]
}>()

const query = ref('')
const isFocused = ref(false)
const showDropdown = ref(false)
const currentEngine = ref<SearchEngine>(props.searchEngine)

// Search engine icons as functional components
const GoogleIcon = () =>
  h('svg', { class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', {
      d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z',
      fill: '#4285F4',
    }),
    h('path', {
      d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z',
      fill: '#34A853',
    }),
    h('path', {
      d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z',
      fill: '#FBBC05',
    }),
    h('path', {
      d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z',
      fill: '#EA4335',
    }),
  ])

const DuckDuckGoIcon = () =>
  h('svg', { class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none' }, [
    h('circle', { cx: '12', cy: '12', r: '11', fill: '#DE5833' }),
    h('path', {
      d: 'M12 5c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z',
      fill: 'white',
    }),
    h('circle', { cx: '9.5', cy: '11', r: '1', fill: 'white' }),
    h('circle', { cx: '14.5', cy: '11', r: '1', fill: 'white' }),
    h('path', { d: 'M12 14c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z', fill: 'white' }),
  ])

const BingIcon = () =>
  h('svg', { class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M5 3v18l4.5-2.5 7.5 4V8.5L9 3H5z', fill: '#008373' }),
    h('path', { d: 'M9 3l8 5.5v14.5l-7.5-4L5 21V3h4z', fill: '#00BCF2' }),
  ])

const YahooIcon = () =>
  h('svg', { class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none' }, [
    h('circle', { cx: '12', cy: '12', r: '11', fill: '#6001D2' }),
    h('path', {
      d: 'M8 7l2.5 5.5L8 18h2l1.5-3.5L13 18h2l-2.5-5.5L15 7h-2l-1.5 3.5L10 7H8z',
      fill: 'white',
    }),
  ])

const BraveIcon = () =>
  h('svg', { class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', {
      d: 'M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z',
      fill: '#FB542B',
    }),
    h('path', {
      d: 'M12 4l-7 4v5c0 4.52 3.13 8.75 7 9.93 3.87-1.18 7-5.41 7-9.93V8l-7-4z',
      fill: 'white',
    }),
    h('path', { d: 'M12 7l-4 2.5v3.5c0 2.5 1.5 5 4 6 2.5-1 4-3.5 4-6V9.5L12 7z', fill: '#FB542B' }),
  ])

const EcosiaIcon = () =>
  h('svg', { class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none' }, [
    h('circle', { cx: '12', cy: '12', r: '11', fill: '#56B05B' }),
    h('path', {
      d: 'M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
      fill: 'white',
    }),
    h('path', { d: 'M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z', fill: '#56B05B' }),
  ])

const StartpageIcon = () =>
  h('svg', { class: 'w-5 h-5', viewBox: '0 0 24 24', fill: 'none' }, [
    h('rect', { x: '2', y: '2', width: '20', height: '20', rx: '3', fill: '#1E3A8A' }),
    h('path', { d: 'M8 8h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z', fill: 'white' }),
  ])

const engines = [
  { id: 'google' as const, name: 'Google', icon: GoogleIcon },
  { id: 'duckduckgo' as const, name: 'DuckDuckGo', icon: DuckDuckGoIcon },
  { id: 'bing' as const, name: 'Bing', icon: BingIcon },
  { id: 'yahoo' as const, name: 'Yahoo', icon: YahooIcon },
  { id: 'brave' as const, name: 'Brave', icon: BraveIcon },
  { id: 'ecosia' as const, name: 'Ecosia', icon: EcosiaIcon },
  { id: 'startpage' as const, name: 'Startpage', icon: StartpageIcon },
]

const searchUrls: Record<SearchEngine, string> = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q=',
  yahoo: 'https://search.yahoo.com/search?p=',
  brave: 'https://search.brave.com/search?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
  startpage: 'https://www.startpage.com/do/search?q=',
}

const searchEngineNames: Record<SearchEngine, string> = {
  google: 'Google',
  duckduckgo: 'DuckDuckGo',
  bing: 'Bing',
  yahoo: 'Yahoo',
  brave: 'Brave',
  ecosia: 'Ecosia',
  startpage: 'Startpage',
}

const searchEngineName = computed(() => searchEngineNames[currentEngine.value])

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectEngine = (engineId: SearchEngine) => {
  currentEngine.value = engineId
  showDropdown.value = false
  emit('update:searchEngine', engineId)

  // Save to localStorage
  try {
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    settings.searchEngine = engineId
    localStorage.setItem('app-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving search engine:', error)
  }
}

const search = () => {
  if (query.value.trim()) {
    const baseUrl = searchUrls[currentEngine.value]
    globalThis.location.href = `${baseUrl}${encodeURIComponent(query.value)}`
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = document.getElementById('search-engine-dropdown')
  if (dropdown && !dropdown.contains(target)) {
    showDropdown.value = false
  }
}

// Close dropdown when changing tabs
const handleVisibilityChange = () => {
  if (document.hidden) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Load saved search engine
  try {
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    if (settings.searchEngine) {
      currentEngine.value = settings.searchEngine
    }
  } catch (error) {
    console.error('Error loading search engine:', error)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
