<script setup lang="ts">
import PokemonCard from './PokemonCard.vue'
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  id: number,
  rarity?: 'normal' | 'holo'
}>()

const emit = defineEmits(['close'])

const pokemonData = ref<any>(null);
const pokemonGenus = ref('');
const loading = ref(true);

const typeColors: Record<string, string> = {
  electric: '#FFD700', fire: '#FF4500', water: '#1E90FF',
  grass: '#32CD32', psychic: '#C71585', normal: '#989898',
  ground: '#DEB887', bug: '#9ACD32', fairy: '#EE82EE',
  ice: '#00BFFF', rock: '#B8860B', ghost: '#6A5ACD',
  dragon: '#7038F8', dark: '#705848', poison: '#A040A0',
  fighting: '#C03028', steel: '#B8B8D0', flying: '#61e8f6',
}

const typeSymbols: Record<string, string> = {
}

const fetchModalData = async (id: number) => {
  try {
    loading.value = true;
    pokemonData.value = null;
    pokemonGenus.value = '';

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    pokemonData.value = data;

    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    const englishGenus = speciesData.genera.find((g: any) => g.language.name === 'en');
    pokemonGenus.value = englishGenus ? englishGenus.genus : 'Unknown';

  } catch (e) {
    console.error("Erro ao buscar dados do modal", e);
  } finally {
    loading.value = false;
  }
}

watch(() => props.id, (newId) => {
  if (newId) fetchModalData(newId);
}, { immediate: true });

const totalStats = computed(() => {
  if (!pokemonData.value) return 0;
  return pokemonData.value.stats.reduce((acc: number, stat: any) => acc + stat.base_stat, 0);
});

const primaryType = computed(() => pokemonData.value?.types[0]?.type?.name || 'normal');

const backgroundSymbolUrl = computed(() => {
  return typeSymbols[primaryType.value] || null;
});

const primaryColor = computed(() => {
  return typeColors[primaryType.value] || '#CCC';
});

const formatStatName = (name: string) => {
  return name
      .replace('special-attack', 'Sp. Atk')
      .replace('special-defense', 'Sp. Def')
      .replace('attack', 'Attack')
      .replace('defense', 'Defense')
      .replace('speed', 'Speed')
      .replace('hp', 'HP');
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="emit('close')">X</button>

      <div v-if="loading" class="loading-spinner">
        Buscando dados...
      </div>

      <div v-else-if="pokemonData" class="modal-body">

        <div class="modal-left">
          <PokemonCard :id="props.id" :rarity="props.rarity" />
        </div>

        <div class="modal-right">

          <img v-if="backgroundSymbolUrl" :src="backgroundSymbolUrl" class="modal-right-bg" />

          <div class="name-header">
            <h2 class="pokemon-name">
              {{ pokemonData.name }}
              <span>#{{ String(pokemonData.id).padStart(3, '0') }}</span>
            </h2>

            <div class="type-tags">
              <span
                  v-for="typeInfo in pokemonData.types"
                  :key="typeInfo.type.name"
                  class="type-tag"
                  :style="{ backgroundColor: typeColors[typeInfo.type.name] || '#CCC' }"
              >
                {{ typeInfo.type.name }}
              </span>
            </div>
          </div>
          <div class="physical-data">
            <p><strong>Species:</strong> {{ pokemonGenus }}</p>
            <p><strong>Height:</strong> {{ pokemonData.height / 10 }} m</p>
            <p><strong>Weight:</strong> {{ pokemonData.weight / 10 }} kg</p>
          </div>

          <div class="stat-list">
            <div
                v-for="stat in pokemonData.stats"
                :key="stat.stat.name"
                class="stat-item"
            >
              <span class="stat-name">{{ formatStatName(stat.stat.name) }}</span>
              <span class="stat-value">{{ stat.base_stat }}</span>
              <div class="stat-bar">
                <div
                    class="stat-bar-inner"
                    :style="{
                    width: `${(stat.base_stat / 255) * 100}%`,
                    backgroundColor: primaryColor
                  }"
                ></div>
              </div>
            </div>

            <div class="stat-item total">
              <span class="stat-name">Total</span>
              <span class="stat-value">{{ totalStats }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex; justify-content: center; align-items: center;
  padding: 24px;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  position: relative;
  z-index: 1001;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.7);
}

.modal-body {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.modal-left {
  width: 40%;
  min-width: 300px;
  flex-shrink: 0;
  /* ✅ Adicionado: Margem inferior para mobile, para evitar que o card 'grude' no próximo bloco */
  margin-bottom: 0; /* Default para desktop */
}

.modal-right {
  flex-grow: 1;
  position: relative;
  min-width: 300px;
  font-family: 'Segoe UI', sans-serif;
  color: #333;
  /* ✅ Adicionado: Margem superior para mobile */
  margin-top: 0; /* Default para desktop */
}

.modal-right-bg {
  position: absolute;
  right: -20px;
  bottom: 0px;
  width: 250px;
  height: 250px;
  opacity: 0.1;
  z-index: 0;
  pointer-events: none;
}

.modal-right > * {
  position: relative;
  z-index: 1;
}

.name-header {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.pokemon-name {
  margin-top: 0;
  margin-bottom: 0;
  text-transform: capitalize;
  font-size: 2rem;
  font-weight: 700;
}
.pokemon-name span {
  font-weight: 400;
  color: #888;
  margin-left: 0.5rem;
}

.type-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0;
}
.type-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  color: white;
  /* ✅ Mudança 3: Tamanho da fonte da tipagem maior */
  font-size: 1.2rem; /* Era 0.9rem */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.physical-data {
  margin-bottom: 1rem;
  line-height: 1.6;
}
.physical-data p {
  margin: 0.25rem 0;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.stat-item {
  display: grid;
  /* ✅ Mudança 2: Diminuir distância entre nome e valor. */
  /* Colunas: Nome (80px), Valor (30px), Barra (resto) */
  grid-template-columns: 80px 30px 1fr; /* Era 40px */
  align-items: center;
  /* ✅ Mudança 2: Reduzir o gap no grid para aproximar os elementos */
  gap: 0.3rem; /* Era 0.5rem */
}
.stat-item.total {
  /* Mantém o mesmo grid */
  grid-template-columns: 80px 30px 1fr; /* Era 40px */
  font-weight: 900;
  margin-top: 0.5rem;
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
}

.stat-name {
  /* ✅ Mudança 1: Peso da fonte igual ao das labels de 'Species' */
  font-weight: 600; /* Era 600. `strong` é geralmente 700 ou 600. `400` é 'normal'. */
  text-align: left;
  text-transform: capitalize;
  font-size: 1.1rem;
}
.stat-value {
  font-weight: 700;
  text-align: right;
  font-size: 1rem;
}

.stat-bar {
  width: 100%;
  height: 12px;
  background-color: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}
.stat-bar-inner {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.close-button {
  position: absolute; top: 10px; right: 10px;
  background: #eee; border: none; border-radius: 50%;
  width: 30px; height: 30px; cursor: pointer; font-weight: bold;
  z-index: 1002;
}
.close-button:hover { background: #ddd; }

.loading-spinner {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
    align-items: center;
  }
  .modal-left {
    width: 100%;
    max-width: 350px;
    /* ✅ Adicionado: Margem inferior para o card em telas pequenas */
    margin-bottom: 1.5rem;
  }
  .modal-right {
    width: 100%;
    /* ✅ Adicionado: Margem superior para o bloco de stats em telas pequenas */
    margin-top: 0; /* Começa alinhado ao card */
  }
  .modal-right-bg {
    width: 150px; height: 150px;
    right: 0;
  }
}
</style>