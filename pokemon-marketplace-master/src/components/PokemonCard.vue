<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue';

interface Props {
  id: number
  rarity?: 'normal' | 'holo'
}

const props = defineProps<Props>()
interface PokemonData {
  name: string
  sprites: {
    other: {
      'official-artwork': {
        front_default: string
      },
      dream_world?: {
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
  moves: Array<{
    move: {
      name: string;
      url: string;
    }
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    }
  }>;
}

const pokemon = ref<PokemonData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const evolutionChain = ref<any>(null);
const isFinalEvolution = ref(false);
const height = ref(0);
const weight = ref(0);
const genus = ref('');
const weaknessSymbolUrl = ref('');
const resistanceSymbolUrl = ref('');
const retreatCostCount = ref(1);

interface AttackSlot {
  name: string;
  type: string;
}
const attackOne = ref<AttackSlot | null>(null);
const attackTwo = ref<AttackSlot | null>(null);

const colorlessSymbolUrl = computed(() => energySymbolMap['normal']);

const pokemonCard = ref<HTMLElement | null>(null)
const fonteDetalhes = ref<number | null>(null);

const energySymbolMap: Record<string, string> = {
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
  'poison': 'https://i.imgur.com/JBFepFN.png',
  'bug': 'https://i.imgur.com/IrWLEs7.png',
  'ghost': 'https://i.imgur.com/JBFepFN.png',
  'ground': 'https://i.imgur.com/8gUKcVr.png',
  'rock': 'https://i.imgur.com/8gUKcVr.png',
  'ice': 'https://i.imgur.com/hXZrrgo.png',
  'fairy': 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/0726fbdd-a6a6-4871' +
      '-bed6-e8e0b9ce2af0/d6jtiuy-f4dc7bea-beb7-417b-ba85-736ae9f5c030.png?token=eyJ0eXA' +
      'iOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQ' +
      'xNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIs' +
      'Im9iaiI6W1t7InBhdGgiOiIvZi8wNzI2ZmJkZC1hNmE2LTQ4NzEtYmVkNi1lOGUwYjljZTJhZjAvZDZqd' +
      'Gl1eS1mNGRjN2JlYS1iZWI3LTQxN2ItYmE4NS03MzZhZTlmNWMwMzAucG5nIn1dXSwiYXVkIjpbInVybj' +
      'pzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.-KQR9aFKGB-XMw-8v1BIiZj2c0z6tCFCBSd1nmltnqA',
  'flying': 'https://i.imgur.com/frwYIiG.png',
  'unknown': 'https://i.imgur.com/5nNgeLM.png'
};

// FUNÇÃO DE RESCALE TEXT
function reescaleText(containerElement: HTMLElement, fator: number, nomeVariavel: string) {
  if (!containerElement) return

  const largura = containerElement.offsetWidth
  const valor = +(largura * fator).toFixed(3)

  containerElement.style.setProperty(`--${nomeVariavel}`, `${valor}px`)

  return valor;
}


function recalcularFontes() {
  if (pokemonCard.value) {
    const el = pokemonCard.value;

    // --- Medições Múltiplas ---
    reescaleText(el, 0.0133, "borda-carta");
    reescaleText(el, 0.0712, "size-symbol");
    reescaleText(el, 0.0680, "hp-texto");
    reescaleText(el, 0.01778, "hp-dist");
    reescaleText(el, 0.0533, "bordas");
    reescaleText(el, 0.03, "padding-inner");
    reescaleText(el, 0.015, "borda-imagem");
    reescaleText(el, 0.015, "margin-image");
    reescaleText(el, 0.6, "altura-image");
    reescaleText(el, 0.05, "peso-linha");
    reescaleText(el, 0.11, "padding-atk");
    reescaleText(el, 0.065, "size-symbol2");
    reescaleText(el, 0.030, "pp06");
    reescaleText(el, 0.007, "pp02");


    // --- Medição Crítica 'fonte-detalhes' (Onde a lógica do padding depende) ---
    const novaFonte = reescaleText(el, 0.03, "fonte-detalhes");

    // ATUALIZA A REF fonteDetalhes APENAS AQUI!
    fonteDetalhes.value = novaFonte;
    console.log('✅ [fonteDetalhes] Atualizado de forma estável para:', fonteDetalhes.value);

    // Como o 'fonteDetalhes' mudou, o 'paddingAjustado' será executado automaticamente.
    // Não precisamos chamá-lo diretamente, mas sua execução definirá a variável CSS
    // '--paddin-detalhes' através do 'reescaleText' dentro do computed.
  }
}

watch(pokemon, async (novoPokemon) => {
  if (novoPokemon) {
    // Garante que a primeira renderização do novo Pokémon terminou
    await nextTick();

    // Espera mais um ciclo para que o navegador recalcule o layout (essencial para largura final)
    await nextTick();

    console.log('[watch pokemon] Executando recalcularFontes() FINAL');
    recalcularFontes();
  }
}, { immediate: true });

const paddingAjustado = computed(() => {
  if (!pokemonCard.value) return 0; // Proteção

  console.log('📏 [paddingAjustado] fonteDetalhes atual:', fonteDetalhes.value);

  // A condição foi ajustada para <= 10, conforme nossa discussão
  if (fonteDetalhes.value !== null && fonteDetalhes.value <= 10) {
    console.log('📦 Fonte muito pequena → ajustando padding com fator 0.004');
    // Define o padding na variável CSS e retorna o valor (px)
    return reescaleText(pokemonCard.value, 0.014, 'paddin-detalhes');
  } else {
    console.log('📦 Fonte normal → resetando padding para 0');
    // Define o padding como 0px na variável CSS e retorna 0
    return reescaleText(pokemonCard.value, 0, 'paddin-detalhes');
  }
});

watch(paddingAjustado, (padding) => {
  if (pokemonCard.value) {
    // Isso garante que a variável CSS está definida pelo computed.
    // O reescaleText no computed já faz isso, mas podemos ser explícitos:
    pokemonCard.value.style.setProperty('--padding-detalhes', `${padding}px`);
  }
});


const fetchPokemon = async (id: number) => {
  loading.value = true
  error.value = null
  pokemon.value = null
  isFinalEvolution.value = false;
  attackOne.value = null;
  attackTwo.value = null;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    if (!res.ok) {
      throw new Error(`Pokémon com ID ${id} não encontrado.`)
    }
    const data: PokemonData = await res.json()
    pokemon.value = data
    height.value = data.height / 10;
    weight.value = data.weight / 10;

    // ✅ BUG CORRIGIDO AQUI: Lógica de atribuição estava faltando
    const uniqueEnergyUrls = [...new Set(Object.values(energySymbolMap))];
    weaknessSymbolUrl.value = uniqueEnergyUrls[getRandomNumber(0, uniqueEnergyUrls.length - 1)];
    resistanceSymbolUrl.value = uniqueEnergyUrls[getRandomNumber(0, uniqueEnergyUrls.length - 1)];
    retreatCostCount.value = getRandomNumber(1, 3);

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
    isFinalEvolution.value = false;
  }
}

// Observa 'pokemon.value' e chama a busca da evolução
watch(pokemon, (newPokemon) => {
  if (newPokemon) {
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${newPokemon.name}`;
    fetchEvolutionChain(speciesUrl);
    processAttackData(newPokemon);
  }
});

// Busca inicial ao montar
onMounted(() => {
  if (props.id) {
    fetchPokemon(props.id)
  }

  // Inicializa o resize observer
  recalcularFontes()
  window.addEventListener('resize', recalcularFontes)
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

const energySymbolUrl = computed(() => {
  return energySymbolMap[primaryType.value] || energySymbolMap['unknown'];
});

const attackOneEnergyUrl = computed(() => {
  const type = attackOne.value?.type || 'normal';
  return energySymbolMap[type] || energySymbolMap['unknown'];
});

const attackTwoEnergyUrl = computed(() => {
  const type = attackTwo.value?.type || 'normal';
  return energySymbolMap[type] || energySymbolMap['unknown'];
});

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

// FUNÇÃO ATUALIZADA (sem description)
const getMoveDetails = async (moveUrl: string): Promise<{ type: string }> => {
  try {
    const res = await fetch(moveUrl);
    if (!res.ok) throw new Error("Move not found");
    const moveData = await res.json();
    const type = moveData.type.name || 'normal';
    return { type };
  } catch (e) {
    console.error("Failed to fetch move details:", e);
    return { type: 'normal' };
  }
};

// FUNÇÃO ATUALIZADA (sem description)
const getAbilityDetails = async (): Promise<{ type: string }> => {
  const type = primaryType.value;
  return { type };
}

// FUNÇÃO ATUALIZADA (sem description)
const processAttackData = async (pokemonData: PokemonData) => {
  attackOne.value = null;
  attackTwo.value = null;

  const moves = pokemonData.moves;
  const abilities = pokemonData.abilities;

  // Lógica do Ataque 1
  if (moves.length > 0) {
    const move1 = moves[0].move;
    const details = await getMoveDetails(move1.url);
    attackOne.value = {
      name: move1.name,
      type: details.type,
    };
  } else if (abilities.length > 0) {
    const ability1 = abilities[0].ability;
    const details = await getAbilityDetails();
    attackOne.value = {
      name: ability1.name,
      type: details.type,
    };
  } else {
    attackOne.value = { name: 'Struggle', type: 'normal' };
  }

  // Lógica do Ataque 2
  if (moves.length > 1) {
    const move2 = moves[1].move;
    attackTwo.value = {
      name: move2.name,
      type: primaryType.value,
    };
  } else if (abilities.length > 0) {
    const abilityToUse = abilities[0].ability;
    attackTwo.value = {
      name: abilityToUse.name,
      type: primaryType.value,
    };
  } else {
    attackTwo.value = { name: 'Rest', type: 'normal' };
  }
};

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

  const texturePath = `/BG/BGCard/${fileKey}-texture.jpg`;

  return `url('${texturePath}')`;
});

// PROPRIEDADE 2: Fundo do POKÉMON
const pokemonBackgroundStyle = computed(() => {
  const typeName = primaryType.value;
  const fileKey = pokemonTextureMap[typeName] || 'normal';

  let texturePath = '';

  if (isFinalEvolution.value) {
    const baseFolder = 'BGFinal';
    const fileNamePrefix = 'BGf';
    const maxCount = textureCounts[baseFolder]?.all || 1;
    const randomIndex = getRandomNumber(1, maxCount);
    texturePath = `/BG/${baseFolder}/${fileNamePrefix}-${randomIndex}.png`;

  } else {
    const baseFolder = 'BGNormal';
    const fileNamePrefix = fileKey;
    const maxCount = textureCounts[baseFolder]?.[fileKey] || 1;
    const randomIndex = getRandomNumber(1, maxCount);
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
      ref="pokemonCard"
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

          <div class="header-right">
            <span class="hp">HP {{ hp }}</span>
            <img :src="energySymbolUrl" :alt="primaryType" class="energy-symbol" />
          </div>
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

        <div class="attacks" v-if="attackOne && attackTwo">

          <div class="attack-slot">
            <div class="attack-header">
              <div class="attack-cost">
                <img :src="attackOneEnergyUrl" :alt="attackOne.type" class="energy-symbol-small" />
              </div>
              <span class="attack-name-new">{{ attackOne.name }}</span>
              <span class="attack-power-new">{{ attack }}</span>
            </div>
          </div>

          <div class="attack-slot">
            <div class="attack-header">
              <div class="attack-cost">
                <img :src="attackTwoEnergyUrl" :alt="attackTwo.type" class="energy-symbol-small" />
                <img :src="attackTwoEnergyUrl" :alt="attackTwo.type" class="energy-symbol-small" />
              </div>
              <span class="attack-name-new">{{ attackTwo.name }}</span>
              <span class="attack-power-new">{{ spAttack }}</span>
            </div>
          </div>

        </div>

        <div class="card-footer">

          <div class="footer-section">
            <label>Fraqueza</label>
            <img :src="weaknessSymbolUrl" alt="Weakness" class="footer-symbol" />
          </div>

          <div class="footer-section">
            <label>Resistência</label>
            <img :src="resistanceSymbolUrl" alt="Resistance" class="footer-symbol" />
          </div>

          <div class="footer-section">
            <label>Custo de Recuo</label>
            <div class="retreat-cost-symbols">
              <img
                  v-for="n in retreatCostCount"
                  :key="n"
                  :src="colorlessSymbolUrl"
                  alt="Retreat Cost"
                  class="footer-symbol"
              />
            </div>
          </div>

        </div>
        <div class="card-description-box">
          Este card é uma representação colecionável de um Pokémon, ideal para batalhas estratégicas.
        </div>

        <div class="card-legal-info">
          <span>Ilustru: Henry.blh 2025 26 27 Nentendo,Creatures, GAMEFREAK  25/453</span>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

:root {
  --size-symbol: 0.4rem;
  --borda-carta: 6px;
  --hp-texto: 29px;
  --hp-dist: 8px;
  --bordas: 0.5rem;
  --padding-inner: 0.8rem;
  --borda-imagem: 0.4rem;
  --margin-image: 0.5rem;
  --altura-image: 13.5rem;
  --peso-linha: 1.3rem;
  --fonte-detalhes: 13px;
  --padding-detalhes: 0.1rem;
  --padding-atk: 3rem;
  --size-symbol2: 1.8rem;
  --pp06: 0.6rem;
  --pp02: 0.2rem;

}

.pokemon-card {
  position: relative;
  aspect-ratio: 63 / 88;
  border: var(--borda-carta) solid #ffd605;
  background-color: #ffcc00;
  border-radius: var(--bordas);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0.4rem 1rem rgba(0, 0, 0, 0.25);
  font-family: 'Segoe UI', sans-serif;
  transition: transform 0.2s ease;
}

.pokemon-card:hover {
  transform: translateY(-0.4rem);
}

.card-inner {
  width: 95%;
  height: 97%;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.card-header .name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--hp-texto);
  color: #000000;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--hp-dist);
}

.energy-symbol {
  width: var(--size-symbol);
  height: var(--size-symbol);
  filter: drop-shadow(0 0.1rem 0.1rem rgba(0,0,0,0.3));
}

.content-area {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: transparent;
  padding: var(--pp06) var(--padding-inner) 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.hp {
  color: #d62828;
  font-size: var(--hp-texto);
  white-space: nowrap;
}

.image-container {
  border: var(--borda-imagem) solid #f3cb49;
  border-radius: 0.1rem;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--altura-image);
  margin: var(--margin-image) 0;
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.7);
}

.image-container img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.stats-bar {
  background-color: #fbc74a;
  text-align: center;
  padding: var(--padding-detalhes);
  margin: var(--margin-image) var(--margin-image);
  font-weight: 650;
  font-size: var(--fonte-detalhes);
  color: #1b1b1b;
  font-family: 'Segoe UI', sans-serif;
  box-shadow: inset 0 0 0.3rem rgba(44, 25, 25, 0.1);
  white-space: nowrap;
  overflow: hidden;
  line-height: var(--peso-linha);
}

.stats-bar b {
  color: #1b1b1b;
  font-weight: 650;
}

.attacks {
  padding-top: var(--margin-image);
  display: flex;
  flex-direction: column;
  gap: var(--margin-image);
  flex: 1;
}

.attack-slot {
  border-top: 0.1rem solid #000000;
  padding-top: var(--margin-image);
  position: relative;
}

.attack-slot:first-child {
  border-top: none;
  padding-top: 0;
}

.attack-header {
  display: flex;
  align-items: center;
  gap: var(--padding-inner);
  justify-content: center;
  padding: 0 var(--padding-atk);
}

.attack-cost {
  display: flex;
  gap: var(--borda-imagem);
  flex-shrink: 0;
  position: absolute;
  left: var(--borda-imagem);
}

.energy-symbol-small {
  width: var(--size-symbol2);
  height: var(--size-symbol2);
}

.attack-name-new {
  font-size: var(--bordas );
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
}

.attack-power-new {
  font-size: var(--bordas );
  font-weight: bold;
  color: #333;
  flex-shrink: 0;
  position: absolute;
  right: var(--borda-imagem);
}

.card-footer {
  border-top: 0.1rem solid #000000;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  margin-top: var(--pp06)
}

.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pp02);
}

.footer-section label {
  font-size: var(--padding-inner);
  font-weight: 700;
  color: #333;
}

.footer-symbol {
  width: var(--size-symbol2);
  height: var(--size-symbol2);
}

.retreat-cost-symbols {
  display: flex;
  gap: var(--borda-imagem);
  min-height: var(--size-symbol2);
}

.card-description-box {
  background-color: transparent;
  border: 0.1rem solid #DAA520;
  padding: 0.1rem var(--pp06);
  margin-top: var(--margin-image);
  font-size: var(--fonte-detalhes);
  font-weight: 650;
  color: #333;
  text-align: center;
  line-height: 1.1;
  flex-shrink: 0;
}

.card-legal-info {
  background-color: transparent;
  padding: 0 var(--pp06) var(--pp02);
  margin-top: var(--pp02);
  font-weight: 600;
  color: #000000;
  text-align: center;
  line-height: 1;
  opacity: 0.8;
  flex-shrink: 0;
  font-size: calc(var(--fonte-detalhes) * 0.8);
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
  border-radius: 1.2rem;
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
</style>