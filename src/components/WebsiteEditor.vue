<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="w-full max-w-4xl max-h-[90vh] glass rounded-3xl overflow-hidden shadow-2xl"
          @click.stop
        >
          <!-- Header -->
          <div
            class="sticky top-0 glass-strong border-b border-white/10 p-6 flex items-center justify-between z-10"
          >
            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
              <Edit3 :size="24" class="text-white/70" />
              Website Editor
            </h2>
            <button
              @click="close"
              class="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              aria-label="Close editor"
            >
              <X :size="24" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
            <!-- Categories List -->
            <div class="space-y-6">
              <div
                v-for="(category, index) in editableCategories"
                :key="category.id"
                class="glass rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <!-- Category Header -->
                <div class="flex items-center gap-3 mb-4">
                  <button
                    class="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-move"
                    title="Drag to reorder"
                  >
                    <GripVertical :size="20" class="text-white/50" />
                  </button>
                  <input
                    v-model="category.name"
                    type="text"
                    class="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15"
                    placeholder="Category name"
                  />
                  <button
                    @click="toggleCategory(category.id)"
                    :class="[
                      'p-2 rounded-lg transition-colors',
                      category.visible
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-white/10 text-white/50',
                    ]"
                    :title="category.visible ? 'Hide category' : 'Show category'"
                  >
                    <component :is="category.visible ? Eye : EyeOff" :size="20" />
                  </button>
                  <button
                    @click="removeCategory(index)"
                    class="p-2 rounded-lg hover:bg-red-500/20 text-red-300 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 :size="20" />
                  </button>
                </div>

                <!-- Websites Grid -->
                <div
                  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4"
                >
                  <div
                    v-for="(website, wIndex) in category.websites"
                    :key="website.id"
                    class="relative group/item"
                  >
                    <div
                      class="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-move"
                    >
                      <img
                        :src="getFaviconUrl(website.url)"
                        :alt="website.name"
                        class="w-8 h-8 object-contain"
                        @error="(e: Event) => handleImageError(e, website.url)"
                      />
                      <input
                        v-model="website.name"
                        type="text"
                        class="w-full bg-transparent text-xs text-white/70 text-center border-0 focus:outline-none focus:text-white"
                        @click.stop
                      />
                      <button
                        @click="removeWebsite(category.id, wIndex)"
                        class="absolute -top-2 -right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                        title="Remove website"
                      >
                        <X :size="14" class="text-white" />
                      </button>
                    </div>
                  </div>

                  <!-- Add Website Button -->
                  <button
                    @click="showAddWebsiteDialog(category.id)"
                    class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
                  >
                    <Plus :size="24" class="text-white/50" />
                    <span class="text-xs text-white/50">Add Website</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Add Category Button -->
            <button
              @click="addCategory"
              class="w-full mt-6 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-white/70 hover:text-white"
            >
              <FolderPlus :size="24" />
              <span class="font-semibold">Add New Category</span>
            </button>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 glass-strong border-t border-white/10 p-6 flex gap-3">
            <button
              @click="resetToDefaults"
              class="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
            >
              Reset to Defaults
            </button>
            <button
              @click="saveChanges"
              class="flex-1 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl transition-colors font-semibold shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add Website Dialog -->
    <Transition name="modal">
      <div
        v-if="showAddDialog"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeAddDialog"
      >
        <div class="w-full max-w-md glass rounded-2xl p-6" @click.stop>
          <h3 class="text-xl font-bold text-white mb-4">Add Website</h3>
          <div class="space-y-4">
            <div>
              <label class="text-sm text-white/70 mb-2 block">Website Name</label>
              <input
                v-model="newWebsite.name"
                type="text"
                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15"
                placeholder="e.g., Google"
              />
            </div>
            <div>
              <label class="text-sm text-white/70 mb-2 block">Website URL</label>
              <input
                v-model="newWebsite.url"
                type="url"
                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15"
                placeholder="https://google.com"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              @click="closeAddDialog"
              class="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              @click="addWebsite"
              class="flex-1 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Edit3, Plus, Trash2, Eye, EyeOff, GripVertical, FolderPlus } from 'lucide-vue-next'
import { getFaviconUrl } from '../utils/favicon'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [categories: CategoryData[]]
}>()

interface Website {
  id: string
  name: string
  url: string
}

