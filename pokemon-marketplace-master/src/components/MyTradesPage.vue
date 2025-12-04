<template>
  <div class="trades-page">
    <h1 class="page-title">{{ pageTitle }}</h1>

    <div class="tabs">
      <button
        :class="['tab', activeTab === 'pending' ? 'active' : '']"
        @click="activeTab = 'pending'"
      >
        Em andamento
      </button>

      <button
        :class="['tab', activeTab === 'done' ? 'active' : '']"
        @click="activeTab = 'done'"
      >
        Concluídas
      </button>
    </div>

    <div class="trades-content">
      <div class="trades-list">
        <div
          v-for="trade in activeTab === 'pending' ? pendingTrades : doneTrades"
          :key="trade.id"
          class="trade-item"
          :class="{ selected: selectedTrade?.id === trade.id }"
          @click="selectTrade(trade)"
        >
          <span>{{ trade.user }}</span>
          <span class="small-status">
            {{ trade.status === 'pending' ? 'Em andamento' : 'Concluída' }}
          </span>
        </div>
      </div>

      <div v-if="selectedTrade" class="trade-card">
        <div class="trade-header">
          <span class="username">{{ selectedTrade.user }}</span>
          <span class="status-badge">
            {{ selectedTrade.status === "pending" ? "Em andamento" : "Concluída" }}
          </span>
        </div>

        <div class="cards-row">
          <div class="column">
            <h3>Carta Enviada</h3>
            <div v-for="card in selectedTrade.sentCards" :key="card.id" class="simple-card-wrapper">
              <PokemonCard :id="getId(card)" />
            </div>
          </div>

        <div class="swap-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"/>
            <line x1="3" y1="5" x2="21" y2="5"/>
            <polyline points="7 15 3 19 7 23"/>
            <line x1="3" y1="19" x2="21" y2="19"/>
          </svg>
        </div>

        <div class="column">
          <h3>Carta Recebida</h3>
          <div v-for="card in selectedTrade.receivedCards" :key="card.id" class="simple-card-wrapper">
            <PokemonCard :id="getId(card)" />
          </div>
        </div>
      </div>

      <div class="actions">
        <button v-if="activeTab === 'pending'" class="cancel-btn" @click="confirmCancel = true">
          Cancelar troca
        </button>

        <button v-if="activeTab === 'done'" class="details-btn" @click="showDetails = true">
          Ver detalhes
        </button>
      </div>
    </div>

  </div>

    <transition name="fade-scale">
      <div v-if="confirmCancel" class="modal-overlay">
        <div class="modal">
          <h3>Você tem certeza?</h3>
          <p>Deseja realmente cancelar esta troca?</p>

          <div class="modal-actions">
            <button class="confirm-btn" @click="cancelTrade">Sim, cancelar</button>
            <button class="close-btn" @click="confirmCancel = false">Não</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade-scale">
      <div v-if="showDetails" class="modal-overlay">
        <div class="modal">
          <h3>Detalhes da troca</h3>

          <p>
            <strong>Usuário:</strong> {{ selectedTrade.user }} <br>
            <strong>Concluída em:</strong> {{ selectedTrade.completedAt }}
          </p>

          <div class="modal-actions">
            <button class="close-btn" @click="showDetails = false">Fechar</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import PokemonCard from "./PokemonCard.vue";

const activeTab = ref("pending");
const pageTitle = ref("Minhas trocas");

const confirmCancel = ref(false);
const showDetails = ref(false);

const currentSelected = ref<number | null>(null);

const selectTrade = (trade: TradeModel) => {
  currentSelected.value = trade.id;
};

interface CardModel {
  id: number;
  pokeId?: number;
  pokeApiId?: number;
}

interface TradeModel {
  id: number;
  user: string;
  sentCards: CardModel[];
  receivedCards: CardModel[];
  status: "pending" | "done";
  completedAt?: string;
}

