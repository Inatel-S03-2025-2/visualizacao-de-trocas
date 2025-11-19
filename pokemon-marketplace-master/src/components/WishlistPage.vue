<template>
  <div class="wishlist-page">

    <header class="wishlist-header">
      <router-link to="/" class="icon-button back-button" aria-label="Voltar à Home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </router-link>

      <h1 class="page-title">{{ pageTitle }}</h1>

      <div class="header-actions">
        <div class="search-container">
          <input
              type="text"
              v-model="searchQuery"
              placeholder="BUSCA Pokémons"
              class="search-input"
          />
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <button @click="sortItems('id')" class="icon-button sort-button" aria-label="Ordenar por ID">
          ID
          <span v-if="currentSortKey === 'id'" class="sort-indicator">{{ currentSortDirection === 'asc' ? '↑' : '↓' }}</span>
        </button>
        <button @click="sortItems('name')" class="icon-button sort-button" aria-label="Ordenar por Nome">
          A-Z
          <span v-if="currentSortKey === 'name'" class="sort-indicator">{{ currentSortDirection === 'asc' ? '↑' : '↓' }}</span>
        </button>
      </div>
    </header>

    <section class="favorites-section">
      <h2 class="section-subtitle">Meus Favoritos <span class="count-badge">{{ wishlist.length }}</span></h2>

      <div v-if="wishlist.length > 0" class="favorites-scroll-container">
        <div
            v-for="item in wishlist"
            :key="'fav-' + item.id"
            class="card-wrapper small is-favorited"
            @click="openModal(item.pokeId, item.rarity)"
            title="Clique para ver os detalhes"
        >
          <button
              class="favorite-button favorited"
              @click.stop="toggleFavorite(item)"
          >
            ❤️
          </button>

          <PokemonCard :id="item.pokeId" :rarity="item.rarity" />

          <div class="card-details-overlay">
            <h3 class="card-name-overlay">
              <span class="id-badge">#{{ item.pokeId }}</span> {{ item.name }}
            </h3>
          </div>
        </div>
      </div>

      <div v-else class="no-favorites-message">
        <p>Você ainda não possui nenhuma carta favoritada.</p>
      </div>
    </section>

    <h2 class="section-subtitle main-list-title">Todos os Pokémons</h2>
    <div class="card-display-area">

      <div v-if="sortedAndFilteredCards.length === 0" class="empty-list-message">
        <p>Nenhum card encontrado com o termo de busca.</p>
      </div>

      <div
          v-for="item in paginatedCards"
          :key="item.id"
          class="card-wrapper small"
          :class="{ 'is-favorited': isFavorite(item.id) }"

          @click="openModal(item.pokeId, item.rarity)"
          title="Clique para ver os detalhes"
      >
        <button
            class="favorite-button"
            :class="{ favorited: isFavorite(item.id) }"
            @click.stop="toggleFavorite(item)"
        >
          {{ isFavorite(item.id) ? '❤️' : '♡' }}
        </button>

        <PokemonCard :id="item.pokeId" :rarity="item.rarity" />

        <div class="card-details-overlay">
          <h3 class="card-name-overlay">
            <span class="id-badge">#{{ item.pokeId }}</span> {{ item.name }}
          </h3>
        </div>
      </div>
    </div>

    <div v-if="sortedAndFilteredCards.length > itemsPerPage" class="pagination-controls">
      <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="pagination-button"
      >
        Anterior
      </button>

      <span class="page-info">
        Página {{ currentPage }} de {{ totalPages }}
      </span>

      <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="pagination-button"
      >
        Próxima
      </button>
    </div>

    <PokemonDetailModal
        v-if="isModalOpen && selectedPokemonId !== null"
        :id="selectedPokemonId"
        :rarity="selectedPokemonRarity"
        @close="isModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import PokemonDetailModal from './PokemonDetailModal.vue';
import PokemonCard from './PokemonCard.vue';

// DADOS DE ESTADO
const pageTitle = ref("Wishlist");

const isModalOpen = ref(false);
const selectedPokemonId = ref(null);
const selectedPokemonRarity = ref(null);

