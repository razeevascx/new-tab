<template>
  <div class="w-full space-y-6">
    <div
      v-for="(websites, categoryName) in websiteCategories"
      :key="categoryName"
      v-show="isCategoryVisible(String(categoryName))"
      class="glass rounded-3xl p-8 transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:scale-[1.01] group"
    >
      <div
        class="text-xl font-bold text-white/90 mb-6 capitalize border-b border-white/10 pb-3 flex items-center gap-2 group-hover:border-white/20 transition-colors"
      >
        <div class="w-1 h-6 bg-gradient-to-b from-white/80 to-white/40 rounded-full"></div>
        {{ formatCategoryName(String(categoryName)) }}
      </div>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
      >
        <a
          v-for="(url, name) in websites"
          :key="name"
          :href="url"
          target="_blank"
          class="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="relative p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10 transition-all duration-300 shadow-lg group-hover:shadow-2xl ring-1 ring-white/10 group-hover:ring-white/30"
          >
            <img
              :src="getFaviconUrl(url)"
              :alt="formatWebsiteName(String(name))"
              class="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-125 group-hover:rotate-3"
              @error="(e) => handleImageError(e, url)"
            />
            <div
              class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
          </div>
          <span
            class="text-sm font-semibold text-white/70 group-hover:text-white transition-colors text-center truncate w-full"
          >
            {{ formatWebsiteName(String(name)) }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getFaviconUrl } from '@/utils/favicon'
import {
  SocialMedia,
  OfficeApps,
  DeveloperApps,
  CloudApps,
  EducationApps,
  DesignApps,
} from '@/data/Website'

const props = withDefaults(
  defineProps<{
    categoryVisibility?: {
      socialMedia?: boolean
      officeApps?: boolean
      developerApps?: boolean
      cloudApps?: boolean
      educationApps?: boolean
      designApps?: boolean
    }
  }>(),
  {
    categoryVisibility: () => ({
      socialMedia: true,
      officeApps: true,
      developerApps: true,
      cloudApps: true,
      educationApps: true,
      designApps: true,
    }),
  },
)

interface WebsiteData {
  [key: string]: string
}

interface WebsiteCategories {
  [categoryName: string]: WebsiteData
}

const websiteCategories = ref<WebsiteCategories>({})

const isCategoryVisible = (categoryName: string): boolean => {
  const mapping: { [key: string]: keyof typeof props.categoryVisibility } = {
    socialMedia: 'socialMedia',
    officeApps: 'officeApps',
    developerApps: 'developerApps',
    cloudApps: 'cloudApps',
    educationApps: 'educationApps',
    designApps: 'designApps',
  }

  const key = mapping[categoryName]
  return key ? props.categoryVisibility[key] !== false : true
}

// IndexedDB utilities
const DB_NAME = 'NewTabExtension'
const DB_VERSION = 1
const WEBSITES_STORE = 'websites'

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create websites store if it doesn't exist
      if (!db.objectStoreNames.contains(WEBSITES_STORE)) {
        db.createObjectStore(WEBSITES_STORE, { keyPath: 'id' })
      }
    }
  })
}

const loadWebsitesFromIndexedDB = async (): Promise<WebsiteCategories | null> => {
  try {
    const db = await openDB()
    const transaction = db.transaction([WEBSITES_STORE], 'readonly')
    const store = transaction.objectStore(WEBSITES_STORE)

    return new Promise((resolve, reject) => {
      const request = store.get('website-categories')
      request.onsuccess = () => {
        resolve(request.result?.data || null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error loading websites from IndexedDB:', error)
    return null
  }
}

const saveWebsitesToIndexedDB = async (data: WebsiteCategories): Promise<void> => {
  try {
    const db = await openDB()
    const transaction = db.transaction([WEBSITES_STORE], 'readwrite')
    const store = transaction.objectStore(WEBSITES_STORE)

    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        id: 'website-categories',
        data: data,
        lastUpdated: Date.now(),
      })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error saving websites to IndexedDB:', error)
  }
}

const loadWebsitesFromTS = (): WebsiteCategories => {
  try {
    // Load all categories from the TypeScript file
    return {
      socialMedia: SocialMedia,
      officeApps: OfficeApps,
      developerApps: DeveloperApps,
      cloudApps: CloudApps,
      educationApps: EducationApps,
      designApps: DesignApps,
    }
  } catch (error) {
    console.error('Error loading websites from TypeScript:', error)
    // Fallback data with just social media
    return {
      socialMedia: {
        twitter: 'https://x.com',
        facebook: 'https://facebook.com/',
        instagram: 'https://instagram.com/',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
      },
    }
  }
}

const formatCategoryName = (categoryName: string): string => {
  // Convert camelCase to readable format
  return categoryName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Apps$/, '')
    .trim()
}

const formatWebsiteName = (websiteName: string): string => {
  // Format website names for display
  return websiteName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

const handleImageError = (event: Event, fallbackUrl: string): void => {
  const img = event.target as HTMLImageElement
  // Try to load favicon using getFaviconUrl as fallback
  if (!img.src.includes('google.com/s2/favicons')) {
    img.src = getFaviconUrl(fallbackUrl)
  } else {
    // If Google favicon also fails, hide the image
    img.style.display = 'none'
  }
}

const loadWebsites = async (): Promise<void> => {
  try {
    // First try to load from IndexedDB
    let websitesData = await loadWebsitesFromIndexedDB()

    if (!websitesData) {
      console.log('No websites found in IndexedDB, loading from TypeScript file...')
      // If not in IndexedDB, load from TypeScript file and save to IndexedDB
      websitesData = loadWebsitesFromTS()
      await saveWebsitesToIndexedDB(websitesData)
    }

    websiteCategories.value = websitesData
  } catch (error) {
    console.error('Error loading websites:', error)
    // Fallback to TypeScript data
    websiteCategories.value = loadWebsitesFromTS()
  }
}

onMounted(() => {
  loadWebsites()
})
</script>
