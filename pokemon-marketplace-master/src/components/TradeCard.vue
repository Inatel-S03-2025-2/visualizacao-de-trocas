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
const selectedCardId = ref<number | null>(null)
const showPopup = ref(false)
const selectedUserCard = ref<number | null>(null)

// Simulação de wishlist e cartas do usuário
const wishlist = ref([
  { id: 1, image: 'https://images.pokemontcg.io/base1/10_hires.png' },
  { id: 2, image: 'https://images.pokemontcg.io/base1/12_hires.png' },
  { id: 3, image: 'https://images.pokemontcg.io/base1/14_hires.png' }
])

const myCards = ref([
  { id: 1, image: 'https://images.pokemontcg.io/base1/20_hires.png' },
  { id: 2, image: 'https://images.pokemontcg.io/base1/21_hires.png' },
  { id: 3, image: 'https://images.pokemontcg.io/base1/22_hires.png' },
  { id: 4, image: 'https://images.pokemontcg.io/base1/23_hires.png' }
])

function toggleExpand(cardId: number) {
  if (selectedCardId.value === cardId) {
    isExpanded.value = false
    selectedCardId.value = null
  } else {
    selectedCardId.value = cardId
    isExpanded.value = true
  }
}

function openPopup() {
  showPopup.value = true
}

function closePopup() {
  showPopup.value = false
  selectedUserCard.value = null
}

function selectUserCard(cardId: number) {
  selectedUserCard.value = cardId
  showPopup.value = false
}

function handleAddProposal() {
  if (selectedCardId.value && selectedUserCard.value) {
    emit('add-proposal', {
      username: props.username,
      offeredCard: selectedUserCard.value,
      targetCard: selectedCardId.value
    })
    selectedUserCard.value = null
  }
}
</script>

<template>
  <div class="trade-card" :class="{ expanded: isExpanded }">
    <!-- CABEÇALHO -->
    <div class="trade-header">
      <div class="user-info-block">
        <img :src="avatar" :alt="username" class="user-avatar" />
        <div class="user-info">
          <span class="username">{{ username }}</span>
          <div class="separator"></div>
        </div>
      </div>

      <!-- CARTAS LADO A LADO (agora à direita) -->
      <div class="cards-container">
        <div
            v-for="card in cards"
            :key="card.id"
            class="card-slot"
            @mouseenter="hoveredCardId = card.id"
            @mouseleave="hoveredCardId = null"
            @click="toggleExpand(card.id)"
            :class="{ active: selectedCardId === card.id }"
        >
          <img :src="card.image" class="pokemon-card" />
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


    <!-- ÁREA EXPANDIDA -->
    <transition name="expand-fade">
      <div v-if="isExpanded" class="expanded-area">
        <div class="trade-expanded-content">
          <!-- Carta selecionada -->
          <div class="selected-card">
            <img
                v-if="selectedCardId"
                :src="cards.find(c => c.id === selectedCardId)?.image"
                class="pokemon-card selected"
            />
          </div>

          <!-- Ícone de troca -->
          <div class="trade-icon">
            <img src="https://cdn0.iconfinder.com/data/icons/image-3/24/switch-flip-512.png" />
          </div>

          <!-- Botão de proposta -->
          <div class="expanded-actions">
            <button class="trade-button" @click="openPopup">
              <template v-if="!selectedUserCard">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </template>
              <img
                  v-else
                  :src="myCards.find(c => c.id === selectedUserCard)?.image"
                  class="selected-mini"
              />
            </button>

            <button
                v-if="selectedUserCard"
                class="confirm-button"
                @click="handleAddProposal"
            >
              ✅ Enviar proposta
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- POPUP -->
    <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
      <div class="popup-container">
        <button class="close-button" @click="closePopup">✕</button>
        <h3>Proposta de Troca</h3>

        <h4>Cartas desejadas por {{ username }}</h4>
        <div class="popup-cards">
          <div v-for="card in wishlist" :key="card.id" class="popup-card">
            <img :src="card.image" />
          </div>
        </div>

        <div class="popup-divider"></div>

        <h4>Suas cartas disponíveis</h4>
        <div class="popup-cards">
          <div
              v-for="card in myCards"
              :key="card.id"
              class="popup-card selectable"
              @click="selectUserCard(card.id)"
          >
            <img :src="card.image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trade-card {
  overflow: hidden;
  max-width: 1000px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
}

.trade-card:hover {
  border-color: #333;
}

.trade-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.user-info-block {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
}

.username {
  font-weight: 600;
  color: #333;
}

.separator {
  height: 2px;
  background-color: #e0e0e0;
  width: 100%;
}

.cards-container {
  display: flex;
  gap: 12px;
}

.card-slot {
  position: relative;
  width: 80px;
  height: 112px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s;
}

.card-slot.active {
  border-color: #333;
  transform: scale(1.05);
}

.pokemon-card {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Área expandida */
.expanded-area {
  width: 100%;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.trade-expanded-content {
  display: flex;
  align-items: center;
  justify-content: center; /* centraliza o grupo todo */
  gap: 120px; /* espaço mais confortável entre cada item */
  width: 100%;
  box-sizing: border-box;
}
.selected-card img {
  width: 100px;
  height: 140px;
  border: 3px solid #333;
  border-radius: 8px;
}

.trade-icon img {
  width: 70px;
  opacity: 0.85;
}

.expanded-actions {
  display: flex;
  align-items: center;
  gap: 50px;
}

.trade-button {
  width: 90px;
  height: 135px;
  border: 2px solid #333;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}


.trade-button:hover {
  background: #333;
  color: #fff;
}

.selected-mini {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* Botão de confirmar proposta (fica abaixo do + e à direita) */
.confirm-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 160px;
  height: 60px;
  background-color: #333;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.confirm-button:hover {
  background-color: #000;
  transform: scale(1.05);
}

/* === POPUP === */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-container {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  width: 80%;
  max-width: 700px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  position: relative;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.popup-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.popup-card {
  width: 80px;
  height: 112px;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.popup-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-card.selectable:hover {
  border-color: #333;
  transform: scale(1.05);
  transition: 0.2s;
}

.popup-divider {
  width: 100%;
  height: 2px;
  background-color: #eee;
  margin: 20px 0;
}
</style>
