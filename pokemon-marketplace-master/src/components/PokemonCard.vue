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
      },
      dream_world?: { // Adicionado '?' pois pode não existir
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
const evolutionChain = ref<any>(null);
const isFinalEvolution = ref(false);

const height = ref(0);
const weight = ref(0);
const genus = ref('');

const energySymbolMap: Record<string, string> = {
  // 🛑 Cole seus links da web aqui
  'water': 'https://i.imgur.com/uGgzRK6.png',
  'fire': 'https://i.imgur.com/6Dus51N.png',
  'grass': 'https://i.imgur.com/iyJ8Nno.png',
  'electric': 'https://i.imgur.com/fBKUHcT.png',
  'psychic': 'https://i.imgur.com/APVMNYn.png',
  'fighting': 'https://i.imgur.com/S2qyp1S.png',
  'dark': 'https://i.imgur.com/KHFx3pQ.png',
  'steel': 'https://i.imgur.com/TTjro2l.png',
  'dragon': 'https://i.imgur.com/cLVDok1.png',
  'normal': 'https://i.imgur.com/HNv9RZi.png',

  // Mapeamentos do TCG (API -> Energia)
  'poison': 'https://i.imgur.com/JBFepFN.png', // Veneno usa Psíquico
  'bug': 'https://i.imgur.com/IrWLEs7.png',     // Inseto usa Grama
  'ghost': 'https://i.imgur.com/JBFepFN.png',  // Fantasma usa Psíquico
  'ground': 'https://i.imgur.com/8gUKcVr.png', // Terra usa Lutador
  'rock': 'https://i.imgur.com/8gUKcVr.png',   // Pedra usa Lutador
  'ice': 'https://i.imgur.com/hXZrrgo.png',      // Gelo usa Água
  'fairy': 'https://sualink.com/imagem_psiquico.png',  // Fada usa Psíquico
  'flying': 'https://i.imgur.com/frwYIiG.png',  // Voador usa Incolor
  'unknown': 'https://i.imgur.com/5nNgeLM.png'
};


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
    height.value = data.height/10;
    weight.value = data.weight/10;
  } catch (e: any) {
    console.error('Erro ao carregar Pokémon:', e)
    error.value = e.message || 'Erro ao buscar dados do Pokémon.'
  } finally {
    loading.value = false
  }
}