const pendingTrades = ref<TradeModel[]>([
  { id: 1, user: "@DragonMaster", status: "pending", sentCards: [{ id: 1, pokeId: 25 }], receivedCards: [{ id: 3, pokeId: 150 }] },
  { id: 2, user: "@AshKetchum", status: "pending", sentCards: [{ id: 10, pokeId: 6 }], receivedCards: [{ id: 11, pokeId: 9 }] },
  { id: 3, user: "@Brock", status: "pending", sentCards: [{ id: 20, pokeId: 95 }], receivedCards: [{ id: 21, pokeId: 74 }] },
  { id: 4, user: "@Misty", status: "pending", sentCards: [{ id: 30, pokeId: 120 }], receivedCards: [{ id: 31, pokeId: 121 }] },
]);

const doneTrades = ref<TradeModel[]>([
  { id: 5, user: "@GaryOak", status: "done", completedAt: "2025-02-20 14:32", sentCards: [{ id: 40, pokeId: 133 }], receivedCards: [{ id: 41, pokeId: 134 }] },
  { id: 6, user: "@Red", status: "done", completedAt: "2025-02-18 19:10", sentCards: [{ id: 50, pokeId: 1 }], receivedCards: [{ id: 51, pokeId: 4 }] },
  { id: 7, user: "@Green", status: "done", completedAt: "2025-02-15 11:55", sentCards: [{ id: 60, pokeId: 39 }], receivedCards: [{ id: 61, pokeId: 94 }] },
  { id: 8, user: "@Blue", status: "done", completedAt: "2025-02-10 08:20", sentCards: [{ id: 70, pokeId: 143 }], receivedCards: [{ id: 71, pokeId: 131 }] },
]);

const selectedTrade = computed(() => {
  const list = activeTab.value === "pending" ? pendingTrades.value : doneTrades.value;
  return list.find(t => t.id === currentSelected.value) || list[0] || null;
});

watch(activeTab, () => {
  const list = activeTab.value === "pending" ? pendingTrades.value : doneTrades.value;
  currentSelected.value = list[0]?.id || null;
});

const cancelTrade = () => {
  const current = selectedTrade.value;
  if (!current) return;
  pendingTrades.value = pendingTrades.value.filter(t => t.id !== current.id);
  confirmCancel.value = false;
};

const getId = (card: CardModel) => card.pokeId || card.pokeApiId || card.id;
</script>


<style scoped>
.trades-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

.tabs {
  display: flex;
  gap: 24px;
}

.trades-list {
  width: 100%;
  max-width: 1000px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 6px;
}

.trade-item {
  background: #fff;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: 0.2s;
}

.trade-item:hover {
  transform: translateY(-2px);
}

.trade-item.selected {
  border: 2px solid #333;
}

.small-status {
  font-size: 12px;
  opacity: 0.7;
}


.trades-list {
  max-height: 450px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}


.modal-actions button {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.confirm-btn {
  background-color: #333;
  color: white;
}

.close-btn {
  background-color: #f5f4fc;
  color: #333;
}

.tab {
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  background-color: #e7e4f5;
  color: #333;
  transition: 0.2s;
}

.tab.active {
  background-color: #333;
  color: white;
}

.trade-card {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.username {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  gap: 8px;
}

.status-badge {
  background: #f0eefc;
  color: #333;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 14px;
}

.cards-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 32px;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.trades-content {
  width: 100%;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.trades-list {
  width: 280px; /* LISTA LATERAL */
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trade-card {
  flex: 1; /* OCUPA TODO O RESTANTE DO ESPAÇO */
  max-width: none;
}


.swap-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.details-btn,
.cancel-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.details-btn {
  background-color: #333;
  color: white;
}

.cancel-btn {
  background-color: #f5f4fc;
  color: #333;
}

.simple-card-wrapper {
  width: 180px;
  perspective: 1000px;
  display: block;
  cursor: pointer;
}

.simple-card-wrapper :deep(.pokemon-card) {
  width: 100% !important;
  height: auto !important;
  transition: transform 0.2s ease-out;
}

.simple-card-wrapper:hover :deep(.pokemon-card) {
  transform: translateY(-5px) scale(1.1);
  z-index: 10;
}
</style>
