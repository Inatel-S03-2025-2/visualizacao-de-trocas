<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import Sidebar from './components/Sidebar.vue'
import SearchBar from './components/Searchbar.vue'
import TradeCard from './components/TradeCard.vue'

// Rota atual
const route = useRoute()
const isMainTradesRoute = computed(() => route.path !== '/wishlist')

// Trades de exemplo
const trades = ref([
  {
    id: 1,
    username: 'Ash',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
    cards: [
      { id: 1, name: 'Charizard', image: 'https://images.pokemontcg.io/base1/4_hires.png' },
      { id: 2, name: 'Alakazam', image: 'https://images.pokemontcg.io/base1/1_hires.png' },
      { id: 3, name: 'Blastoise', image: 'https://images.pokemontcg.io/base1/2_hires.png' }
    ]
  },
  {
    id: 2,
    username: 'Giovanni',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User2',
    cards: [
      { id: 1, name: 'Hitmonlee', image: 'https://images.pokemontcg.io/base1/7_hires.png' },
      { id: 2, name: 'Machamp', image: 'https://images.pokemontcg.io/base1/8_hires.png' },
      { id: 3, name: 'Magneton', image: 'https://images.pokemontcg.io/base1/9_hires.png' }
    ]
  },
  {
    id: 3,
    username: 'Brock',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User3',
    cards: [
      { id: 1, name: 'Venusaur', image: 'https://images.pokemontcg.io/base1/15_hires.png' },
      { id: 2, name: 'Zapdos', image: 'https://images.pokemontcg.io/base1/16_hires.png' },
      { id: 3, name: 'Beedrill', image: 'https://images.pokemontcg.io/base1/17_hires.png' }
    ]
  }
])

// Search
const searchQuery = ref('')

const handleSearch = (query: string) => {
  searchQuery.value = query.toLowerCase().trim()
}

// Computed filtrado
const filteredTrades = computed(() => {
  if (!searchQuery.value) return trades.value

  return trades.value.filter(trade => {
    // Verifica username
    if (trade.username.toLowerCase().includes(searchQuery.value)) return true

    // Verifica cada carta
    return trade.cards.some(card => card.name.toLowerCase().includes(searchQuery.value))
  })
})
</script>

<template>
  <div class="app-container">
    <Sidebar />

    <main class="main-content">

      <div v-if="isMainTradesRoute">
        <SearchBar @search="handleSearch" />

        <div class="trades-list">
          <TradeCard
              v-for="trade in filteredTrades"
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
/* Mantive seu layout exatamente igual */
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