// Busca a cadeia de evolução e checa se é o estágio final
const fetchEvolutionChain = async (speciesUrl: string) => {
  try {
    const speciesRes = await fetch(speciesUrl);
    if (!speciesRes.ok) throw new Error("Species not found.");
    const speciesData = await speciesRes.json();

    const evoChainRes = await fetch(speciesData.evolution_chain.url);
    if (!evoChainRes.ok) throw new Error("Evolution Chain not found.");
    const evoChainData = await evoChainRes.json();

    evolutionChain.value = evoChainData.chain;

    const englishGenus = speciesData.genera.find((g: any) => g.language.name === 'en');
    genus.value = englishGenus ? englishGenus.genus : 'Unknown Pokémon';

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
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${newPokemon.name}`;
    fetchEvolutionChain(speciesUrl);
  }
});


// Busca inicial ao montar
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
    pokemon.value?.sprites?.other?.dream_world?.front_default ||
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

// FUNÇÃO AUXILIAR: Gera um número aleatório
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Mapeamento de Tipo para Textura do CARD (FUNDO PRINCIPAL)
const cardTextureMap: Record<string, string> = {
  'water': 'water', 'fire': 'fogo', 'grass': 'grass', 'electric': 'eletric',
  'psychic': 'Psy', 'dark': 'dark', 'dragon': 'dragon', 'fighting': 'ground',
  'steel': 'normal', 'normal': 'normal', 'ground': 'ground', 'rock': 'ground',
  'poison': 'Psy', 'bug': 'grass', 'fairy': 'Psy', 'ghost': 'Psy', 'ice': 'water',
  'flying': 'normal', 'unknown': 'normal',
};

// Mapeamento de Tipo para Textura do POKÉMON (IMAGEM)
const pokemonTextureMap: Record<string, string> = {
  'water': 'water', 'fire': 'ground', 'grass': 'grass', 'electric': 'electric',
  'psychic': 'Psy', 'dark': 'dark', 'dragon': 'dragon', 'fighting': 'ground',
  'steel': 'ground', 'normal': 'grass', 'ground': 'ground', 'rock': 'ground',
  'poison': 'dark',
  'bug': 'grass',
  'fairy': 'Psy',
  'ghost': 'dark',
  'ice': 'water',
  'flying': 'normal',
  'unknown': 'normal',
};


// MOCK: Contagem de Arquivos por Pasta/Tipo
const textureCounts: Record<string, Record<string, number>> = {
  BGNormal: {
    water: 3, fire: 2, grass: 4, normal: 1, Psy: 2, ground: 3,
    fighting: 2, dark: 1, dragon: 1, cinza: 1, eletric: 3, fogo: 2,
  },
  BGFinal: {
    all: 6
  },
  BGCard: {
    water: 1, fire: 1, grass: 1, electric: 1, Psy: 1, normal: 1,
  }
};


// PROPRIEDADE 1: Fundo da CARTA (Simples, BGCard)
const cardBackgroundStyle = computed(() => {
  const typeName = primaryType.value;
  const fileKey = cardTextureMap[typeName] || 'normal';

  // Lembre-se de verificar a extensão do BGCard (ex: .jpg)
  const texturePath = `/BG/BGCard/${fileKey}-texture.jpg`;

  return `url('${texturePath}')`;
});


// PROPRIEDADE 2: Fundo do POKÉMON
const pokemonBackgroundStyle = computed(() => {
  const typeName = primaryType.value;
  const fileKey = pokemonTextureMap[typeName] || 'normal';

  let texturePath = '';

  if (isFinalEvolution.value) {
    // Lógica para BGFinal (ex: BGf-1.png)
    const baseFolder = 'BGFinal';
    const fileNamePrefix = 'BGf';

    const maxCount = textureCounts[baseFolder]?.all || 1;
    const randomIndex = getRandomNumber(1, maxCount);

    // Lembre-se de verificar a extensão do BGFinal (ex: .png)
    texturePath = `/BG/${baseFolder}/${fileNamePrefix}-${randomIndex}.png`;

  } else {
    // Lógica para BGNormal (ex: water-1.png)
    const baseFolder = 'BGNormal';
    const fileNamePrefix = fileKey;

    const maxCount = textureCounts[baseFolder]?.[fileKey] || 1;
    const randomIndex = getRandomNumber(1, maxCount);

    // Lembre-se de verificar a extensão do BGNormal (ex: .png)
    texturePath = `/BG/${baseFolder}/${fileKey}/${fileNamePrefix}-${randomIndex}.png`;
  }

  return `url('${texturePath}')`;
});
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

        <div class="stats-bar">
          <span><b>{{ genus }}</b>. Length: {{ height }} m, Weight: {{ weight }} kg.</span>
        </div>
        <div class="info">
          <span class="type-tag">{{ primaryType.toUpperCase() }}</span>
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
  border: 4px solid #ffd605;
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
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1px;
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
  font-size: 1.2rem;
}

.image-container {
  border: 4px solid #f3cb49;
  border-radius: 1px;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  margin: 6px 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.7); /* ✅ ADICIONE ESTA LINHA */
}

.image-container img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.stats-bar {
  /* Cor de fundo dourada (você pode ajustar) */
  background-color: #efd05b;

  /* Borda sutil para dar acabamento */
  border: 1px solid #DAA520;
  border-radius: 4px;

  /* 🛑 MUDANÇA: 'center' faz o "..." aparecer no meio */
  text-align: left;     /* Alinha à esquerda para o "..." funcionar bem */

  /* 🛑 MUDANÇA: Adicionado padding lateral para não colar na borda */
  padding: 3px 6px 15px;     /* 3px em cima/baixo, 6px nos lados */
  margin: 5px;
  font-weight: bold;

  /* Texto */
  font-size: 8px;
  color: #000000; /* Marrom escuro */
  font-family: 'Segoe UI', sans-serif;
  box-shadow: inset 0 0 3px rgba(0,0,0,0.1);

  /* ✅ ADICIONE ESTAS 3 LINHAS */
  white-space: nowrap;      /* Impede o texto de quebrar a linha */
  overflow: hidden;         /* Esconde o texto que "vazou" */
  text-overflow: ellipsis;  /* Adiciona "..." no final se o texto for cortado */
}

.stats-bar b {
  /* Deixa o "Genus" (ex: Mouse Pokémon) mais escuro/forte */
  color: #333;
  font-weight: 700;
}

.info {
  text-align: center;
  font-size: 12px;
  color: #444;
  margin-bottom: 6px;
}

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