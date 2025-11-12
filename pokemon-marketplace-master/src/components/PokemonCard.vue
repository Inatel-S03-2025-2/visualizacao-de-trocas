<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// Define a interface para as props
interface Props {
  id: number
  rarity?: 'normal' | 'holo'
}

const props = defineProps<Props>()

// Tipagem simplificada para os dados que realmente usamos
interface PokemonData {
  name: string
  sprites: {
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
}

const pokemon = ref<PokemonData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Função para buscar dados da PokéAPI
const fetchPokemon = async (id: number) => {
  loading.value = true
  error.value = null
  pokemon.value = null

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    if (!res.ok) {
      throw new Error(`Pokémon com ID ${id} não encontrado.`)
    }
    const data: PokemonData = await res.json()
    pokemon.value = data
  } catch (e: any) {
    console.error('Erro ao carregar Pokémon:', e)
    error.value = e.message || 'Erro ao buscar dados do Pokémon.'
  } finally {
    loading.value = false
  }
}

// Busca inicial ao montar (ou quando 'id' for setado no sidebar)
onMounted(() => {
  if (props.id) {
    fetchPokemon(props.id)
  }
})

// Mapeamento das Cores por tipo
const typeColors: Record<string, string> = {
  electric: '#FFD700',
  fire: '#FF4500',
  water: '#1E90FF',
  grass: '#32CD32',
  psychic: '#C71585',
  normal: '#D3D3D3',
  ground: '#DEB887',
  bug: '#9ACD32',
  fairy: '#EE82EE',
  ice: '#00BFFF',
  rock: '#B8860B',
  ghost: '#6A5ACD',
  dragon: '#7038F8',
  dark: '#705848',
  poison: '#A040A0', // Adicionado: Tipo que estava faltando no seu map
  fighting: '#C03028', // Adicionado
  steel: '#B8B8D0', // Adicionado
}

// Valores Computados
const imageUrl = computed(() =>
    pokemon.value?.sprites?.other['official-artwork']?.front_default ||
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'
)

const primaryType = computed(() => pokemon.value?.types?.[0]?.type?.name || 'normal')

const bgColor = computed(() => typeColors[primaryType.value] || '#CCC')

// Função auxiliar para encontrar estatísticas por nome
const getStat = (name: 'hp' | 'attack' | 'special-attack'): number => {
  const stat = pokemon.value?.stats.find(s => s.stat.name === name)
  return stat?.base_stat ?? 0
}

const hp = computed(() => getStat('hp'))
const attack = computed(() => getStat('attack'))
const spAttack = computed(() => getStat('special-attack'))

</script>

<template>
  <div v-if="loading" class="loading-card">
    <span>Loading...</span>
  </div>

  <div v-else-if="error" class="error-card">
    <span>Erro: {{ error }}</span>
  </div>

  <div
      v-else-if="pokemon"
      class="pokemon-card"
      :class="{ holo: props.rarity === 'holo' }"
      :style="{ '--type-color': bgColor }"
  >
    <div class="card-inner">
      <div class="content-area">
        <div class="card-header">
          <span class="name">{{ pokemon.name.toUpperCase() }}</span>
          <span class="hp">HP {{ hp }}</span>
        </div>

        <div class="image-container">
          <img :src="imageUrl" :alt="pokemon.name" />
        </div>

        <div class="info">
          <span class="type-tag">{{ primaryType.toUpperCase() }}</span>
        </div>

        <div class="attacks">
          <div class="attack">
            <span class="attack-name">Attack</span>
            <span class="attack-power">{{ attack }}</span>
          </div>
          <div class="attack">
            <span class="attack-name">Sp. Attack</span>
            <span class="attack-power">{{ spAttack }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  ... Mantenha todo o seu CSS original aqui (incluindo .pokemon-card, .card-inner, .holo, .loading-card, etc.).
*/

.error-card {
  width: 250px;
  aspect-ratio: 63 / 88;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffebeb;
  border: 2px solid #ff4444;
  border-radius: 12px;
  color: #ff4444;
  font-family: monospace;
  padding: 16px;
  text-align: center;
}

/* O resto do seu CSS original do PokemonCard.vue */
.pokemon-card {
  position: relative;
  aspect-ratio: 63 / 88;
  width: 250px;

  /* ✅ ALTERAÇÃO APLICADA AQUI: Fundo do card agora é a cor sólida do tipo */
  background-color: var(--type-color); /* Cor sólida do tipo */

  /* A borda amarela externa */
  border: 4px solid #ffcc00;
  border-radius: 12px;

  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  font-family: 'Segoe UI', sans-serif;
  transition: transform 0.2s ease;
}

.pokemon-card:hover {
  transform: translateY(-4px);
}

.card-inner {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  border: 2px solid #ffcc00;
  border-radius: 8px;
  background-color: #faf9f6; /* Fundo base */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.content-area {
  width: 100%;
  height: 100%;

  /* Fundo do conteúdo interno é a cor sólida do tipo */
  background-color: var(--type-color);

  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hp {
  color: #d62828;
  font-size: 14px;
}

.image-container {
  /* Mantendo o gradiente de fundo sutil para a caixa de imagem,
     para dar profundidade à imagem do Pokémon, independentemente do tipo. */
  border: 2px solid #ffcc00;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff 0%, #f9f9f9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  margin: 6px 0;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.info {
  text-align: center;
  font-size: 12px;
  color: #444;
  margin-bottom: 6px;
}

.type-tag {
  display: inline-block;
  background-color: var(--type-color);
  color: #fff;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  margin-bottom: 2px;
}

.attacks {
  border-top: 1px solid #ffcc00;
  padding-top: 4px;
}

.attack {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
  color: #333;
}

.attack + .attack {
  border-top: 1px dashed #ffcc00;
}

/* ✨ Holográfico */
.holo::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
      125deg,
      rgba(255, 255, 255, 0.2),
      rgba(0, 255, 255, 0.2),
      rgba(255, 0, 255, 0.2),
      rgba(255, 255, 255, 0.2)
  );
  background-size: 400% 400%;
  mix-blend-mode: overlay;
  animation: holo-shine 6s linear infinite;
  pointer-events: none;
  border-radius: 12px;
}

@keyframes holo-shine {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.loading-card {
  width: 250px;
  aspect-ratio: 63 / 88;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  font-family: monospace;
}
</style>