const searchQuery = ref('');
const currentSortKey = ref('id');
const currentSortDirection = ref('asc');

// --- PAGINAÇÃO ---
const currentPage = ref(1);
const itemsPerPage = 12;

const wishlist = ref([]);

// --- MOCK DATA (151 POKÉMONS) ---
const POKEMON_NAMES_MOCK = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
  "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata",
  "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu",
  "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina", "Nidoqueen", "Nidoran♂",
  "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales",
  "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume",
  "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio", "Meowth",
  "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine",
  "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop",
  "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool",
  "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke",
  "Slowbro", "Magnemite", "Magneton", "Farfetch'd", "Doduo", "Dodrio", "Seel",
  "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter",
  "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb",
  "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee",
  "Hitmonchan", "Lickitung", "Koffing", "Weezing", "Rhyhorn", "Rhydon",
  "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking",
  "Staryu", "Starmie", "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar",
  "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee",
  "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto",
  "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres",
  "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"
];

const allCards = ref(POKEMON_NAMES_MOCK.map((name, index) => {
  const pokeId = index + 1;
  return {
    id: pokeId,
    pokeId: pokeId,
    name: name,
    rarity: "common",
    details: {
      hp: (80 + index),
      attack: (50 + index),
      type: 'Normal',
      description: `Um Pokémon chamado ${name}.`
    }
  };
}));

// --- FUNÇÕES DE PAGINAÇÃO ---
const totalPages = computed(() => {
  return Math.ceil(sortedAndFilteredCards.value.length / itemsPerPage);
});

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedAndFilteredCards.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

watch(searchQuery, () => {
  currentPage.value = 1;
});

// --- LÓGICA DE FAVORITOS ---
const isFavorite = (id) => {
  return wishlist.value.some(item => item.id === id);
};

const toggleFavorite = (card) => {
  if (isFavorite(card.id)) {
    wishlist.value = wishlist.value.filter(item => item.id !== card.id);
  } else {
    wishlist.value.push(card);
  }
};

// --- FILTRO E ORDENAÇÃO ---
const sortedAndFilteredCards = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  let list = allCards.value.filter(item => {
    if (!query) return true;
    return item.name.toLowerCase().includes(query) ||
        String(item.pokeId).includes(query);
  });

  const sortFn = (a, b) => {
    const key = currentSortKey.value;
    const direction = currentSortDirection.value === 'asc' ? 1 : -1;

    if (key === 'id') {
      return (a.pokeId - b.pokeId) * direction;
    }
    else if (key === 'name') {
      let valA = a.name.toLowerCase();
      let valB = b.name.toLowerCase();
      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    }
    return 0;
  };

  return list.sort(sortFn);
});

const openModal = (id, rarity) => {
  selectedPokemonId.value = id;
  selectedPokemonRarity.value = rarity;
  isModalOpen.value = true;
};

const filterItems = () => {};

const sortItems = (key) => {
  if (currentSortKey.value === key) {
    currentSortDirection.value = currentSortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortKey.value = key;
    currentSortDirection.value = 'asc';
  }
};
</script>

<style scoped>
/* ESTILOS GERAIS */
.wishlist-page { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: sans-serif; }

.wishlist-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 15px;
}

.page-title {
  flex-grow: 1; text-align: left; color: #333; font-size: 2em;
  margin: 0 20px 0 20px;
}

.header-actions { display: flex; gap: 15px; flex-grow: 1; justify-content: flex-end; align-items: center; }

