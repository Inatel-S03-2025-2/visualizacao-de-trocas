<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import TradeCard from '../components/TradeCard.vue'
import PokemonCard from '../components/PokemonCard.vue'
import { tradesData } from '../data/tradesData'

// IMPORTANTE: Importe o seu mapa de nomes aqui
// Ajuste o caminho '../data/pokemonNameMap' conforme onde você salvou o arquivo
import { pokemonNameMap } from '../data/pokemonNameMap'

// ... (Estados mantidos iguais) ...
const searchQuery = ref('')
const currentSortKey = ref('date')
const currentSortDirection = ref('desc')
const currentPage = ref(1)
const itemsPerPage = 3
const tradesListTitle = ref(null)

// ... (Estados da troca mantidos iguais) ...
const expandedTradeId = ref<number | null>(null)
const displayCardId = ref<number | null>(null)
const showPopup = ref(false)
const selectedUserCardApiId = ref<number | null>(null)

const activeTrade = computed(() => tradesData.find(t => t.id === expandedTradeId.value))
const myCards = ref([
  { id: 1, pokeApiId: 6 }, { id: 2, pokeApiId: 150 }, { id: 3, pokeApiId: 25 },
  { id: 4, pokeApiId: 9 }, { id: 5, pokeApiId: 131 }, { id: 6, pokeApiId: 55 }
])

// --- LÓGICA DE DADOS ATUALIZADA ---
const sortedAndFilteredTrades = computed(() => {
  let list = tradesData.filter(trade => {
    // Se não tem busca, retorna tudo
    if (!searchQuery.value) return true

    const query = searchQuery.value.toLowerCase()

    // 1. Verifica se o nome do Jogador bate (Ex: "Giovanni")
    if (trade.player.toLowerCase().includes(query)) return true

    // 2. Verifica se algum Pokémon da oferta bate com o NOME (Ex: "Charizard")
    // Usamos o .some() para ver se pelo menos uma carta da oferta corresponde
    return trade.offers.some(card => {
      const id = card.pokeId || card.pokeApiId

      // Pega o nome no mapa usando o ID
      const pokemonName = pokemonNameMap[id]

      // Se o nome existir no mapa, verifica se inclui o texto da busca
      if (pokemonName && pokemonName.toLowerCase().includes(query)) {
        return true
      }

      // (Opcional) Se quiser manter a busca por ID numérico também:
      return String(id).includes(query)
    })
  })

  // ... (Lógica de Sort mantida igual) ...
  list = list.sort((a, b) => {
    const modifier = currentSortDirection.value === 'asc' ? 1 : -1
    if (currentSortKey.value === 'date') return (new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier
    if (currentSortKey.value === 'player') return a.player.localeCompare(b.player) * modifier
    return 0
  })
  return list
})

// ... (Resto do código mantido igual: pagination, actions, functions, watch) ...
const totalPages = computed(() => Math.ceil(sortedAndFilteredTrades.value.length / itemsPerPage))
const paginatedTrades = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedAndFilteredTrades.value.slice(start, start + itemsPerPage)
})

const scrollToTop = () => nextTick(() => { if (tradesListTitle.value) tradesListTitle.value.scrollIntoView({ behavior: 'smooth', block: 'start' }) })
const nextPage = () => { if (currentPage.value < totalPages.value) { currentPage.value++; scrollToTop() } }
const prevPage = () => { if (currentPage.value > 1) { currentPage.value--; scrollToTop() } }
const sortItems = (key: string) => {
  if (currentSortKey.value === key) currentSortDirection.value = currentSortDirection.value === 'asc' ? 'desc' : 'asc'
  else { currentSortKey.value = key; currentSortDirection.value = key === 'date' ? 'desc' : 'asc' }
}

function handleCardClick(tradeId: number, cardId?: number) {
  const trade = tradesData.find(t => t.id === tradeId)
  if (!trade) return
  const targetCardId = cardId || (trade.offers[0].pokeId || trade.offers[0].pokeApiId)

  if (expandedTradeId.value === tradeId) {
    if (displayCardId.value !== targetCardId) {
      displayCardId.value = targetCardId
    } else {
      expandedTradeId.value = null
      displayCardId.value = null
      selectedUserCardApiId.value = null
    }
  } else {
    expandedTradeId.value = tradeId
    displayCardId.value = targetCardId
  }
}

function openPopup() { showPopup.value = true }
function closePopup() { showPopup.value = false }
function selectUserCard(cardId: number) { selectedUserCardApiId.value = cardId; showPopup.value = false }
function handleAddProposal() { alert("Proposta enviada!"); expandedTradeId.value = null; selectedUserCardApiId.value = null; displayCardId.value = null }
watch(searchQuery, () => currentPage.value = 1)
</script>

