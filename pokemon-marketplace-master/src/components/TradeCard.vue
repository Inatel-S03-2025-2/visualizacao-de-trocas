<script setup lang="ts">
import { computed } from 'vue'
import PokemonCard from './PokemonCard.vue'
import PokemonAvatar from './PokemonAvatar.vue'

interface MockCard {
  id: number
  pokeId?: number
  pokeApiId?: number
}

interface Props {
  username: string
  cards: MockCard[]
  date?: string
  offerCount?: number
  isActive: boolean
}

const props = withDefaults(defineProps<Props>(), {
  offerCount: 0
})

const emit = defineEmits(['cardClicked'])

const getId = (card: MockCard) => card.pokeId || card.pokeApiId || card.id

// Lógica de tempo
const timeAgo = computed(() => {
  if (!props.date) return 'Recente'
  // Usando uma data fixa apenas para exemplo, em produção use new Date()
  const now = new Date('2025-11-21T15:00:00')
  const posted = new Date(props.date)
  const diffMs = now.getTime() - posted.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHrs < 1) return 'Agora mesmo'
  if (diffHrs < 24) return `há ${diffHrs}h`
  return `há ${Math.floor(diffHrs / 24)}d`
})

// Lógica visual para Popularidade (Mantida apenas para trocar o ícone)
const isHot = computed(() => props.offerCount > 3)
</script>

<template>
  <div class="trade-card" :class="{ active: isActive }">
    <div class="trade-header">

      <div class="user-info-block">
        <PokemonAvatar :seed="username" class="user-avatar" />
        <div class="user-text-info">
          <span class="username" :title="username">{{ username }}</span>
          <span class="user-level">Treinador</span>
        </div>
      </div>

      <div class="cards-list">
        <div
            v-for="card in cards"
            :key="card.id"
            class="simple-card-wrapper"
            @click.stop="emit('cardClicked', getId(card))"
        >
          <PokemonCard :id="getId(card)" />
        </div>
      </div>

      <div class="meta-info-block">
        <div class="meta-divider"></div>
        <div class="meta-content">

          <div class="time-badge">
            <span class="clock-icon">🕒</span>
            <span>{{ timeAgo }}</span>
          </div>

          <div class="popularity-container" :class="{ 'hot-item': isHot }">
            <span class="offer-icon" v-if="isHot">🔥</span>
            <span class="offer-icon" v-else>📩</span>

            <span class="offer-text">
               <strong>#{{ offerCount }}</strong> ofertas
             </span>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- ESTRUTURA GERAL (Mantida) --- */
.trade-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 16px; padding: 15px 25px; transition: all 0.3s ease; cursor: pointer; position: relative; z-index: 2; }
.trade-card:hover { border-color: #b0bec5; transform: translateY(-2px); }
.trade-card.active { border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom-color: #f8f9fa; transform: none; }
.trade-header { display: flex; align-items: center; justify-content: flex-start; gap: 0; }
.user-info-block { display: flex; align-items: center; gap: 12px; width: 250px; min-width: 250px; padding-right: 20px; border-right: 2px solid #f0f0f0; margin-right: 20px; }
.user-text-info { display: flex; flex-direction: column; overflow: hidden; flex: 1; }
.username { font-weight: 700; color: #333; font-size: 1.2em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.user-level { font-size: 0.8em; color: #999; }
.user-avatar { width: 70px; height: 70px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); flex-shrink: 0; object-fit: cover; }
.cards-list { display: flex; gap: 10px; flex-wrap: wrap; flex-grow: 1; }
.simple-card-wrapper { width: 120px; perspective: 1000px; display: block; cursor: pointer; }
.simple-card-wrapper :deep(.pokemon-card) { width: 100% !important; height: auto !important; transition: transform 0.2s ease-out; }
.simple-card-wrapper:hover :deep(.pokemon-card) { transform: translateY(-5px) scale(1.1); z-index: 10; }

/* --- CSS DA COLUNA DA DIREITA (ALTERADO) --- */
.meta-info-block {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 20px;
  height: 70px;
}

.meta-divider {
  width: 2px;
  height: 40px;
  background-color: #f0f0f0;
  margin-right: 20px;
}

.meta-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px; /* Aumentei um pouco o espaço entre os dois badges */
  min-width: 110px; /* Aumentei a largura mínima para caber o texto maior */
}

/* BADGE DE TEMPO (MAIOR) */
.time-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.1em; /* AUMENTADO (era 0.85em) */
  color: #666;
  font-weight: 600;
  background-color: #f5f5f5;
  padding: 6px 12px; /* Padding ajustado para o tamanho novo */
  border-radius: 20px;
}

.clock-icon {
  font-size: 1em;
  opacity: 0.7;
}

/* BADGE DE OFERTAS (MAIOR E SEMPRE CINZA) */
.popularity-container {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.1em; /* AUMENTADO (era 0.8em) */
  color: #666; /* Sempre cinza escuro */
  background: #f5f5f5; /* Sempre fundo cinza claro */
  padding: 6px 12px; /* Padding ajustado */
  border-radius: 12px;
  transition: all 0.3s;
}

.offer-text strong {
  color: #333; /* Número em preto/cinza forte */
  font-weight: 800;
  font-size: 1.05em;
}

.offer-icon {
  font-size: 1.1em;
  /* Se quiser que o ícone de fogo continue laranja, descomente a linha abaixo: */
  /* color: #e65100; */
}

/* REMOVI AS REGRAS QUE DEIXAVAM LARANJA */
/*
.popularity-container.hot-item {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}
.hot-item .offer-text strong { color: #e65100; }
*/
</style>