.search-container { position: relative; display: flex; align-items: center; min-width: 400px; }
.search-input { padding: 8px 12px 8px 35px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9em; width: 100%; }
.search-icon { position: absolute; left: 10px; color: #999; }

.icon-button {
  background: none; border: 1px solid #ccc; padding: 8px 12px; border-radius: 4px;
  cursor: pointer; display: flex; align-items: center; font-size: 0.9em;
  text-decoration: none; color: #333; transition: background-color 0.2s;
}
.icon-button:hover { background-color: #f0f0f0; }
.icon-button svg { margin-right: 5px; }
.back-button { margin-right: auto; margin-left: 0; }
.sort-button { gap: 5px; }
.sort-indicator { margin-left: 5px; font-weight: bold; color: #007bff; }

/* ✅ ESTILOS DA SEÇÃO DE FAVORITOS */
.favorites-section {
  background-color: #fdf2f8;
  border: 1px solid #fce7f3;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 40px;
  min-height: 100px;
}

.section-subtitle {
  font-size: 1.5em;
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-badge {
  background-color: #ff69b4;
  color: white;
  font-size: 0.6em;
  padding: 2px 8px;
  border-radius: 12px;
  vertical-align: middle;
}

/* Container de rolagem horizontal */
.favorites-scroll-container {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 15px; /* Espaço para scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #ff69b4 #fdf2f8;
}

.favorites-scroll-container::-webkit-scrollbar { height: 8px; }
.favorites-scroll-container::-webkit-scrollbar-thumb { background-color: #ff69b4; border-radius: 4px; }

/* ✅ CORREÇÃO DO TAMANHO DOS CARDS NOS FAVORITOS */
.favorites-scroll-container .card-wrapper {
  /* Força o card a ter 150px e não esticar nem encolher */
  width: 150px !important;
  min-width: 150px !important;
  flex: 0 0 150px; /* Impede o flexbox de alterar o tamanho */
}

.no-favorites-message {
  text-align: center; color: #888; font-style: italic;
  padding: 30px; border: 1px dashed #e0e0e0; border-radius: 8px; background-color: white;
}

.main-list-title {
  margin-bottom: 20px; padding-left: 5px; border-left: 5px solid #333; line-height: 1;
}

/* GRID DA LISTA PRINCIPAL */
.card-display-area {
  display: grid;
  /* Tamanho pequeno (150px) para a lista principal */
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

/* ESTILOS DO CARD (Padrão Small) */
.card-wrapper {
  position: relative; background: #fff; border-radius: 8px; border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05); display: flex; flex-direction: column;
  gap: 5px; cursor: pointer; padding: 5px;
  perspective: 1000px; transition: transform 0.2s, box-shadow 0.2s;
  width: 100%; height: auto;
}

.card-wrapper :deep(.pokemon-card) {
  width: 100% !important; height: auto !important; max-width: 100%;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  transform-style: preserve-3d;
}

.card-wrapper:hover :deep(.pokemon-card) {
  transform: translateY(-0.3rem) scale(1.05);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.25);
  z-index: 10;
}

.card-wrapper.is-favorited {
  border: 2px solid #ff69b4;
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
}

.favorite-button {
  position: absolute; top: 5px; right: 5px; z-index: 30;
  width: 25px; height: 25px; font-size: 1.2em;
  background: rgba(255, 255, 255, 0.8); border: 1px solid #ccc;
  color: #ff69b4; border-radius: 50%; cursor: pointer;
  transition: background-color 0.2s;
}
.favorite-button.favorited { background-color: #ff69b4; color: white; border-color: #ff69b4; }

.card-details-overlay { text-align: center; padding: 5px 0 0; border-top: 1px solid #eee; }
.card-name-overlay { margin: 3px 0; font-size: 0.9em; color: #333; }
.id-badge { color: #888; font-size: 0.8em; margin-right: 3px; }
.empty-list-message { grid-column: 1 / -1; text-align: center; padding: 50px; color: #999; }

/* ESTILOS DE PAGINAÇÃO */
.pagination-controls {
  display: flex; justify-content: center; align-items: center;
  gap: 20px; margin-top: 40px; padding: 20px 0; border-top: 1px solid #eee;
}
.pagination-button {
  padding: 8px 16px; background-color: #333; color: white; border: none;
  border-radius: 4px; cursor: pointer; transition: opacity 0.2s;
}
.pagination-button:disabled { background-color: #ccc; cursor: not-allowed; }
.pagination-button:hover:not(:disabled) { background-color: #555; }
.page-info { font-weight: bold; color: #555; }
</style>