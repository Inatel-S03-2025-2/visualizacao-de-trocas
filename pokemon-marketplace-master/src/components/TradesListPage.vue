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
      // ✅ MUDANÇA: 'image' removido. 'name' mantido para o filtro.
      { id: 1, name: 'Charizard', pokeApiId: 6 },
      { id: 2, name: 'Alakazam', pokeApiId: 65 },
      { id: 3, name: 'Blastoise', pokeApiId: 9 }
    ]
  },
  {
    id: 2,
    username: 'Giovanni',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User2',
    cards: [
      // ✅ MUDANÇA: 'image' removido.
      { id: 1, name: 'Hitmonlee', pokeApiId: 106 },
      { id: 2, name: 'Machamp', pokeApiId: 68 },
      { id: 3, name: 'Magneton', pokeApiId: 82 }
    ]
  },
  {
    id: 3,
    username: 'Brock',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User3',
    cards: [
      // ✅ MUDANÇA: 'image' removido.
      { id: 1, name: 'Venusaur', pokeApiId: 3 },
      { id: 2, name: 'Zapdos', pokeApiId: 145 },
      { id: 3, name: 'Beedrill', pokeApiId: 15 }
    ]
  }
])

// Search
const searchQuery = ref('')

const handleSearch = (query: string) => {
  searchQuery.value = query.toLowerCase().trim()
}

// Sua lógica de filtro (sem mudanças, ainda precisa do 'name')
const filteredTrades = computed(() => {
  if (!searchQuery.value) return trades.value

  return trades.value.filter(trade => {
    if (trade.username.toLowerCase().includes(searchQuery.value)) return true
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