<template>
  <div class="trade-list-page">
    <header class="marketplace-header">
      <router-link to="/" class="icon-button back-button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg></router-link>
      <h1 class="page-title">Marketplace Trocas</h1>
      <div class="header-actions">
        <div class="search-container"><input type="text" v-model="searchQuery" placeholder="Busca..." class="search-input"/><svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
        <div class="filter-group">
          <button @click="sortItems('date')" class="icon-button sort-button" :class="{ active: currentSortKey === 'date' }">🕐 Recentes <span v-if="currentSortKey === 'date'" class="sort-indicator">{{ currentSortDirection === 'asc' ? '↑' : '↓' }}</span></button>
          <button @click="sortItems('player')" class="icon-button sort-button" :class="{ active: currentSortKey === 'player' }">A-Z <span v-if="currentSortKey === 'player'" class="sort-indicator">{{ currentSortDirection === 'asc' ? '↑' : '↓' }}</span></button>
        </div>
      </div>
    </header>

    <div class="trades-list">
      <h2 ref="tradesListTitle" class="section-subtitle">Resultados <span class="count-badge">{{ sortedAndFilteredTrades.length }}</span></h2>
      <div v-if="paginatedTrades.length === 0" class="empty-message"><p>Nenhuma troca encontrada.</p></div>

      <div v-for="trade in paginatedTrades" :key="trade.id" class="trade-item-container">
        <TradeCard
            :username="trade.player"
            :cards="trade.offers"
            :date="trade.date"
            :offerCount="trade.offerCount"  :isActive="expandedTradeId === trade.id"
            @cardClicked="(cardId) => handleCardClick(trade.id, cardId)"
            @click="handleCardClick(trade.id)"
        />

        <transition name="expand-fade">
          <div v-if="expandedTradeId === trade.id" class="expanded-area">
            <div class="trade-expanded-content">
              <div class="responsive-wrapper medium">
                <PokemonCard v-if="displayCardId" :id="displayCardId" />
              </div>

              <div class="trade-center-actions">
                <div class="center-interactive-area" :class="{ 'has-offer': selectedUserCardApiId }">
                  <div class="trade-icon"><img src="https://cdn0.iconfinder.com/data/icons/image-3/24/switch-flip-512.png" alt="Trade" /></div>
                  <transition name="fade-scale">
                    <button v-if="selectedUserCardApiId" class="confirm-button" @click.stop="handleAddProposal">
                      <span>Enviar</span>
                      <span>Proposta</span>
                    </button>
                  </transition>
                </div>
              </div>

              <div class="expanded-actions">
                <button class="trade-slot-button responsive-wrapper medium" @click.stop="openPopup">
                  <template v-if="!selectedUserCardApiId"><div class="plus-icon">+</div><span>Ofertar</span></template>
                  <PokemonCard v-else :id="selectedUserCardApiId" />
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="sortedAndFilteredTrades.length > itemsPerPage" class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1" class="pagination-button">Anterior</button>
      <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-button">Próxima</button>
    </div>

    <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
      <div class="popup-container">
        <button class="close-button" @click="closePopup">✕</button>
        <h3>Faça uma oferta</h3>
        <div v-if="activeTrade && activeTrade.wants && activeTrade.wants.length > 0">
          <h4 class="popup-subtitle">{{ activeTrade.player }} está procurando:</h4>
          <div class="popup-cards row">
            <div v-for="want in activeTrade.wants" :key="want.id" class="responsive-wrapper wanted"><PokemonCard :id="want.pokeId || want.pokeApiId" /></div>
          </div>
          <div class="popup-divider"></div>
        </div>
        <h4 class="popup-subtitle">Sua coleção:</h4>
        <div class="popup-cards grid">
          <div v-for="card in myCards" :key="card.id" class="responsive-wrapper small selectable">
            <PokemonCard :id="card.pokeApiId" @click="() => selectUserCard(card.pokeApiId)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS GERAL */
.trade-list-page { max-width: 100%; margin: 0; padding: 5px 40px; font-family: sans-serif; }
.marketplace-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
  border-bottom: 2px solid #eee; padding-bottom: 10px; gap: 20px; }
