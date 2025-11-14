<script setup lang="ts">

import { ref, onMounted } from 'vue'
import PokemonCard from './PokemonCard.vue'

const randomId = ref<number | null>(null)

onMounted(() => {
  // Gera um ID aleatório de 1 a 151 (Gen 1)
  randomId.value = Math.floor(Math.random() * 151) + 1
})
</script>

<template>
  <div class="card-test-page">
    <h1>Teste de Responsividade de Cards</h1>
    <p>O mesmo card de Pokémon (ID: {{ randomId || '...' }}) renderizado em diferentes tamanhos de contêiner. Redimensione a janela para ver como eles se adaptam.</p>

    <div class="card-display-area">

      <div class="card-wrapper">
        <h3>Pequeno (150px)</h3>
        <PokemonCard v-if="randomId" :id="randomId"  />
      </div>

      <div class="card-wrapper">
        <h3>Médio (250px)</h3>
        <PokemonCard v-if="randomId" :id="randomId" rarity="holo" />
      </div>

      <div class="card-wrapper">
        <h3>Grande (400px)</h3>
        <PokemonCard v-if="randomId" :id="randomId" />
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ✅ ESTILOS CORRETOS */
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

/* Um contêiner flexível para os nossos wrappers */
.card-display-area {
  display: flex;
  flex-wrap: wrap; /* Permite que os cards quebrem a linha em telas pequenas */
  gap: 24px;
  justify-content: center; /* Centraliza os cards */
  align-items: flex-start; /* Alinha os cards pelo topo */
  padding-top: 24px;
  border-top: 1px solid #eee;
}

/* O "wrapper" (caixa) que define o tamanho de cada card */
.card-wrapper {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-wrapper h3 {
  text-align: center;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Esta é a mágica!
  Forçamos o PokemonCard (usando :deep) a ter
  exatamente 100% da largura do seu .card-wrapper
*/
.card-wrapper :deep(.pokemon-card) {
  width: 100% !important;
  height: auto !important;
  max-width: 100%;
}

/* Definimos os tamanhos dos wrappers */
.card-wrapper:nth-child(1) { width: 150px; }
.card-wrapper:nth-child(2) { width: 250px; }
.card-wrapper:nth-child(3) { width: 450px; }

/* Em telas muito pequenas, fazemos todos os wrappers
   ocuparem 100% da largura para melhor visualização
*/
@media (max-width: 480px) {
  .card-wrapper:nth-child(1),
  .card-wrapper:nth-child(2),
  .card-wrapper:nth-child(3) {
    width: 100%;
  }
}
</style>