interface CategoryData {
  id: string
  name: string
  visible: boolean
  websites: Website[]
}

const editableCategories = ref<CategoryData[]>([])
const showAddDialog = ref(false)
const currentCategoryId = ref<string>('')
const newWebsite = ref({ name: '', url: '' })

// Load categories from localStorage or use defaults
const loadCategories = () => {
  try {
    const saved = localStorage.getItem('custom-websites')
    if (saved) {
      editableCategories.value = JSON.parse(saved)
    } else {
      // Load default categories
      loadDefaultCategories()
    }
  } catch (error) {
    console.error('Error loading categories:', error)
    loadDefaultCategories()
  }
}

const loadDefaultCategories = () => {
  editableCategories.value = [
    {
      id: 'social-media',
      name: 'Social Media',
      visible: true,
      websites: [
        { id: 'twitter', name: 'Twitter', url: 'https://x.com/' },
        { id: 'facebook', name: 'Facebook', url: 'https://facebook.com/' },
        { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/' },
        { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/' },
        { id: 'github', name: 'Github', url: 'https://github.com/' },
        { id: 'youtube', name: 'Youtube', url: 'https://youtube.com/' },
      ],
    },
    {
      id: 'office',
      name: 'Office',
      visible: true,
      websites: [
        { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com/' },
        { id: 'outlook', name: 'Outlook', url: 'https://outlook.office.com/' },
        { id: 'drive', name: 'Google Drive', url: 'https://drive.google.com/' },
        { id: 'onedrive', name: 'OneDrive', url: 'https://onedrive.com/' },
      ],
    },
    {
      id: 'developer',
      name: 'Developer',
      visible: true,
      websites: [
        { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com/' },
        { id: 'codepen', name: 'CodePen', url: 'https://codepen.io/' },
        { id: 'vercel', name: 'Vercel', url: 'https://vercel.com/' },
      ],
    },
  ]
}

// Watch for dialog open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      loadCategories()
    }
  },
)

const close = () => {
  emit('close')
}

const addCategory = () => {
  const newId = `category-${Date.now()}`
  editableCategories.value.push({
    id: newId,
    name: 'New Category',
    visible: true,
    websites: [],
  })
}

const removeCategory = (index: number) => {
  if (confirm('Are you sure you want to delete this category?')) {
    editableCategories.value.splice(index, 1)
  }
}

const toggleCategory = (categoryId: string) => {
  const category = editableCategories.value.find((c) => c.id === categoryId)
  if (category) {
    category.visible = !category.visible
  }
}

const showAddWebsiteDialog = (categoryId: string) => {
  currentCategoryId.value = categoryId
  newWebsite.value = { name: '', url: '' }
  showAddDialog.value = true
}

const closeAddDialog = () => {
  showAddDialog.value = false
  newWebsite.value = { name: '', url: '' }
  currentCategoryId.value = ''
}

const addWebsite = () => {
  if (!newWebsite.value.name || !newWebsite.value.url) {
    alert('Please enter both name and URL')
    return
  }

  const category = editableCategories.value.find((c) => c.id === currentCategoryId.value)
  if (category) {
    category.websites.push({
      id: `website-${Date.now()}`,
      name: newWebsite.value.name,
      url: newWebsite.value.url,
    })
  }

  closeAddDialog()
}

const removeWebsite = (categoryId: string, websiteIndex: number) => {
  const category = editableCategories.value.find((c) => c.id === categoryId)
  if (category) {
    category.websites.splice(websiteIndex, 1)
  }
}

const handleImageError = (event: Event, url: string) => {
  const img = event.target as HTMLImageElement
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzk5OSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0yIDE1bC01LTUgMS40MS0xLjQxTDEwIDE0LjE3bDcuNTktNy41OUwxOSA4bC05IDl6Ii8+PC9zdmc+'
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset to default categories? This cannot be undone.')) {
    loadDefaultCategories()
  }
}

const saveChanges = () => {
  try {
    localStorage.setItem('custom-websites', JSON.stringify(editableCategories.value))
    emit('save', editableCategories.value)
    close()
  } catch (error) {
    console.error('Error saving categories:', error)
    alert('Failed to save changes')
  }
}
</script>

<style scoped>
.glass-strong {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from > div,
.modal-leave-to > div {
  opacity: 0;
  transform: translateY(20px);
}
</style>
