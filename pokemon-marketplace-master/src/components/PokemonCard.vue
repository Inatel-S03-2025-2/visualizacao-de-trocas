<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

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
// ✅ NOVOS ESTADOS PARA EVOLUÇÃO
const evolutionChain = ref<any>(null);
const isFinalEvolution = ref(false);


// Função para buscar dados da PokéAPI
const fetchPokemon = async (id: number) => {
  loading.value = true
  error.value = null
  pokemon.value = null
  isFinalEvolution.value = false; // Reseta o estado

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

// ✅ NOVA FUNÇÃO: Busca a cadeia de evolução e checa se é o estágio final
const fetchEvolutionChain = async (speciesUrl: string) => {
  try {
    const speciesRes = await fetch(speciesUrl);
    if (!speciesRes.ok) throw new Error("Species not found.");
    const speciesData = await speciesRes.json();

    const evoChainRes = await fetch(speciesData.evolution_chain.url);
    if (!evoChainRes.ok) throw new Error("Evolution Chain not found.");
    const evoChainData = await evoChainRes.json();

    evolutionChain.value = evoChainData.chain;

    // Função recursiva para encontrar o pokemon e checar o "evolves_to"
    const findEvolution = (chain: any) => {
      if (chain.species.name === pokemon.value?.name) {
        return chain.evolves_to.length === 0;
      }
      for (const nextChain of chain.evolves_to) {
        const found = findEvolution(nextChain);
        if (found !== undefined) return found;
      }
      return undefined;
    };

    isFinalEvolution.value = findEvolution(evoChainData.chain) ?? false;

  } catch (e: any) {
    console.error('Erro ao buscar cadeia de evolução:', e);
    isFinalEvolution.value = false; // Garante que seja false em caso de erro
  }
}

// Observa 'pokemon.value' e chama a busca da evolução
watch(pokemon, (newPokemon) => {
  if (newPokemon) {
    // Busca a URL da espécie dentro do 'pokemon.value'
    // Nota: A API de pokemon não tem o species.url, precisamos buscar pelo nome
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${newPokemon.name}`;
    fetchEvolutionChain(speciesUrl);
  }
});


// Busca inicial ao montar (ou quando 'id' for setado no sidebar)
onMounted(() => {
  if (props.id) {
    fetchPokemon(props.id)
  }
})

// Mapeamento das Cores por tipo (TABELA DE COR)
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
  poison: '#A040A0',
  fighting: '#C03028',
  steel: '#B8B8D0',
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

// ✅ FUNÇÃO AUXILIAR: Gera um número aleatório
const getRandomNumber = (min: number, max: number) => {
  // Ajuste para array (base 0) ou contagem (base 1)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// 🛑 MUDANÇA 1: Renomeado para 'cardTextureMap'
// Mapeamento de Tipo para Textura do CARD (FUNDO PRINCIPAL)
const cardTextureMap: Record<string, string> = {
  'water': 'water', 'fire': 'fogo', 'grass': 'grass', 'electric': 'eletric',
  'psychic': 'Psy', 'dark': 'dark', 'dragon': 'dragon', 'fighting': 'ground',
  'steel': 'normal', 'normal': 'normal', 'ground': 'ground', 'rock': 'ground',
  'poison': 'Psy', 'bug': 'grass', 'fairy': 'Psy', 'ghost': 'Psy', 'ice': 'water',
  'flying': 'normal', 'unknown': 'normal',
};

// 🛑 MUDANÇA 2: Nova tabela 'pokemonTextureMap'
// Mapeamento de Tipo para Textura do POKÉMON (IMAGEM)
const pokemonTextureMap: Record<string, string> = {
  'water': 'water', 'fire': 'ground', 'grass': 'grass', 'electric': 'electric',
  'psychic': 'Psy', 'dark': 'dark', 'dragon': 'dragon', 'fighting': 'ground',
  'steel': 'ground', 'normal': 'grass', 'ground': 'ground', 'rock': 'ground',
  'poison': 'dark', // ✅ Exemplo: 'poison' é 'dark' aqui e 'Psy' no card
  'bug': 'grass',
  'fairy': 'Psy',
  'ghost': 'dark',
  'ice': 'water',
  'flying': 'normal',
  'unknown': 'normal',
};


// ✅ MUDANÇA 1: 'textureCounts' ATUALIZADO
const textureCounts: Record<string, Record<string, number>> = {
  BGNormal: {
    // VERIFIQUE ESTAS CONTANGENS!
    water: 3, fire: 2, grass: 4, normal: 1, Psy: 2, ground: 3,
    fighting: 2, dark: 1, dragon: 1, cinza: 1, eletric: 3, fogo: 2,
  },
  BGFinal: {
    all: 6 // ✅ Contagem dos 6 arquivos BGf-
  },
  BGCard: {
    water: 1, fire: 1, grass: 1, electric: 1, Psy: 1, normal: 1,
  }
};

// ✅ MUDANÇA 2: Array 'finalEvolutionBackgrounds' REMOVIDO


// 🛑 PROPRIEDADE 1: Fundo da CARTA (Simples, BGCard)
const cardBackgroundStyle = computed(() => {
  const typeName = primaryType.value;
  // Usando 'cardTextureMap'
  const fileKey = cardTextureMap[typeName] || 'normal';

  // 🛑 VERIFIQUE A EXTENSÃO DO BGCARD AQUI
  // Seus arquivos BGCard são .jpg? Se forem .png, mude abaixo.
  const texturePath = `/BG/BGCard/${fileKey}-texture.jpg`;

  return `url('${texturePath}')`;
});


// ✅ MUDANÇA 3: 'pokemonBackgroundStyle' ATUALIZADO
const pokemonBackgroundStyle = computed(() => {
  const typeName = primaryType.value;
  // Usando 'pokemonTextureMap'
  const fileKey = pokemonTextureMap[typeName] || 'normal';

  let texturePath = '';

  if (isFinalEvolution.value) {
    // ✅ LÓGICA ATUALIZADA PARA 'BGf-{num}'
    const baseFolder = 'BGFinal';
    const fileNamePrefix = 'BGf'; // O novo prefixo

    // Pega a contagem do 'textureCounts.BGFinal.all'
    const maxCount = textureCounts[baseFolder]?.all || 1;
    const randomIndex = getRandomNumber(1, maxCount);

    // 🛑 VERIFIQUE A EXTENSÃO AQUI! (.png? .jpg?)
    // Assumindo .png para ser igual ao BGNormal e seus arquivos 'BGf'
    texturePath = `/BG/${baseFolder}/${fileNamePrefix}-${randomIndex}.png`;

  } else {
    // LÓGICA BGNORMAL (Esta parte não mudou)
    const baseFolder = 'BGNormal';
    const fileNamePrefix = fileKey;

    const maxCount = textureCounts[baseFolder]?.[fileKey] || 1;
    const randomIndex = getRandomNumber(1, maxCount);

    texturePath = `/BG/${baseFolder}/${fileKey}/${fileNamePrefix}-${randomIndex}.png`;
  }

  return `url('${texturePath}')`;
});
// FIM NOVO CÓDIGO
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
      <div
          class="content-area"
          :style="{ backgroundImage: cardBackgroundStyle }"
      >
        <div class="card-header">
          <span class="name">{{ pokemon.name.toUpperCase() }}</span>
          <span class="hp">HP {{ hp }}</span>
        </div>

        <div
            class="image-container"
            :style="{ backgroundImage: pokemonBackgroundStyle }"
        >
          <img :src="imageUrl" :alt="pokemon.name" />
        </div>

        <div class="info">
          <span class="type-tag">{{ primaryType.toUpperCase() }}</span>
        </div>

        <div class="debug-evolution">
          Evolução Final: <b>{{ isFinalEvolution }}</b>
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
/* ... (Todo o seu CSS original permanece aqui) ... */

.error-card {
  width: 250px;
  aspect-ratio: 63 / 88;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align: center;
  background-color: #ffebeb;
  border: 2px solid #ff4444;
  border-radius: 12px;
  color: #ff4444;
  font-family: monospace;
  padding: 16px;
  text-align: center;
}

.pokemon-card {
  position: relative;
  aspect-ratio: 63 / 88;
  width: 250px;
  border: 4px solid #ffcc00;
  background-color: #ffcc00;
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
  background-color: transparent;
  border-radius: 8px;
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
  background-size: cover;
  background-repeat: no-repeat;
  background-color: transparent;
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
  border: 2px solid #ffcc00; /* ✅ Usei a var(--type-color) aqui */
  border-radius: 8px;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: transparent;
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

/* ✅ ESTILO PARA O DEBUG */
.debug-evolution {
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 11px;
  text-align: center;
  padding: 3px 0;
  font-family: monospace;
  margin-bottom: 6px;
  border-radius: 4px;
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

/* ... (Resto do seu CSS, incluindo .holo e .loading-card) ... */
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