<script setup lang="ts">
// --- SCRIPT (Sem mudanças) ---
import { ref, onMounted } from 'vue'
import PokemonCard from './PokemonCard.vue'

const randomId = ref<number | null>(null)

onMounted(() => {
  // Gera um ID aleatório de 1 a 1000
  randomId.value = Math.floor(Math.random() * 1000) + 1
})
</script>

<template>
  <div class="card-test-page">
    <h1>Teste de Responsividade de Cards</h1>

    <div class="card-display-area">

      <div class="card-wrapper">
        <h3>Pequeno (150px)</h3>
        <PokemonCard v-if="randomId" :id="randomId+4"  />
      </div>


      <div class="card-wrapper">
        <h3>Médio (250px)</h3>
        <PokemonCard v-if="randomId" :id="randomId+8" rarity="holo" />
      </div>

      <div class="card-wrapper">
        <h3>Grande (400px)</h3>
        <PokemonCard v-if="randomId" :id="randomId+16" />
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- STYLE (Modificações aplicadas) --- */

.card-test-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 16px;
}

p {
  color: #555;
  margin-bottom: 24px;
  line-height: 1.6;
}

.card-display-area {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  align-items: flex-start;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.card-wrapper {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* ✅ MUDANÇA: Adicionado perspective para o efeito 3D */
  perspective: 1000px;
}

.card-wrapper h3 {
  text-align: center;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-wrapper :deep(.pokemon-card) {
  /* Tamanho (como estava antes) */
  width: 100% !important;
  height: auto !important;
  max-width: 100%;

  /* ✅ MUDANÇA: Adicionada a transição e o estilo 3D */
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  transform-style: preserve-3d;
}

/* ✅ MUDANÇA: Adicionado o bloco de HOVER */
/* Quando o PAI (.card-wrapper) sofre hover, o FILHO (:deep(.pokemon-card)) anima */
.card-wrapper:hover :deep(.pokemon-card) {
  transform: translateY(-0.5rem) scale(1.03);
  box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.25);
  z-index: 10;
}


/* Definimos os tamanhos dos wrappers (Sem mudanças) */
.card-wrapper:nth-child(1) { width: 150px; }
.card-wrapper:nth-child(2) { width: 250px; }
.card-wrapper:nth-child(3) { width: 450px; }

/* Media query (Sem mudanças) */
@media (max-width: 480px) {
  .card-wrapper:nth-child(1),
  .card-wrapper:nth-child(2),
  .card-wrapper:nth-child(3) {
    width: 100%;
  }
}
</style>