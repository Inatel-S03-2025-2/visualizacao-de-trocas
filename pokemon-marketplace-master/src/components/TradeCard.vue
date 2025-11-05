<script setup lang="ts">
interface Card {
  id: number
  image: string
}

interface Props {
  username: string
  avatar: string
  cards: Card[]
}

defineProps<Props>()
</script>

<template>
  <div class="trade-card">
    <div class="trade-header">
      <img :src="avatar" :alt="username" class="user-avatar" />
      <div class="user-info">
        <span class="username">{{ username }}</span>
        <div class="separator"></div>
      </div>
    </div>

    <div class="cards-container">
      <div v-for="card in cards" :key="card.id" class="card-slot">
        <img :src="card.image" :alt="'Card ' + card.id" class="pokemon-card" />
      </div>
    </div>

    <button class="trade-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.trade-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.trade-card:hover {
  border-color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  width: 80px;
  height: 112px;
  background-color: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.card-slot:hover {
  transform: translateY(-4px);
}

.pokemon-card {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
