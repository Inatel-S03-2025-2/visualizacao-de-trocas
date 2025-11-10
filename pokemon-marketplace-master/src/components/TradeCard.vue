<script setup lang="ts">
import { ref } from 'vue'

interface Card {
  id: number
  image: string
}

interface Props {
  username: string
  avatar: string
  cards: Card[]
}

const props = defineProps<Props>()
const emit = defineEmits(['add-proposal'])
const isExpanded = ref(false)
const hoveredCardId = ref<number | null>(null)

function toggleExpand(id: number) {
  console.log('Clique detectado no card', id)
  isExpanded.value = !isExpanded.value
  console.log('isExpanded agora é', isExpanded.value)
}

function toggleOverlay(cardId: number) {
  hoveredCardId.value = hoveredCardId.value === cardId ? null : cardId
}

function handleAddProposal(cardId: number) {
  emit('add-proposal', { username: props.username, cardId })
}
</script>

<template>
  <div class="trade-card" :class="{ expanded: isExpanded }">
    <!-- Topo: avatar + username + cartas lado a lado -->
    <div class="trade-top">
      <div class="trade-header">
        <img :src="avatar" :alt="username" class="user-avatar" />
        <div class="user-info">
          <span class="username">{{ username }}</span>
          <div class="separator"></div>
        </div>
      </div>

      <!-- Cartas lado a lado -->
      <div class="cards-container">
        <div
            v-for="card in cards"
            :key="card.id"
            class="card-slot"
            @mouseenter="hoveredCardId = card.id"
            @mouseleave="hoveredCardId = null"
            @click="toggleExpand(card.id)"
            @keydown.enter.prevent="handleAddProposal(card.id)"
            @keydown.space.prevent="handleAddProposal(card.id)"
            tabindex="0"
        >
          <img :src="card.image" :alt="'Card ' + card.id" class="pokemon-card" />

          <!-- Overlay visual (não intercepta clique) -->
          <div v-if="hoveredCardId === card.id" class="overlay">
            <div class="overlay-content">
              <span class="overlay-text">Criar</span>
              <span class="overlay-text">Proposta</span>
              <div class="plus-circle">+</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Área expandida -->
    <transition name="expand-fade">
      <div class="expanded-area" v-if="isExpanded">
        <p>Aqui vai o conteúdo extra do card selecionado.</p>

        <!-- Botão dentro da área expandida -->
        <div class="expanded-actions">
          <button class="trade-button" @click="handleAddProposal(hoveredCardId || 0)">
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>



<style scoped>
.trade-card {
  overflow: hidden;
  max-height: 200%;
  transition: max-height 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 24px;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  transition: max-height 0.4s ease, box-shadow 0.3s;
}

.trade-card:hover {
  border-color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.trade-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.trade-header {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.username {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.separator {
  height: 2px;
  background-color: #e0e0e0;
  width: 100%;
}

.cards-container {
  display: flex;
  gap: 16px;
  flex: 1;
}

.card-slot {
  position: relative;
  width: 80px;
  height: 112px;
  background-color: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}

.card-slot:hover {
  transform: translateY(-6px);
}

.pokemon-card {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  pointer-events: none;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.85rem;
  justify-content: center;
  font-weight: 600;
  color: #fff;
  gap: 6px;
}

.plus-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.trade-button {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.trade-button:hover {
  background-color: #333;
  color: #fff;
  transform: scale(1.05);
}

.trade-card.expanded {
  max-height: 800px; /* ~200% do original, ajuste conforme necessário */
  transition: max-height 0.4s ease;
}

.expanded-area {
  width: 100%;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
  padding: 24px 16px;
  min-height: 150px;
  animation: fadeIn 0.4s ease forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .trade-card {
    flex-direction: column;
    align-items: stretch;
  }

  .trade-header {
    min-width: unset;
  }

  .cards-container {
    justify-content: center;
  }

  .trade-button {
    width: 100%;
  }
}
</style>
