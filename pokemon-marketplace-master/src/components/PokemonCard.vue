<script setup lang="ts">
// ✅ 1. Importe o novo mapa de XP
import { ref, computed, watch, onMounted, nextTick, onUnmounted, inject, defineEmits} from 'vue';
import { pokemonBaseXpMap } from '../data/pokemonBaseXpMap';

interface Props {
  id: number
  rarity?: 'normal' | 'holo'
}

const props = defineProps<Props>()

interface PokemonData {
  id: number; // ✅ Adicionado 'id'
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
      name: string;
      url: string;
    },
    slot: number;
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
  species: { url: string }; // ✅ Adicionado 'species'
}

const emit = defineEmits(['click']);

const modalControls = inject('modal-controls') as {
  openModal: (data: { id: number, rarity?: 'normal' | 'holo' }) => void
} | undefined;

const pokemon = ref<PokemonData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// --- Lógica de Clique e Long Press (Sem mudanças) ---
const longPressTimer = ref<NodeJS.Timeout | null>(null);
const LONG_PRESS_DURATION = 700;
const isLongPress = ref(false);

function handlePressDown() {
  isLongPress.value = false;
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
  }
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true;
    if (modalControls && typeof modalControls.openModal === 'function') {
      modalControls.openModal({
        id: props.id,
        rarity: props.rarity
      });
    } else {
      console.warn("Controle do modal ('modal-controls') não foi 'provided' pelo App.vue!");
    }
    longPressTimer.value = null;
  }, LONG_PRESS_DURATION);
}
function handlePressRelease() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
  if (!isLongPress.value && pokemon.value) {
    emit('click', {
      id: props.id,
      name: pokemon.value.name
    });
  }
  isLongPress.value = false;
}
function handlePressCancel() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
  isLongPress.value = false;
}
// --- Fim da Lógica de Interação ---

// 🛑 2. Ref 'evolutionChain' removida
const isFinalEvolution = ref(false); // Esta ref agora é controlada pelo XP
const height = ref(0);
const weight = ref(0);
const genus = ref('');
const weaknessSymbolUrl = ref('');
const resistanceSymbolUrl = ref('');
const retreatCostCount = ref(1);

// ... (AttackSlot, colorlessSymbolUrl, etc. sem mudanças) ...
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
  'fairy': 'https://archives.bulbagarden.net/media/upload/thumb/4/40/Fairy-attack.png/70px-Fairy-attack.png',
  'flying': 'https://i.imgur.com/frwYIiG.png',
  'unknown': 'https://i.imgur.com/5nNgeLM.png'
};

// --- Lógica de Fonte Responsiva (Sem mudanças) ---
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
    const novaFonte = reescaleText(el, 0.03, "fonte-detalhes");
    fonteDetalhes.value = novaFonte;
  }
}
watch(pokemon, async (novoPokemon) => {
  if (novoPokemon) {
    await nextTick();
    await nextTick();
    recalcularFontes();
  }
}, { immediate: true });
const paddingAjustado = computed(() => {
  if (!pokemonCard.value) return 0;
  if (fonteDetalhes.value !== null && fonteDetalhes.value <= 9) {
    return reescaleText(pokemonCard.value, 0.014, 'paddin-detalhes');
  } else {
    return reescaleText(pokemonCard.value, 0, 'paddin-detalhes');
  }
});
watch(paddingAjustado, (padding) => {
  if (pokemonCard.value) {
    pokemonCard.value.style.setProperty('--padding-detalhes', `${padding}px`);
  }
});
// --- Fim da Lógica de Fonte ---


// --- Lógica de Fetch (Sem mudanças) ---
const fetchPokemon = async (id: number) => {
  loading.value = true
  error.value = null
  pokemon.value = null
  isFinalEvolution.value = false;
  attackOne.value = null;
  attackTwo.value = null;
  weaknessSymbolUrl.value = '';
  resistanceSymbolUrl.value = '';

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    if (!res.ok) {
      throw new Error(`Pokémon com ID ${id} não encontrado.`)
    }
    // A interface PokemonData agora espera 'id' e 'species'
    const data: PokemonData = await res.json()
    pokemon.value = data
    height.value = data.height / 10;
    weight.value = data.weight / 10;
    retreatCostCount.value = getRandomNumber(1, 3);
  } catch (e: any) {
    console.error('Erro ao carregar Pokémon:', e)
    error.value = e.message || 'Erro ao buscar dados do Pokémon.'
  } finally {
    loading.value = false
  }
}

