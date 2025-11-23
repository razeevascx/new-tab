<!-- BookmarksComponent -->
<template>
  <div class="glass rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 w-full">
    <div class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
      <h2 class="text-white/90 text-xl font-semibold flex items-center gap-2">
        Bookmarks
      </h2>
      <div class="flex flex-wrap justify-center gap-2">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            selectedCategory === category
              ? 'bg-white text-black shadow-lg scale-105'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
          ]"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      <a
        v-for="bookmark in filteredBookmarks"
        :key="bookmark.id"
        :href="bookmark.url"
        target="_blank"
        class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 group"
        :title="bookmark.title"
      >
        <div class="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
          <img
            :src="getFaviconUrl(bookmark.url, 32)"
            :alt="bookmark.title"
            class="w-5 h-5 object-contain"
            @error="handleImageError"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div
            class="text-white/90 text-sm font-medium truncate group-hover:text-white transition-colors"
          >
            {{ bookmark.title }}
          </div>
          <div class="text-white/40 text-xs truncate group-hover:text-white/60 transition-colors">
            {{ getDomain(bookmark.url) }}
          </div>
        </div>
      </a>
    </div>

    <div v-if="filteredBookmarks.length === 0" class="text-center py-12">
      <div v-if="!hasPermission" class="space-y-4">
        <div class="text-white/60 text-sm">Access your browser bookmarks for quick navigation</div>
        <button
          @click="requestPermission"
          :disabled="isLoading"
          class="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-sm transition-all font-semibold shadow-lg hover:shadow-xl active:scale-95"
        >
          <span v-if="isLoading">Requesting...</span>
          <span v-else>Allow Access</span>
        </button>
      </div>
      <div v-else class="space-y-4">
        <div class="text-white/60 text-sm">
          No bookmarks found in {{ selectedCategory }} category
        </div>
        <button
          @click="loadBookmarks"
          :disabled="isLoading"
          class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Refresh</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getFaviconUrl } from '../utils/favicon'

// Chrome API types
declare global {
  interface Window {
    chrome?: {
      permissions: {
        contains: (
          permissions: { permissions: string[] },
          callback: (result: boolean) => void,
        ) => void
        request: (
          permissions: { permissions: string[] },
          callback: (granted: boolean) => void,
        ) => void
      }
      bookmarks: {
        getTree: (callback: (results: ChromeBookmark[]) => void) => void
      }
      runtime: {
        lastError?: { message: string }
      }
    }
  }
}

interface Bookmark {
  id: string | number
  title: string
  url: string
  category: string
  dateAdded?: number
}

interface ChromeBookmark {
  id: string
  title: string
  url?: string
  children?: ChromeBookmark[]
  dateAdded?: number
}

const bookmarks = ref<Bookmark[]>([])
const selectedCategory = ref<string>('All')
const isLoading = ref(false)
const hasPermission = ref(false)

// Check permission
const checkPermission = async (): Promise<boolean> => {
  try {
    if (window.chrome === undefined || !window.chrome.permissions) {
      return false
    }

    return new Promise((resolve) => {
      window.chrome!.permissions.contains({ permissions: ['bookmarks'] }, (result: boolean) => {
        hasPermission.value = result
        resolve(result)
      })
    })
  } catch {
    return false
  }
}

// Request bookmarks permission
const requestBookmarksPermission = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.chrome === undefined || !window.chrome.permissions) {
      resolve(false)
      return
    }

    window.chrome!.permissions.request({ permissions: ['bookmarks'] }, (granted: boolean) => {
      hasPermission.value = granted
      resolve(granted)
    })
  })
}

// Enhanced error handler for favicon loading
const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement
  // Final fallback to default icon
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzk5OSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0yIDE1bC01LTUgMS40MS0xLjQxTDEwIDE0LjE3bDcuNTktNy41OUwxOSA4bC05IDl6Ci8+PC9zdmc+'
}

// Convert Chrome bookmark to our format
const convertChromeBookmark = (
  chromeBookmark: ChromeBookmark,
  category: string = 'Browser',
): Bookmark => {
  return {
    id: chromeBookmark.id || `chrome-${Date.now()}-${Math.random()}`,
    title: chromeBookmark.title || 'Untitled',
    url: chromeBookmark.url!,
    category: category,
    dateAdded: chromeBookmark.dateAdded,
  }
}

// Recursively extract bookmarks from Chrome bookmark tree
const extractChromeBookmarks = (
  nodes: ChromeBookmark[],
  category: string = 'Browser',
): Bookmark[] => {
  const result: Bookmark[] = []

  for (const node of nodes) {
    if (node.url) {
      // It's a bookmark
      result.push(convertChromeBookmark(node, category))
    } else if (node.children) {
      // It's a folder, recurse into it
      const folderName = node.title || category
      result.push(...extractChromeBookmarks(node.children, folderName))
    }
  }

  return result
}

// Fetch bookmarks from Chrome API
const fetchChromeBookmarks = async (): Promise<Bookmark[]> => {
  return new Promise((resolve, reject) => {
    if (window.chrome === undefined || !window.chrome.bookmarks) {
      reject(new Error('Chrome bookmarks API not available'))
      return
    }

    window.chrome!.bookmarks.getTree((bookmarkTree: ChromeBookmark[]) => {
      if (window.chrome!.runtime.lastError) {
        reject(new Error(window.chrome!.runtime.lastError.message))
        return
      }

      try {
        const extractedBookmarks = extractChromeBookmarks(bookmarkTree)
        resolve(extractedBookmarks)
      } catch (error) {
        reject(error)
      }
    })
  })
}

// Main function to load bookmarks
const loadBookmarks = async (): Promise<void> => {
  isLoading.value = true

  try {
    // Check permission first
    const hasPerms = await checkPermission()
    if (!hasPerms) {
      bookmarks.value = []
      isLoading.value = false
      return
    }

    // Fetch bookmarks directly from Chrome API
    try {
      const chromeBookmarks = await fetchChromeBookmarks()

      // Limit to most recent 50 bookmarks to avoid clutter
      const limitedBookmarks = chromeBookmarks
        .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
        .slice(0, 50)

      bookmarks.value = limitedBookmarks
    } catch (error) {
      console.log('Error fetching bookmarks:', (error as Error).message)
      bookmarks.value = []
    }
  } catch (error) {
    console.error('Error loading bookmarks:', error)
    bookmarks.value = []
  } finally {
    isLoading.value = false
  }
}

// Manual permission request (triggered by button)
const requestPermission = async (): Promise<void> => {
  isLoading.value = true

  try {
    const granted = await requestBookmarksPermission()
    if (granted) {
      // Permission granted, now load bookmarks
      await loadBookmarks()
    }
  } catch (error) {
    console.error('Error requesting permission:', error)
  } finally {
    isLoading.value = false
  }
}

// Load bookmarks on component mount
onMounted(async () => {
  const hasPerms = await checkPermission()
  if (hasPerms) {
    await loadBookmarks()
  }
})

// Get unique categories
const categories = computed(() => {
  const cats = new Set(['All', ...bookmarks.value.map((b) => b.category)])
  return Array.from(cats)
})

// Filter bookmarks by category
const filteredBookmarks = computed(() => {
  if (selectedCategory.value === 'All') {
    return bookmarks.value
  }
  return bookmarks.value.filter((b) => b.category === selectedCategory.value)
})

// Extract domain from URL
const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}
</script>
