<template>
  <div
      v-if="pokemon"
      class="pokemon-avatar"
      :style="{ backgroundImage: avatarBackgroundStyle }"
  >
    <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="pokemon.name"
        class="avatar-image"
    />
    <div v-else class="placeholder">?</div>
  </div>

  <div v-else class="pokemon-avatar loading-placeholder">
    <div class="placeholder">...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
// 2. Importe o SEU mapa de XP e o NOSSO gerador de ID
import { pokemonBaseXpMap } from '../data/pokemonBaseXpMap';
import { generatePokemonIdFromSeed } from '../utils/avatarGenerator.js';

// --- Props ---
const props = defineProps<{
  seed: string | number;
}>();

// --- Interface (Simplificada do seu Card) ---
interface AvatarPokemonData {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': { front_default: string };
      dream_world?: { front_default: string };
    }
  };
  types: Array<{
    type: { name: string };
  }>;
  species: { url: string };
}

// --- Refs ---
const pokemon = ref<AvatarPokemonData | null>(null);
const pokemonId = ref<number | null>(null);
const isFinalEvolution = ref(false); // Necessário para a lógica do fundo

// --- Lógica de Fetch (Adaptada do seu Card) ---

// 1. Busca os dados principais
const fetchPokemonData = async (id: number) => {
  if (!id) return;
  pokemon.value = null;
  isFinalEvolution.value = false;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error(`Pokémon ID ${id} não encontrado.`);
    const data: AvatarPokemonData = await res.json();
    pokemon.value = data;
  } catch (e: any) {
    console.error('Erro ao carregar Pokémon para avatar:', e);
    pokemon.value = null;
  }
};

// 2. Busca dados secundários (para saber se é evolução final)
async function fetchSecondaryData(pokemonData: AvatarPokemonData) {
  try {
    // A única coisa que nos interessa é o XP
    const baseXP = pokemonBaseXpMap[pokemonData.id];
    if (baseXP && baseXP > 210) {
      isFinalEvolution.value = true;
    } else {
      isFinalEvolution.value = false;
    }
  } catch (e) {
    console.error('Erro ao checar BaseXP do mapa:', e);
    isFinalEvolution.value = false;
  }
}

// 3. Watcher que "amarra" tudo
watchEffect(() => {
  if (props.seed) {
    // 1. Gera o ID do Pokémon
    pokemonId.value = generatePokemonIdFromSeed(props.seed);
    // 2. Busca os dados
    fetchPokemonData(pokemonId.value);
  }
});

// 4. Watcher que busca dados secundários (quando os dados principais chegam)
watchEffect(() => {
  if (pokemon.value) {
    fetchSecondaryData(pokemon.value);
  }
});


// --- Computed Properties (COPIADAS DIRETAMENTE do seu Card) ---

const imageUrl = computed(() =>
    pokemon.value?.sprites?.other?.dream_world?.front_default ||
    pokemon.value?.sprites?.other['official-artwork']?.front_default ||
    null
);

const primaryType = computed(() => pokemon.value?.types?.[0]?.type?.name || 'normal');

// Mapas de Textura (COPIADOS do seu Card)
const pokemonTextureMap: Record<string, string> = {
  'water': 'water', 'fire': 'fire', 'grass': 'grass', 'electric': 'electric',
  'psychic': 'Psy', 'dark': 'dark', 'dragon': 'Psy', 'fighting': 'ground',
  'steel': 'ground', 'normal': 'grass', 'ground': 'ground', 'rock': 'ground',
  'poison': 'dark', 'bug': 'grass', 'fairy': 'Psy', 'ghost': 'dark',
  'ice': 'ice', 'flying': 'grass', 'unknown': 'normal',
};

const textureCounts: Record<string, Record<string, number>> = {
  BGNormal: {
    water: 5, fire: 5, grass: 6, Psy: 3, ground: 4,
    dark: 4, cinza: 1, eletric: 3,
  },
  BGFinal: { all: 5 },
};

// 3. A Lógica de Fundo (ADAPTADA do seu Card)
// Esta é a sua `pokemonBackgroundStyle`, mas renomeada.
const avatarBackgroundStyle = computed(() => {
  const typeName = primaryType.value;
  const fileKey = pokemonTextureMap[typeName] || 'normal';
  let texturePath = '';

  const maxCount = isFinalEvolution.value
      ? textureCounts.BGFinal.all
      : (textureCounts.BGNormal[fileKey] || 1);

  // Aqui está a magia: usamos o ID do Pokémon gerado
  // como "seed" para o fundo, tal como o seu card fazia.
  const randomIndex = (pokemonId.value ? pokemonId.value % maxCount : 0) + 1;

  if (isFinalEvolution.value) {
    const baseFolder = 'BGFinal';
    const fileNamePrefix = 'BGf';
    texturePath = `/BG/${baseFolder}/${fileNamePrefix}-${randomIndex}.png`;
  } else {
    const baseFolder = 'BGNormal';
    const fileNamePrefix = fileKey;
    texturePath = `/BG/${baseFolder}/${fileKey}/${fileNamePrefix}-${randomIndex}.png`;
  }

  // Retorna a string de URL para o CSS
  return `url('${texturePath}')`;
});

</script>

<style scoped>
/* 4. Estilo do Círculo */
.pokemon-avatar {
  width: 50px; /* Ajuste o tamanho conforme necessário */
  height: 50px;
  border-radius: 50%;
  overflow: hidden;

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Estilo */
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);

  /* Garante que o fundo da textura cubra o círculo */
  background-size: cover;
  background-position: center;
}

.loading-placeholder {
  background: #f0f0f0;
}

.avatar-image {
  /* A imagem fica um pouco menor para mostrar o fundo */
  width: 90%;
  height: 90%;
  object-fit: contain;

  /* Para sprites pixelados (como o front_default) não ficarem borrados */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;

  /* Garante que a imagem não seja "esmagada" se for artwork */
  object-fit: contain;
}

.placeholder {
  font-size: 20px;
  font-weight: bold;
  color: rgba(0,0,0,0.4);
  user-select: none;
}
</style>