const fetchDamageRelations = async (pokemonData: PokemonData) => {
  const fallbackSymbol = energySymbolMap['normal'];
  weaknessSymbolUrl.value = fallbackSymbol;
  resistanceSymbolUrl.value = fallbackSymbol;
  try {
    const primaryType = pokemonData.types.find(t => t.slot === 1) || pokemonData.types[0];
    if (!primaryType) return;
    const typeRes = await fetch(primaryType.type.url);
    if (!typeRes.ok) throw new Error("Type details not found.");
    const typeData = await typeRes.json();
    const relations = typeData.damage_relations;
    const weaknessType = relations.double_damage_from[0]?.name || null;
    const resistanceType = relations.half_damage_from[0]?.name || relations.no_damage_from[0]?.name || null;
    weaknessSymbolUrl.value = weaknessType ? energySymbolMap[weaknessType] : fallbackSymbol;
    resistanceSymbolUrl.value = resistanceType ? energySymbolMap[resistanceType] : fallbackSymbol;
  } catch (e: any) {
    console.error('Erro ao buscar relações de dano:', e);
  }
};

// 🛑 3. Função 'fetchEvolutionChain' REMOVIDA

// ✅ 4. Nova função para buscar dados secundários (Genus) e checar XP
async function fetchSecondaryData(pokemonData: PokemonData) {
  // 1. Busca o Genus (como antes)
  try {
    const speciesRes = await fetch(pokemonData.species.url);
    if (!speciesRes.ok) throw new Error("Species not found.");
    const speciesData = await speciesRes.json();
    const englishGenus = speciesData.genera.find((g: any) => g.language.name === 'en');
    genus.value = englishGenus ? englishGenus.genus : 'Unknown Pokémon';
  } catch (e) {
    console.error('Erro ao buscar genus:', e);
    genus.value = 'Unknown Pokémon';
  }

  // 2. Checa o XP (NOVA LÓGICA)
  try {
    // Busca o XP do nosso mapa local (síncrono, rápido!)
    const baseXP = pokemonBaseXpMap[pokemonData.id];

    if (baseXP && baseXP > 210) {
      isFinalEvolution.value = true;
    } else {
      isFinalEvolution.value = false;
    }
  } catch (e) {
    console.error('Erro ao checar BaseXP do mapa:', e);
    isFinalEvolution.value = false; // Garante um fallback
  }
}

// ✅ 5. Watcher de 'pokemon' ATUALIZADO
watch(pokemon, (newPokemon) => {
  if (newPokemon) {
    // Chama a nova função de dados secundários
    fetchSecondaryData(newPokemon);

    // Funções existentes
    processAttackData(newPokemon);
    fetchDamageRelations(newPokemon);
  }
});

// --- Hooks de Ciclo de Vida (Sem mudanças) ---
onMounted(() => {
  recalcularFontes()
  window.addEventListener('resize', recalcularFontes)
})

onUnmounted(() => {
  window.removeEventListener('resize', recalcularFontes)
})

watch(() => props.id, (newId) => {
  if (newId) {
    fetchPokemon(newId);
  }
}, {
  immediate: true
});

const hpColor = computed(() => {
  return primaryType.value === 'fire' ? '#000000' : '#d62828'; // Preto para Fogo, Vermelho para os outros
})

// --- Lógica de Ataques (Sem mudanças) ---
const typeColors: Record<string, string> = {
  electric: '#FFD700', fire: '#FF4500', water: '#1E90FF',
  grass: '#32CD32', psychic: '#C71585', normal: '#D3D3D3',
  ground: '#DEB887', bug: '#9ACD32', fairy: '#EE82EE',
  ice: '#00BFFF', rock: '#B8860B', ghost: '#6A5ACD',
  dragon: '#7038F8', dark: '#705848', poison: '#A040A0',
  fighting: '#C03028', steel: '#B8B8D0',
}
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
const getStat = (name: 'hp' | 'attack' | 'special-attack'): number => {
  const stat = pokemon.value?.stats.find(s => s.stat.name === name)
  return stat?.base_stat ?? 0
}
const hp = computed(() => getStat('hp'))
const attack = computed(() => getStat('attack'))
const spAttack = computed(() => getStat('special-attack'))
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
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
const getAbilityDetails = async (): Promise<{ type: string }> => {
  const type = primaryType.value;
  return { type };
}
const processAttackData = async (pokemonData: PokemonData) => {
  attackOne.value = null;
  attackTwo.value = null;
  const moves = pokemonData.moves;
  const abilities = pokemonData.abilities;
  if (moves.length > 0) {
    const move1 = moves[0].move;
    const details = await getMoveDetails(move1.url);
    attackOne.value = { name: move1.name, type: details.type, };
  } else if (abilities.length > 0) {
    const ability1 = abilities[0].ability;
    const details = await getAbilityDetails();
    attackOne.value = { name: ability1.name, type: details.type, };
  } else {
    attackOne.value = { name: 'Struggle', type: 'normal' };
  }
  if (moves.length > 1) {
    const move2 = moves[1].move;
    attackTwo.value = { name: move2.name, type: primaryType.value, };
  } else if (abilities.length > 0) {
    const abilityToUse = abilities[0].ability;
    attackTwo.value = { name: abilityToUse.name, type: primaryType.value, };
  } else {
    attackTwo.value = { name: 'Rest', type: 'normal' };
  }
};

