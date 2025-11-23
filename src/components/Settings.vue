<template>
  <Teleport to="body">
    <Transition name="sidebar">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex" @click.self="closeSettings">
        <!-- Backdrop -->
        <div class="flex-1 bg-black/50 backdrop-blur-sm" @click="closeSettings"></div>

        <!-- Sidebar -->
        <div
          class="w-full max-w-md h-full glass-sidebar overflow-y-auto custom-scrollbar"
          @click.stop
        >
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-heading text-white">Settings</h2>
              <button
                @click="closeSettings"
                class="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                aria-label="Close settings"
              >
                <X :size="24" />
              </button>
            </div>

            <!-- Background Customization -->
            <section class="mb-8">
              <div class="flex items-center gap-2 mb-4">
                <Palette :size="20" class="text-white/70" />
                <h3 class="text-subheading text-white">Background</h3>
              </div>

              <!-- Preset Colors -->
              <div class="mb-4">
                <label class="text-small text-white/70 mb-2 block font-medium">Preset Colors</label>
                <div class="grid grid-cols-6 gap-3">
                  <button
                    v-for="(color, index) in presetColors"
                    :key="index"
                    @click="selectColor(color)"
                    :class="[
                      'h-12 rounded-lg border-2 transition-all',
                      settings.background === color
                        ? 'border-white scale-110'
                        : 'border-white/20 hover:border-white/40 hover:scale-105',
                    ]"
                    :style="{ background: color }"
                    :title="color"
                  ></button>
                </div>
              </div>

              <!-- Custom Color -->
              <div class="mb-4">
                <label class="text-small text-white/70 mb-2 block font-medium">Custom Color</label>
                <div class="flex gap-3 items-center">
                  <input
                    v-model="solidColor"
                    type="color"
                    class="h-12 w-20 rounded-lg cursor-pointer border-2 border-white/20 hover:border-white/40 transition-colors"
                  />
                  <button
                    @click="selectSolidColor"
                    class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
                  >
                    Apply Color
                  </button>
                </div>
              </div>

              <!-- Custom Image Upload -->
              <div class="mb-4">
                <label
                  class="text-small text-white/70 mb-2 block font-medium flex items-center gap-2"
                >
                  <Image :size="16" class="text-white/50" />
                  Custom Background Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                />
                <!-- Show all uploaded images gallery -->
                <div v-if="uploadedImages.length > 0" class="mt-3">
                  <div class="grid grid-cols-3 gap-3">
                    <div
                      v-for="(image, index) in uploadedImages"
                      :key="index"
                      class="relative h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
                      :class="
                        settings.background === `url(${image})`
                          ? 'border-white scale-105'
                          : 'border-white/20 hover:border-white/40'
                      "
                      @click="selectUploadedImage(image)"
                    >
                      <img
                        :src="image"
                        alt="Background option"
                        class="w-full h-full object-cover"
                      />
                      <button
                        @click.stop="removeUploadedImage(index)"
                        class="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded transition-colors"
                        title="Remove image"
                      >
                        <X :size="14" class="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Blur Intensity -->
              <div class="mb-4">
                <label class="text-small text-white/70 mb-2 block font-medium">
                  Blur Intensity: <span class="text-white">{{ settings.blurIntensity }}px</span>
                </label>
                <input
                  v-model.number="settings.blurIntensity"
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  class="w-full"
                />
              </div>

              <!-- Overlay Opacity -->
              <div class="mb-4">
                <label class="text-small text-white/70 mb-2 block font-medium">
                  Overlay Opacity:
                  <span class="text-white">{{ Math.round(settings.overlayOpacity * 100) }}%</span>
                </label>
                <input
                  v-model.number="settings.overlayOpacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  class="w-full"
                />
              </div>
            </section>

            <!-- Appearance Settings -->
            <section class="mb-8">
              <div class="flex items-center gap-2 mb-4">
                <Eye :size="20" class="text-white/70" />
                <h3 class="text-subheading text-white">Appearance</h3>
              </div>

              <!-- Component Visibility -->
              <div class="space-y-3 mb-4">
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Show Clock</span>
                  <input v-model="settings.showClock" type="checkbox" class="toggle-checkbox" />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Show Bookmarks</span>
                  <input v-model="settings.showBookmarks" type="checkbox" class="toggle-checkbox" />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Show Websites</span>
                  <input v-model="settings.showWebsites" type="checkbox" class="toggle-checkbox" />
                </label>
              </div>
            </section>

            <!-- Website Categories -->
            <section class="mb-8" v-if="settings.showWebsites">
              <div class="flex items-center gap-2 mb-4">
                <Grid :size="20" class="text-white/70" />
                <h3 class="text-subheading text-white">Website Categories</h3>
              </div>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Social Media</span>
                  <input
                    v-model="settings.categoryVisibility.socialMedia"
                    type="checkbox"
                    class="toggle-checkbox"
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Office Apps</span>
                  <input
                    v-model="settings.categoryVisibility.officeApps"
                    type="checkbox"
                    class="toggle-checkbox"
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Developer Tools</span>
                  <input
                    v-model="settings.categoryVisibility.developerApps"
                    type="checkbox"
                    class="toggle-checkbox"
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Cloud Services</span>
                  <input
                    v-model="settings.categoryVisibility.cloudApps"
                    type="checkbox"
                    class="toggle-checkbox"
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Education</span>
                  <input
                    v-model="settings.categoryVisibility.educationApps"
                    type="checkbox"
                    class="toggle-checkbox"
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-white/70">Design Tools</span>
                  <input
                    v-model="settings.categoryVisibility.designApps"
                    type="checkbox"
                    class="toggle-checkbox"
                  />
                </label>
              </div>
              <!-- Manage Categories & Websites Button -->
              <div class="mt-5">
                <button
                  @click="openWebsiteEditor"
                  class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors font-medium"
                >
                  <Edit3 :size="18" />
                  <span>Manage Categories & Websites</span>
                </button>
              </div>
            </section>

            <!-- Data Management -->
            <section class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <Database :size="20" class="text-white/70" />
                <h3 class="text-subheading text-white">Data Management</h3>
              </div>
              <div class="flex flex-col gap-3">
                <button
                  @click="exportSettings"
                  class="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Download :size="18" />
                  Export Settings
                </button>
                <button
                  @click="importSettings"
                  class="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Upload :size="18" />
                  Import Settings
                </button>
                <button
                  @click="resetSettings"
                  class="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <RotateCcw :size="18" />
                  Reset to Defaults
                </button>
              </div>
            </section>

            <!-- Save Button -->
            <button
              @click="saveSettings"
              class="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors bottom-0 flex items-center justify-center gap-2"
            >
              <Save :size="20" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Website Editor Instance -->
    <WebsiteEditor
      :is-open="isWebsiteEditorOpen"
      @close="isWebsiteEditorOpen = false"
      @save="handleWebsiteEditorSave"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
  X,
  Palette,
  Image,
  Eye,
  Database,
  Download,
  Upload,
  RotateCcw,
  Save,
  Grid,
  Edit3,
} from 'lucide-vue-next'
import WebsiteEditor from './WebsiteEditor.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  settingsChanged: [settings: AppSettings]
}>()