.page-title { font-size: 1.8em; margin: 0; white-space: nowrap; }
.header-actions { display: flex; gap: 15px; flex-grow: 1; justify-content: center; align-items: center; }
.search-container { position: relative; display: flex; align-items: center; width: 100%; max-width: 500px; }
.search-input { padding: 12px 15px 12px 45px; border: 1px solid #ddd; border-radius: 50px; width: 100%; background-color: #f9f9f9; }
.search-icon { position: absolute; left: 15px; color: #aaa; pointer-events: none; }
.filter-group { display: flex; gap: 10px; }
.icon-button { background: white; border: 1px solid #ccc; padding: 8px 12px; border-radius: 6px; cursor: pointer; height: 44px; display: flex; align-items: center; white-space: nowrap;}
.icon-button:hover { background-color: #f5f5f5; }
.icon-button.active { background-color: #e3f2fd; border-color: #2196f3; color: #1976d2; }
.sort-indicator { margin-left: 5px; font-size: 0.8em; }
.section-subtitle { margin: 0px 0 5px; color: #333; font-size: 1.4em; display: flex; align-items: center; gap: 10px; }
.count-badge { background: #2196f3; color: white; font-size: 0.6em; padding: 2px 8px; border-radius: 12px; }
.trades-list { display: flex; flex-direction: column; gap: 20px; }
.trade-item-container { display: flex; flex-direction: column; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.05)); }
.expanded-area { width: 100%; background-color: #f8f9fa; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 16px 16px; margin-top: -1px; padding: 30px; box-sizing: border-box; z-index: 1; }
.trade-expanded-content { display: flex; align-items: center; justify-content: center; gap: 50px; width: 100%; }
.trade-center-actions { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 180px; }
.center-interactive-area { display: flex; flex-direction: column; align-items: center; gap: 15px; cursor: default; transition: all 0.3s ease; }
.trade-icon img { width: 45px; opacity: 0.5; transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s; }
.center-interactive-area:hover .trade-icon img { transform: rotate(180deg) scale(1.1); opacity: 1; }

/* BOTÃO CONFIRMAR */
.confirm-button {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white; border: none; padding: 10px 30px; border-radius: 50px; font-weight: 700; text-transform: uppercase; font-size: 0.85rem; cursor: pointer;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); transition: all 0.2s; white-space: nowrap;
  display: flex; flex-direction: column; align-items: center; line-height: 1.2;
}
.confirm-button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4); }
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.8) translateY(10px); }

/* SLOT E CARDS */
.trade-slot-button { border: 2px dashed #ced4da; background: #fff; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #adb5bd; padding: 0; border-radius: 10px; transition: all 0.2s; }
.trade-slot-button:hover { border-color: #2196f3; color: #2196f3; background: #e3f2fd; }
.plus-icon { font-size: 3em; margin-bottom: 10px; }

/* MUDANÇA 3: AUMENTO DO TAMANHO DAS CARTAS EXPANDIDAS */
.responsive-wrapper.medium {
  width: 240px; /* Aumentado de 180px */
  height: 330px; /* Aumentado proporcionalmente */
  display: block;
}
.responsive-wrapper :deep(.pokemon-card) { width: 100% !important; height: auto !important; }

/* POPUP */
.popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
.popup-container { background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative; }
.close-button { position: absolute; top: 15px; right: 15px; border: none; background: none; font-size: 1.5em; cursor: pointer; }
.popup-subtitle { margin: 15px 0 10px; color: #555; font-weight: 600; }
.popup-divider { height: 1px; background: #eee; margin: 20px 0; }
.popup-cards.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
.popup-cards.row { display: flex; gap: 15px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 10px; }
.responsive-wrapper.wanted { width: 120px; min-width: 120px; height: auto; opacity: 0.9; pointer-events: none; }
.responsive-wrapper.wanted :deep(.pokemon-card) { border: 2px dashed #ff9800; }
.responsive-wrapper.small { width: 100%; }

/* MUDANÇA 1: EFEITO DE HOVER NAS CARTAS DO POPUP */
.responsive-wrapper.selectable {
  cursor: pointer;
  transition: transform 0.2s ease-out;
}
.responsive-wrapper.selectable:hover {
  transform: translateY(-8px) scale(1.05);
  z-index: 10;
}
.responsive-wrapper.selectable:hover :deep(.pokemon-card) {
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.pagination-controls { display: flex; justify-content: center; gap: 20px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
.pagination-button { padding: 8px 16px; background: #333; color: white; border-radius: 4px; cursor: pointer; border: none; }
.pagination-button:disabled { background: #ccc; cursor: not-allowed; }
.expand-fade-enter-active, .expand-fade-leave-active { transition: all 0.3s ease; max-height: 600px; opacity: 1; overflow: hidden; }
.expand-fade-enter-from, .expand-fade-leave-to { max-height: 0; opacity: 0; }
</style>