// --- Lógica de Textura (Backgrounds) ---
// (Esta parte não muda, pois ela JÁ LÊ o 'isFinalEvolution.value')
const cardTextureMap: Record<string, string> = {
  'water': 'water', 'fire': 'fogo', 'grass': 'grass', 'electric': 'eletric',
  'psychic': 'Psy', 'dark': 'dark', 'dragon': 'dragon', 'fighting': 'ground',
  'steel': 'normal', 'normal': 'normal', 'ground': 'ground', 'rock': 'ground',
  'poison': 'Psy', 'bug': 'grass', 'fairy': 'Psy', 'ghost': 'Psy', 'ice': 'water',
  'flying': 'normal', 'unknown': 'normal',
};

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
  BGCard: {
    water: 1, fire: 1, grass: 1, electric: 1, Psy: 1, normal: 1,
  }
};

const cardBackgroundStyle = computed(() => {
  const typeName = primaryType.value;
  const fileKey = cardTextureMap[typeName] || 'normal';
  const texturePath = `/BG/BGCard/${fileKey}-texture.jpg`;
  return `url('${texturePath}')`;
});

// Esta computed property agora usa a nova lógica de 'isFinalEvolution'
const pokemonBackgroundStyle = computed(() => {
  const typeName = primaryType.value;
  const fileKey = pokemonTextureMap[typeName] || 'normal';
  let texturePath = '';

  // A lógica de XP (base > 210) define 'isFinalEvolution.value'
  // Esta computed property lê 'isFinalEvolution.value' e funciona automaticamente.
  const maxCount = isFinalEvolution.value
      ? textureCounts.BGFinal.all
      : (textureCounts.BGNormal[fileKey] || 1);

  const randomIndex = (props.id % maxCount) + 1;

  if (isFinalEvolution.value) {
    const baseFolder = 'BGFinal';
    const fileNamePrefix = 'BGf';
    texturePath = `/BG/${baseFolder}/${fileNamePrefix}-${randomIndex}.png`;
  } else {
    const baseFolder = 'BGNormal';
    const fileNamePrefix = fileKey;
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
      :class="{
        holo: props.rarity === 'holo',
        'is-dark-type': primaryType === 'dark'
      }"
      :style="{
      '--type-color': bgColor,
      '--hp-color': hpColor
    }"

      @mousedown="handlePressDown"
      @mouseup="handlePressRelease"
      @mouseleave="handlePressCancel"
      @touchstart.prevent="handlePressDown"
      @touchend="handlePressRelease"
      @touchcancel="handlePressCancel"
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
          This is a Collectible Pokémon Tradding Card from the: "Generations" Box-Set of Tradding Cards.
        </div>

        <div class="card-legal-info">
          <span>Ilustru: Henry.blh 2025 26 27 Nintendo, Creatures in., GAMEFREAK 25/453</span>
        </div>

        <div class="holo-overlay"></div>

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
  box-shadow: 0 0.4rem 1rem rgba(0, 0, 0, 0.4);
  font-family: 'Segoe UI', sans-serif;
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
  position: relative;
  overflow: hidden;
}

.hp {
  color: var(--hp-color);
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
  padding:  0 var(--padding-detalhes) 0;
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
  font-weight: 700;
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

.holo-overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/Holoyoverlay.png');
  background-size: cover;
  pointer-events: none;
  background-repeat: repeat;
}

.pokemon-card.holo .holo-overlay {
  display: block;
  opacity: 0.5;
  animation: holo-shift 10s linear infinite alternate;
}

@keyframes holo-shift {
  100% { background-position: 100% 100%; }
}

.pokemon-card.is-dark-type .card-header .name,
.pokemon-card.is-dark-type .attack-name-new,
.pokemon-card.is-dark-type .attack-power-new,
.pokemon-card.is-dark-type .footer-section label,
.pokemon-card.is-dark-type .card-description-box,
.pokemon-card.is-dark-type .card-legal-info {
  color: #FFFFFF;
}
</style>