<script setup lang="ts">
import { ref, computed } from 'vue' // Adicionado 'computed'
import { useRoute } from 'vue-router' // Adicionado useRoute para verificar a rota

import Sidebar from './components/Sidebar.vue'
import SearchBar from './components/Searchbar.vue'
import TradeCard from './components/TradeCard.vue'

// Lógica para verificar a rota
const route = useRoute()
// Verifica se a rota atual NÃO é a rota da wishlist.
// Assumindo que a rota da wishlist é '/wishlist'.
const isMainTradesRoute = computed(() => route.path !== '/wishlist')

const trades = ref([
  {
    id: 1,
    username: 'Usuario1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
    cards: [
      { id: 1, image: 'https://images.pokemontcg.io/base1/4_hires.png' },
      { id: 2, image: 'https://images.pokemontcg.io/base1/1_hires.png' },
      { id: 3, image: 'https://images.pokemontcg.io/base1/2_hires.png' }
    ]
  },
  {
    id: 2,
    username: 'Usuario2',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User2',
    cards: [
      { id: 1, image: 'https://images.pokemontcg.io/base1/7_hires.png' },
      { id: 2, image: 'https://images.pokemontcg.io/base1/8_hires.png' },
      { id: 3, image: 'https://images.pokemontcg.io/base1/9_hires.png' }
    ]
  },
  {
    id: 3,
    username: 'Usuario3',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User3',
    cards: [
      { id: 1, image: 'https://images.pokemontcg.io/base1/15_hires.png' },
      { id: 2, image: 'https://images.pokemontcg.io/base1/16_hires.png' },
      { id: 3, image: 'https://images.pokemontcg.io/base1/17_hires.png' }
    ]
  }
])

const searchQuery = ref('')

const handleSearch = (query: string) => {
  searchQuery.value = query
}
</script>

<template>
  <div class="app-container">
    <Sidebar />

    <main class="main-content">

      <div v-if="isMainTradesRoute">
        <SearchBar @search="handleSearch" />

        <div class="trades-list">
          <TradeCard
              v-for="trade in trades"
              :key="trade.id"
              :username="trade.username"
              :avatar="trade.avatar"
              :cards="trade.cards"
          />
        </div>
      </div>

      <router-view v-else />

    </main>

    <aside class="right-sidebar">
      <div class="notification-card">
        <div class="notification-icon">!</div>
        <div class="notification-content">
          <div class="notification-line"></div>
          <div class="notification-line short"></div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* O seu bloco de estilos permanece exatamente igual */
.app-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.trades-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.right-sidebar {
  width: 280px;
  padding: 24px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
}

.notification-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #333;
  border-radius: 50%;
  font-size: 24px;
  font-weight: bold;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-line {
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.notification-line.short {
  width: 60%;
}

@media (max-width: 1024px) {
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .main-content {
    padding: 16px;
  }
}
</style>