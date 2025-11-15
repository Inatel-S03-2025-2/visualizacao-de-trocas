<script setup lang="ts">
// 1. IMPORTAMOS O NOVO COMPONENTE
import PokemonCard from './PokemonCard.vue'
import PokemonAvatar from './PokemonAvatar.vue' // Ajuste o caminho se necessário

interface MockCard {
  id: number
  pokeApiId: number
}
interface Props {
  username: string
  cards: MockCard[]
  isActive: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['cardClicked'])
</script>

<template>
  <div class="trade-card" :class="{ active: isActive }">
    <div class="trade-header">
      <div class="user-info-block">

        <PokemonAvatar
            :seed="username"
            class="user-avatar"
        />

        <div class="user-info">
          <span class="username">{{ username }}</span>
          <div class="separator"></div>
        </div>
      </div>

      <div class="cards-container">
        <div
            v-for="card in cards"
            :key="card.id"
            class="pokemon-card-wrapper"
        >
          <PokemonCard
              :id="card.pokeApiId"
              @click="emit('cardClicked', card.pokeApiId)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trade-card {
  max-width: 1000px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  position: relative;
  z-index: 2;
}

.trade-card.active {
  border-color: #333;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.trade-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 4. O seu CSS original .user-avatar funciona perfeitamente! */
.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  /* O background-color no componente de avatar serve de fallback */
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

.pokemon-card-wrapper {
  position: relative;
  width: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  perspective: 1000px;
}

.pokemon-card-wrapper :deep(.pokemon-card) {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  transform-style: preserve-3d;
  width: 100%;
  height: auto;
}

.pokemon-card-wrapper:hover :deep(.pokemon-card) {
  transform: translateY(-0.3rem) scale(1.05);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
  z-index: 10;
}
</style>