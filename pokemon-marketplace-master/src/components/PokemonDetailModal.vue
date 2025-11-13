<script setup lang="ts">
// (Coloque a lógica de 'script' que fizemos antes aqui)
// (import PokemonCard, props, emit, fetchModalData, etc.)
// ...
import PokemonCard from './PokemonCard.vue'
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  id: number,
  rarity?: 'normal' | 'holo'
}>()

const emit = defineEmits(['close'])

const pokemonName = ref('');
const pokemonGenus = ref('');

const fetchModalData = async (id: number) => {
  try {
    pokemonName.value = 'Buscando...'; // Estado de loading
    pokemonGenus.value = 'Buscando...';

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    pokemonName.value = data.name;

    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    const englishGenus = speciesData.genera.find((g: any) => g.language.name === 'en');
    pokemonGenus.value = englishGenus ? englishGenus.genus : 'Unknown';

  } catch (e) {
    console.error("Erro ao buscar dados do modal", e);
    pokemonName.value = 'Erro';
    pokemonGenus.value = 'Erro';
  }
}

watch(() => props.id, (newId) => {
  if (newId) fetchModalData(newId);
}, { immediate: true });
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">

    <div class="modal-content">

      <button class="close-button" @click="emit('close')">X</button>

      <div class="modal-body">

        <div class="modal-left">
          <PokemonCard :id="props.id" :rarity="props.rarity" />
        </div>

        <div class="modal-right">
          <h2>Detalhes do Pokémon</h2>
          <p><strong>Nome:</strong> <span style="text-transform: capitalize;">{{ pokemonName }}</span></p>
          <p><strong>Genus:</strong> {{ pokemonGenus }}</p>
          <p>...</p>
          <p>...</p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ CORREÇÃO PARA "embaixo da tela":
  Usamos 'position: fixed' para tirar o modal do fluxo normal
  e colocá-lo "flutuando" sobre toda a janela.
  O 'z-index' garante que ele fique na frente de tudo.
*/
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7); /* O escurecimento */
  z-index: 100;

  /* Isso centraliza a caixa branca */
  display: flex;
  justify-content: center;
  align-items: center;

  /* Adiciona um padding para a caixa não colar nas bordas */
  padding: 24px;
}

/* ✅ CORREÇÃO PARA "versão GIGANTE" (Parte 1):
  Definimos um 'max-width' para a caixa branca.
  Ela vai ocupar 100% da tela em celulares, mas no máximo 900px
  em telas grandes.
*/
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  position: relative; /* Para o botão 'X' se posicionar */
  z-index: 101; /* Fica em cima do backdrop */

  width: 100%;
  max-width: 900px;

  max-height: 90vh; /* Altura máxima */
  overflow-y: auto; /* Adiciona scroll se o conteúdo for muito alto */

  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-body {
  display: flex;
  gap: 2rem;
}

/* ✅ CORREÇÃO PARA "versão GIGANTE" (Parte 2):
  Aqui está o truque! Definimos um tamanho fixo (ou de porcentagem)
  para o container da carta.
  O 'PokemonCard' (que é responsivo) vai se adaptar a
  este container 'modal-left', e não mais à tela inteira.
*/
.modal-left {
  /* A carta terá 40% da largura do modal, com um mínimo de 300px */
  width: 40%;
  min-width: 300px;
  flex-shrink: 0; /* Impede que ele "encolha" demais */
}

.modal-right {
  flex-grow: 1; /* Ocupa o resto do espaço */
}
.modal-right h2 {
  margin-top: 0;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
  z-index: 102;
}
.close-button:hover {
  background: #ddd;
}

/* ✅ BÔNUS: Responsividade para Mobile
  Em telas pequenas, empilhamos a carta e os detalhes.
*/
@media (max-width: 768px) {
  .modal-body {
    flex-direction: column; /* Empilha a carta e os detalhes */
    align-items: center; /* Centraliza */
  }
  .modal-left {
    width: 100%; /* Carta ocupa a largura total */
    max-width: 350px; /* Mas não fica 'gigante' */
  }
  .modal-right {
    width: 100%;
  }
}
</style>