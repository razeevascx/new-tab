<template>
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-50 p-4"
        @click.self="closeNotes"
      >
        <div
          class="glass rounded-t-2xl p-6 max-w-2xl mx-auto max-h-[60vh] overflow-y-auto custom-scrollbar"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-subheading text-white">Quick Notes</h3>
            <div class="flex items-center gap-2">
              <button
                @click="toggleMode"
                class="px-3 py-1.5 rounded-lg text-sm bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 font-medium"
              >
                <component :is="mode === 'notes' ? FileText : CheckSquare" :size="16" />
                {{ mode === 'notes' ? 'Notes' : 'Todo' }}
              </button>
              <button
                @click="closeNotes"
                class="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                aria-label="Close notes"
              >
                <X :size="20" />
              </button>
            </div>
          </div>

          <!-- Add New Note/Todo -->
          <div class="mb-4">
            <div class="flex gap-2">
              <input
                v-model="newItemText"
                @keydown.enter="addItem"
                :placeholder="mode === 'notes' ? 'Add a note...' : 'Add a todo...'"
                class="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
              <button
                @click="addItem"
                class="bg-white text-black px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2"
              >
                <Plus :size="18" />
                Add
              </button>
            </div>
          </div>

          <!-- Notes/Todos List -->
          <div class="space-y-2">
            <div
              v-for="item in items"
              :key="item.id"
              class="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <!-- Checkbox for todos -->
              <input
                v-if="mode === 'todo'"
                type="checkbox"
                v-model="item.completed"
                @change="saveItems"
                class="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 cursor-pointer"
              />

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p
                  :class="[
                    'text-white/90 break-words',
                    mode === 'todo' && item.completed && 'line-through text-white/50',
                  ]"
                >
                  {{ item.text }}
                </p>
                <span class="text-xs text-white/40">{{ formatDate(item.createdAt) }}</span>
              </div>

              <!-- Delete Button -->
              <button
                @click="deleteItem(item.id)"
                class="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-white/10 transition-all text-white/50 hover:text-red-400"
                aria-label="Delete item"
              >
                <Trash2 :size="16" />
              </button>
            </div>

            <div v-if="items.length === 0" class="text-center py-8 text-white/50">
              {{ mode === 'notes' ? 'No notes yet' : 'No todos yet' }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { X, FileText, CheckSquare, Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

interface NoteItem {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

type Mode = 'notes' | 'todo'

const mode = ref<Mode>('notes')
const newItemText = ref('')
const notesData = ref<NoteItem[]>([])
const todosData = ref<NoteItem[]>([])

const items = computed(() => (mode.value === 'notes' ? notesData.value : todosData.value))

// Load data from localStorage
onMounted(() => {
  try {
    const savedNotes = localStorage.getItem('quick-notes')
    const savedTodos = localStorage.getItem('quick-todos')
    const savedMode = localStorage.getItem('quick-notes-mode')

    if (savedNotes) notesData.value = JSON.parse(savedNotes)
    if (savedTodos) todosData.value = JSON.parse(savedTodos)
    if (savedMode) mode.value = savedMode as Mode
  } catch (error) {
    console.error('Error loading notes:', error)
  }
})

const saveItems = () => {
  try {
    localStorage.setItem('quick-notes', JSON.stringify(notesData.value))
    localStorage.setItem('quick-todos', JSON.stringify(todosData.value))
    localStorage.setItem('quick-notes-mode', mode.value)
  } catch (error) {
    console.error('Error saving notes:', error)
  }
}

const addItem = () => {
  if (newItemText.value.trim()) {
    const newItem: NoteItem = {
      id: Date.now().toString(),
      text: newItemText.value.trim(),
      completed: false,
      createdAt: Date.now(),
    }

    if (mode.value === 'notes') {
      notesData.value.unshift(newItem)
    } else {
      todosData.value.unshift(newItem)
    }

    newItemText.value = ''
    saveItems()
  }
}

const deleteItem = (id: string) => {
  if (mode.value === 'notes') {
    notesData.value = notesData.value.filter((item) => item.id !== id)
  } else {
    todosData.value = todosData.value.filter((item) => item.id !== id)
  }
  saveItems()
}

const toggleMode = () => {
  mode.value = mode.value === 'notes' ? 'todo' : 'notes'
  saveItems()
}

const closeNotes = () => {
  emit('close')
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

watch(
  () => items.value,
  () => saveItems(),
  { deep: true }
)
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}
</style>