export interface AppSettings {
  background: string
  blurIntensity: number
  overlayOpacity: number
  showClock: boolean
  showBookmarks: boolean
  showWebsites: boolean
  searchEngine: 'google' | 'duckduckgo' | 'bing'
  fontSize: number
  categoryVisibility: {
    socialMedia: boolean
    officeApps: boolean
    developerApps: boolean
    cloudApps: boolean
    educationApps: boolean
    designApps: boolean
  }
}

const presetColors = [
  '#667eea', // Purple
  '#f093fb', // Pink
  '#4facfe', // Blue
  '#43e97b', // Green
  '#fa709a', // Rose
  '#30cfd0', // Cyan
  '#a8edea', // Mint
  '#ff9a9e', // Coral
  '#feca57', // Yellow
  '#ee5a6f', // Red
  '#c44569', // Dark Pink
  '#2c3e50', // Dark Blue
]

const defaultSettings: AppSettings = {
  background: '#667eea',
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

const settings = reactive<AppSettings>({ ...defaultSettings })
const solidColor = ref('#667eea')
const uploadedImages = ref<string[]>([])
const isWebsiteEditorOpen = ref(false)

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      Object.assign(settings, JSON.parse(saved))
    }

    // Load uploaded images
    const savedImages = localStorage.getItem('uploaded-images')
    if (savedImages) {
      uploadedImages.value = JSON.parse(savedImages)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

// Initialize settings
loadSettings()

const closeSettings = () => {
  emit('close')
}

const openWebsiteEditor = () => {
  isWebsiteEditorOpen.value = true
}

const handleWebsiteEditorSave = (categories: unknown[]) => {
  // Categories saved internally; future sync to IndexedDB could be added.
  console.log('Website categories saved:', categories.length)
  isWebsiteEditorOpen.value = false
}

const selectColor = (color: string) => {
  settings.background = color
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // Add to uploaded images array
      if (!uploadedImages.value.includes(result)) {
        uploadedImages.value.push(result)
        // Save to localStorage
        localStorage.setItem('uploaded-images', JSON.stringify(uploadedImages.value))
      }
      // Set as current background
      settings.background = `url(${result})`
    }
    reader.readAsDataURL(file)
  }
}

const selectUploadedImage = (image: string) => {
  settings.background = `url(${image})`
}

const selectSolidColor = () => {
  settings.background = solidColor.value
}

const removeUploadedImage = (index: number) => {
  const removedImage = uploadedImages.value[index]
  uploadedImages.value.splice(index, 1)
  // Save to localStorage
  localStorage.setItem('uploaded-images', JSON.stringify(uploadedImages.value))

  // If the removed image was the current background, reset to default
  if (settings.background === `url(${removedImage})`) {
    settings.background = presetColors[0] || '#667eea'
  }
}

const saveSettings = () => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    emit('settingsChanged', { ...settings })
    closeSettings()
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

const exportSettings = () => {
  const dataStr = JSON.stringify(settings, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'new-tab-settings.json'
  link.click()
  URL.revokeObjectURL(url)
}

const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const text = await file.text()
        const imported = JSON.parse(text)
        Object.assign(settings, imported)
        saveSettings()
      } catch (error) {
        console.error('Error importing settings:', error)
      }
    }
  }
  input.click()
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    Object.assign(settings, defaultSettings)
    saveSettings()
  }
}

// Watch for changes and emit
watch(
  () => settings,
  (newSettings) => {
    emit('settingsChanged', { ...newSettings })
  },
  { deep: true },
)
</script>

<style scoped>
.glass-sidebar {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.3s ease;
}

.sidebar-enter-from .glass-sidebar,
.sidebar-leave-to .glass-sidebar {
  transform: translateX(100%);
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}

.toggle-checkbox {
  appearance: none;
  width: 3rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-checkbox:checked {
  background: rgba(255, 255, 255, 0.4);
}

.toggle-checkbox::before {
  content: '';
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: white;
  top: 0.125rem;
  left: 0.125rem;
  transition: transform 0.3s;
}

.toggle-checkbox:checked::before {
  transform: translateX(1.5rem);
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
