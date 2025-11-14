<script setup lang="ts">
import { ref, computed } from 'vue'
import SearchBar from './Searchbar.vue'
import TradeCard from './TradeCard.vue'
import PokemonCard from './PokemonCard.vue'

// --- INTERFACES (Sem mudanças) ---
interface MockCard {
  id: number
  name: string
  pokeApiId: number
}
interface Trade {
  id: number
  username: string
  avatar: string
  cards: MockCard[]
}

// --- DADOS MOCADOS (Sem mudanças) ---
// (Mantemos o 'name' aqui para a SearchBar funcionar)
const allTrades = ref<Trade[]>([
  {
    id: 1,
    username: 'Ash',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
    cards: [
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
      { id: 1, name: 'Hitmonlee', pokeApiId: 106 },
      { id: 2, name: 'Machamp', pokeApiId: 68 },
      { id: 3, name: 'Magneton', pokeApiId: 82 }
    ]
  }
])

// --- LÓGICA DE FILTRO (Sem mudanças) ---
const searchQuery = ref('')
function handleSearch(query: string) {
  searchQuery.value = query.toLowerCase().trim()
}
const filteredTrades = computed(() => {
  if (!searchQuery.value) return allTrades.value
  return allTrades.value.filter(trade => {
    if (trade.username.toLowerCase().includes(searchQuery.value)) return true
    return trade.cards.some(card =>
        card.name.toLowerCase().includes(searchQuery.value) ||
        card.pokeApiId.toString() === searchQuery.value
    )
  })
})

// --- LÓGICA DE ESTADO ---
const expandedTradeId = ref<number | null>(null)
const selectedCardApiId = ref<number | null>(null)
const showPopup = ref(false)
// ✅ MUDANÇA: Agora guardamos o ApiId do card selecionado no popup
const selectedUserCardApiId = ref<number | null>(null)

// Dados do Popup
const wishlist = ref([
  { id: 1, name: 'Hitmonchan', pokeApiId: 107 },
  { id: 2, name: 'Nidorino', pokeApiId: 33 },
])
const myCards = ref([
  { id: 1, name: 'Fearow', pokeApiId: 22 },
  { id: 2, name: 'Pidgey', pokeApiId: 16 },
])

// 🛑 MUDANÇA: Removido 'myCardsStaticImages' e 'selectedMiniImageUrl'

// --- FUNÇÕES DE CONTROLE ---
function handleCardClick(tradeId: number, cardApiId: number) {
  if (expandedTradeId.value === tradeId && selectedCardApiId.value === cardApiId) {
    expandedTradeId.value = null
    selectedCardApiId.value = null
  } else {
    expandedTradeId.value = tradeId
    selectedCardApiId.value = cardApiId
  }
}

function openPopup() { showPopup.value = true }
function closePopup() {
  showPopup.value = false
  selectedUserCardApiId.value = null // ✅ Limpa o ID da API
}

// ✅ MUDANÇA: 'selectUserCard' agora recebe e guarda o pokeApiId
function selectUserCard(cardApiId: number) {
  selectedUserCardApiId.value = cardApiId
  showPopup.value = false
}

function handleAddProposal() {
  if (!expandedTradeId.value || !selectedCardApiId.value || !selectedUserCardApiId.value) return

  console.log('ENVIANDO PROPOSTA:', {
    offeredCardApiId: selectedUserCardApiId.value,
    targetCardApiId: selectedCardApiId.value
  })
  closePopup();
}

</script>

