<template>
  <div class="trades-page">
    <h1 class="page-title">{{ pageTitle }}</h1>

    <!-- TABS -->
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

    <!-- TRADE CARD LIST -->
    <div class="trade-card">
      <div class="trade-header">
        <span class="username">@DragonMaster</span>
        <span class="status-badge">Em andamento</span>
      </div>

      <div class="cards-row">
        <div class="column">
          <h3>Carta Enviada</h3>
          <PokemonCard />
        </div>

        <!-- ICON BETWEEN CARDS -->
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
          <PokemonCard />
        </div>
      </div>

      <div class="actions">
        <button class="details-btn">Ver detalhes</button>
        <button class="cancel-btn">Cancelar troca</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PokemonCard from "./PokemonCard.vue";

const activeTab = ref("pending");
const pageTitle = ref("Minhas trocas");
</script>

<style scoped>
.trades-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

/* Title */
.title {
  font-size: 32px;
  font-weight: 700;
  color: #333; 
}

/* Tabs */
.tabs {
  display: flex;
  gap: 24px;
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

/* Trade card */
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

/* Header */
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

/* Cards row */
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

.swap-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
}

/* Action Buttons */
.actions {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.details-btn, .cancel-btn {
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
</style>
