<script setup lang="ts">
import { ref, provide } from 'vue'
import Sidebar from './components/Sidebar.vue'
import PokemonDetailModal from './components/PokemonDetailModal.vue'

// ---------------------------
// 🔵 MODAL CONTROLS
// ---------------------------
const isModalOpen = ref(false)
const selectedPokemonId = ref<number | null>(null)
const selectedPokemonRarity = ref<'normal' | 'holo' | undefined>(undefined)

function openModal(data: { id: number, rarity?: 'normal' | 'holo' }) {
  selectedPokemonId.value = data.id
  selectedPokemonRarity.value = data.rarity
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

provide('modal-controls', { openModal })

// ---------------------------
// 🟢 NOTIFICAÇÕES COMPLETAS
// ---------------------------
const notifications = ref<
    { id: number; message: string; type: 'success' | 'error' }[]
>([])

let counter = 0

const successSound = new Audio('/sounds/success.mp3')
const errorSound = new Audio('/sounds/error.mp3')

function notify(message: string, type: 'success' | 'error' = 'success') {
  const id = counter++
  notifications.value.unshift({ id, message, type })

  if (type === 'success') successSound.play()
  else errorSound.play()

  setTimeout(() => {
    removeNotification(id)
  }, 5000)
}

function removeNotification(id: number) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

provide("notify", notify)

// ---------------------------
// 🌙 DARK / LIGHT MODE (sem botão)
// ---------------------------
const theme = ref<'light' | 'dark'>(
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
)
</script>

<template>
  <div class="app-container" :class="theme">
    <Sidebar />

    <main class="main-content">
      <router-view />
    </main>

    <PokemonDetailModal
        v-if="isModalOpen && selectedPokemonId"
        :id="selectedPokemonId"
        :rarity="selectedPokemonRarity"
        @close="closeModal"
    />

    <!-- 🔔 NOTIFICAÇÕES -->
    <div class="notification-container">
      <div
          v-for="n in notifications"
          :key="n.id"
          class="notification-card"
          :class="n.type"
      >
        <div class="icon">
          {{ n.type === 'success' ? '✔️' : '❌' }}
        </div>

        <p>{{ n.message }}</p>

        <button class="close-btn" @click="removeNotification(n.id)">
          ✖
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* LAYOUT */
.app-container {
  display: flex;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
  transition: 0.3s;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* THEMES */
:root {
  --bg-light: #f5f5f5;
  --text-light: #222;

  --bg-dark: #181818;
  --text-dark: #ddd;
}

.light {
  --bg: var(--bg-light);
  --text: var(--text-light);
}

.dark {
  --bg: var(--bg-dark);
  --text: var(--text-dark);
}

/* ------------------------------ */
/* NOTIFICAÇÕES BONITAS */
/* ------------------------------ */

.notification-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
}

.notification-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 260px;
  background: #ffffff; /* fundo branco opaco */
  color: #222222;       /* texto escuro */
  padding: 14px 18px;
  border-radius: 14px;
  border-left: 6px solid;
  box-shadow: 0 6px 14px rgba(0,0,0,0.2);
  animation: slide-up 0.35s ease-out;
  position: relative;
}
.notification-card.success {
  border-color: #4caf50;
}
.notification-card.error {
  border-color: #f44336;
}

.icon {
  font-size: 22px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-left: auto;
  color: var(--text);
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

/* ANIMAÇÃO */
@keyframes slide-up {
  from {
    transform: translateY(30px);
    opacity: 0;
    scale: 0.95;
  }
  to {
    transform: translateY(0);
    opacity: 1;
    scale: 1;
  }
}
</style>
