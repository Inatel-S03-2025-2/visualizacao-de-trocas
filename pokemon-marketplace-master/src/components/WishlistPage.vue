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
              placeholder="Busca Pokémons"
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

    <h2 ref="mainListTitle" class="section-subtitle main-list-title">Todos os Pokémons</h2>

    <div v-if="allCards.length === 0" class="empty-list-message">
      <p>Carregando Pokémons...</p>
    </div>

    <div v-else class="card-display-area">

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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import PokemonDetailModal from './PokemonDetailModal.vue';
import PokemonCard from './PokemonCard.vue';
import { pokemonNameMap } from '../data/pokemonNameMap';

// DADOS DE ESTADO
const pageTitle = ref("Wishlist");

// Referência para o título da lista
const mainListTitle = ref(null);

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
const allCards = ref([]);

onMounted(() => {
  if (pokemonNameMap) {
    const cardsArray = Object.entries(pokemonNameMap).map(([idStr, name]) => {
      const id = Number(idStr);
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

      return {
        id: id,
        pokeId: id,
        name: formattedName,
        rarity: "common",
        details: {
          hp: (50 + (id % 100)),
          attack: (40 + (id % 80)),
          type: 'Normal',
          description: `Um Pokémon chamado ${formattedName}.`
        }
      };
    });

    allCards.value = cardsArray.sort((a, b) => a.id - b.id);
  } else {
    console.error("Erro: pokemonNameMap não carregou.");
  }
});

// --- FUNÇÕES DE PAGINAÇÃO ---
const totalPages = computed(() => {
  return Math.ceil(sortedAndFilteredCards.value.length / itemsPerPage);
});

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedAndFilteredCards.value.slice(start, end);
});

// --- FUNÇÃO AUXILIAR DE SCROLL CORRIGIDA ---
const scrollToTopList = () => {
  nextTick(() => {
    if (mainListTitle.value) {
      // SOLUÇÃO MAIS ROBUSTA:
      // Em vez de 'scrollIntoView' (que pode falhar se o elemento já estiver visível),
      // calculamos a posição exata e mandamos a janela rolar para lá.

      // 1. Pega a posição do título em relação ao topo da janela atual
      const rect = mainListTitle.value.getBoundingClientRect();
      // 2. Soma com o quanto a janela já rolou (scrollY)
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      // 3. Subtrai um pouco (20px) para dar um respiro visual
      const finalPosition = rect.top + scrollTop - 20;

      window.scrollTo({
        top: finalPosition,
        behavior: 'smooth'
      });
    }
  });
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToTopList();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToTopList();
  }
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

// FUNÇÕES DE AÇÃO
const openModal = (id, rarity) => {
  selectedPokemonId.value = id;
  selectedPokemonRarity.value = rarity;
  isModalOpen.value = true;
};

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  gap: 20px; /* Adiciona um espaço garantido entre o título e a busca */
}

.page-title {
  /* Removemos o flex-grow do título para ele não empurrar a busca */
  text-align: left;
  color: #333;
  font-size: 2em;
  margin: 0;
  white-space: nowrap; /* Garante que o título não quebre linha */
}

.header-actions {
  display: flex;
  gap: 15px;
  flex-grow: 1; /* Isso faz essa área ocupar todo o espaço vazio no meio */
  justify-content: center; /* Centraliza a barra e os botões nesse espaço */
  align-items: center;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;       /* Tenta ocupar 100% do espaço disponível */
  max-width: 600px;  /* Mas para em 600px para não ficar exagerado */
}

.search-input {
  /* Aumentei o padding vertical (12px) para ficar mais alta */
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 50px; /* Borda bem redonda (estilo pílula) */
  font-size: 1em;
  width: 100%;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.search-input:focus {
  background-color: #fff;
  border-color: #ff69b4; /* Cor do destaque ao clicar */
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.15);
  outline: none;
}

/* Ícone da Lupa */
.search-icon {
  position: absolute;
  left: 15px; /* Ajustado para o novo padding */
  color: #aaa;
  pointer-events: none; /* Para o clique passar direto para o input */
}

.icon-button {
  background: none; border: 1px solid #ccc; padding: 8px 12px; border-radius: 4px;
  cursor: pointer; display: flex; align-items: center; font-size: 0.9em;
  text-decoration: none; color: #333; transition: background-color 0.2s;
}
.icon-button:hover { background-color: #f0f0f0; }
.icon-button svg { margin-right: 5px; }
.back-button { margin-right: auto; margin-left: 0; }
.sort-button {
  /* Opcional: Se quiser que os botões fiquem com altura igual à barra */
  padding: 10px 16px;
  height: 44px; /* Ajuste fino para alinhar com a nova altura da busca */
  display: flex;
  align-items: center;
  justify-content: center;
}
.sort-indicator { margin-left: 5px; font-weight: bold; color: #007bff; }

/* SEÇÃO DE FAVORITOS */
.favorites-section {
  background-color: #fdf2f8;
  border: 1px solid #fce7f3;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 40px;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  transition: min-height 0.3s ease;
}

.section-subtitle {
  font-size: 1.5em;
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  scroll-margin-top: 20px;
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
  padding-bottom: 15px;
  scrollbar-width: thin;
  scrollbar-color: #ff69b4 #fdf2f8;
  flex-grow: 1;
  align-items: flex-start;
}

.favorites-scroll-container::-webkit-scrollbar { height: 8px; }
.favorites-scroll-container::-webkit-scrollbar-thumb { background-color: #ff69b4; border-radius: 4px; }

.favorites-scroll-container .card-wrapper {
  width: 150px !important;
  min-width: 150px !important;
  flex: 0 0 150px;
}

.no-favorites-message {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  text-align: center; color: #888; font-style: italic;
  border: 1px dashed #e0e0e0; border-radius: 8px; background-color: white;
  height: 100%;
}

.main-list-title {
  margin-bottom: 20px; padding-left: 5px; border-left: 5px solid #333; line-height: 1;
}

/* GRID DA LISTA PRINCIPAL */
.card-display-area {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

/* ESTILOS DO CARD */
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

/* PAGINAÇÃO */
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