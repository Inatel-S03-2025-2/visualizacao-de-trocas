<script setup lang="ts">
import { ref, computed } from 'vue'
import SearchBar from './Searchbar.vue'
import TradeCard from './TradeCard.vue'

// Trades de exemplo
const trades = ref([
  {
    id: 1,
    username: 'Ash',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
    cards: [
      // ✅ CORREÇÃO: Adicionei os nomes
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
      // ✅ CORREÇÃO: Adicionei os nomes
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
      // ✅ CORREÇÃO: Adicionei os nomes
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

// Computed filtrado - AGORA VAI FUNCIONAR
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
  <div>
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
</template>

<style scoped>
.trades-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}
</style>