<template>
  <div class="trade-list-page">
    <SearchBar @search="handleSearch" />

    <div class="trades-list">

      <div v-for="trade in filteredTrades" :key="trade.id" class="trade-item-container">

        <TradeCard
            :username="trade.username"
            :avatar="trade.avatar"
            :cards="trade.cards"
            :isActive="expandedTradeId === trade.id"
            @cardClicked="(cardApiId) => handleCardClick(trade.id, cardApiId)"
        />

        <transition name="expand-fade">
          <div v-if="expandedTradeId === trade.id" class="expanded-area">
            <div class="trade-expanded-content">

              <div class="selected-card-wrapper">
                <PokemonCard v-if="selectedCardApiId" :id="selectedCardApiId" />
              </div>

              <div class="trade-icon">
                <img src="https://cdn0.iconfinder.com/data/icons/image-3/24/switch-flip-512.png" />
              </div>

              <div class="expanded-actions">
                <button class="trade-button" @click="openPopup">
                  <template v-if="!selectedUserCardApiId">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </template>
                  <PokemonCard v-else :id="selectedUserCardApiId" />
                </button>

                <button v-if="selectedUserCardApiId" class="confirm-button" @click="handleAddProposal">
                  ✅ Enviar proposta
                </button>
              </div>
            </div>
          </div>
        </transition>

      </div>
    </div>

    <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
      <div class="popup-container">
        <button class="close-button" @click="closePopup">✕</button>
        <h3>Proposta de Troca</h3>

        <h4>Cartas desejadas (Exemplo)</h4>
        <div class="popup-cards">
          <div v-for="card in wishlist" :key="card.id" class="popup-card-wrapper">
            <PokemonCard :id="card.pokeApiId" />
          </div>
        </div>

        <div class="popup-divider"></div>

        <h4>Suas cartas disponíveis</h4>
        <div class="popup-cards">
          <div v-for="card in myCards" :key="card.id" class="popup-card-wrapper selectable">
            <PokemonCard :id="card.pokeApiId" @click="() => selectUserCard(card.pokeApiId)" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Estilos da Página, Área Expandida e Popup */
.trade-list-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.trades-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

/* --- ESTILOS DA ÁREA EXPANDIDA --- */
.expanded-area {
  width: 100%;
  background-color: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 12px 12px;
  margin-top: -26px;
  padding: 20px;
  padding-top: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
.trade-expanded-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 2rem;
  width: 100%;
}

.selected-card-wrapper {
  width: 100%;
  max-width: 250px;
  flex-shrink: 0;
  perspective: 1000px;
}
.selected-card-wrapper :deep(.pokemon-card) {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  transform-style: preserve-3d;
}
.selected-card-wrapper:hover :deep(.pokemon-card) {
  transform: translateY(-0.5rem) scale(1.03);
  box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.25);
  z-index: 10;
}

.trade-icon img { width: 70px; opacity: 0.85; }
.expanded-actions { display: flex; align-items: center; gap: 50px; }

/* ✅ MUDANÇA: CSS do botão ajustado para o <PokemonCard> */
.trade-button {
  width: 250px; /* Largura fixa */
  height: 340px;  /* Altura baseada no aspect-ratio do card */
  border: 2px solid #333;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* Remove padding para o card caber */
  overflow: hidden; /* Garante que o card não vaze */
}
/* Estilo para o estado VAZIO (o '+') */
.trade-button:hover { background: #333; color: #fff; }
.trade-button svg {
  width: 48px;
  height: 48px;
  /* Define uma altura mínima para o botão vazio */
  min-height: 280px;
}

/* 🛑 MUDANÇA: Removido o estilo .selected-mini */
/* .selected-mini { ... } */

.confirm-button {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; width: 160px; height: 60px;
  background-color: #333; color: #fff; font-weight: 600;
  border: none; border-radius: 10px; cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.confirm-button:hover { background-color: #000; transform: scale(1.05); }

/* --- ESTILOS DO POPUP --- */
.popup-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center; z-index: 500;
}
.popup-container {
  background: #fff; border-radius: 12px; padding: 32px;
  width: 80%; max-width: 700px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  position: relative;
}
.close-button {
  position: absolute; top: 16px; right: 16px;
  border: none; background: none; cursor: pointer; font-size: 1.2rem;
}
.popup-cards {
  display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px;
}
.popup-card-wrapper {
  width: 100px;
  border-radius: 8px;
  overflow: hidden;
  perspective: 1000px;
}
.popup-card-wrapper :deep(.pokemon-card) {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  transform-style: preserve-3d;
}
.popup-card-wrapper.selectable:hover :deep(.pokemon-card) {
  transform: translateY(-0.3rem) scale(1.05);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
  z-index: 10;
}
.popup-divider {
  width: 100%; height: 2px; background-color: #eee; margin: 20px 0;
}

/* --- ANIMAÇÃO DE EXPANSÃO --- */
.expand-fade-enter-active,
.expand-fade-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
  padding-top: 36px;
  padding-bottom: 20px;
}
.expand-fade-enter-from,
.expand-fade-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: -26px;
}
</style>