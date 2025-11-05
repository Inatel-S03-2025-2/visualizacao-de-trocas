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
              @input="filterItems"
              placeholder="BUSCA Pokémons"
              class="search-input"
          />
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <button @click="sortItems('name', 'asc')" class="icon-button sort-button" aria-label="Ordenar A-Z">
          A
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 5px;">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
          Z
        </button>
      </div>
    </header>

    <div class="wishlist-container">

      <div v-if="sortedAndFilteredCards.length === 0" class="empty-list-message">
        <p>Nenhum card encontrado com o termo de busca.</p>
      </div>

      <div
          v-for="item in sortedAndFilteredCards"
          :key="item.id"
          class="wishlist-card"
          :class="{ 'is-favorited': isFavorite(item.id) }"
          @click="openModal(item)"
          title="Clique para ver os detalhes"
      >
        <button
            class="favorite-button"
            :class="{ favorited: isFavorite(item.id) }"
            @click.stop="toggleFavorite(item)"
            :aria-label="isFavorite(item.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
        >
          {{ isFavorite(item.id) ? '❤️' : '♡' }}
        </button>

        <div class="card-image-wrapper">
          <img :src="item.imageUrl" :alt="item.name" class="card-image" />
        </div>

        <div class="card-details">
          <h2 class="card-name">{{ item.name }}</h2>
          <p class="card-stats">
            Vida: {{ item.details.hp }} | Dano: {{ item.details.attack }}
          </p>
        </div>
      </div>
    </div>

    <WishlistItemModal
        v-if="isModalOpen"
        :item="selectedItem"
        @close="isModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import WishlistItemModal from './WishlistItemModal.vue';

// DADOS DE ESTADO
const pageTitle = ref("Todos os Cards"); // Título ajustado para refletir todos os cards

const isModalOpen = ref(false);
const selectedItem = ref(null);
const searchQuery = ref('');
const currentSortKey = ref('name'); // Novo: Chave de ordenação
const currentSortDirection = ref('asc'); // Novo: Direção de ordenação

// Lista de Desejos (mantida como array de objetos para fácil acesso a dados)
const wishlist = ref([]);

// Base de Dados de TODOS os Cards
const allCards = ref([
  {
    id: 10,
    name: "Pikachu",
    imageUrl: "https://images.pokemontcg.io/base1/58_hires.png",
    details: { hp: 80, attack: 55, type: 'Electric', description: 'Um rato elétrico fofo.' }
  },
  {
    id: 20,
    name: "Charmander",
    imageUrl: "https://images.pokemontcg.io/base1/46_hires.png",
    details: { hp: 70, attack: 52, type: 'Fire', description: 'Um lagarto de fogo.' }
  },
  {
    id: 30,
    name: "Squirtle",
    imageUrl: "https://images.pokemontcg.io/base1/63_hires.png",
    details: { hp: 90, attack: 48, type: 'Water', description: 'Uma tartaruga aquática.' }
  },
  {
    id: 40,
    name: "Bulbasaur",
    imageUrl: "https://images.pokemontcg.io/base1/44_hires.png",
    details: { hp: 60, attack: 49, type: 'Grass', description: 'Um réptil com uma semente nas costas.' }
  },
  {
    id: 50,
    name: "Metapod",
    // CORRIGIDO: Jigglypuff (Base Set #54) - Estava com URL incorreta.
    imageUrl: "https://images.pokemontcg.io/base1/54_hires.png",
    details: { hp: 100, attack: 5, type: 'Bug', description: 'Pokémon do tipo Inseto, em forma de casulo verde, conhecido por sua casca dura e por permanecer imóvel para se preparar para a evolução' }
  }
]);


// LÓGICA DE FAVORITOS
const isFavorite = (id) => {
  return wishlist.value.some(item => item.id === id);
};

const toggleFavorite = (card) => {
  if (isFavorite(card.id)) {
    // Remover
    wishlist.value = wishlist.value.filter(item => item.id !== card.id);
  } else {
    // Adicionar
    wishlist.value.push(card);
  }
};

// LÓGICA PRINCIPAL: FILTRAGEM + ORDENAÇÃO + DESTAQUE DE FAVORITOS
const sortedAndFilteredCards = computed(() => {
  // 1. Aplicar Busca (Filtro)
  const query = searchQuery.value.toLowerCase().trim();
  let list = allCards.value.filter(item => {
    if (!query) return true;
    return item.name.toLowerCase().includes(query) ||
        item.details.description.toLowerCase().includes(query);
  });

  // 2. Criar sub-listas de favoritos/não-favoritos
  const favorites = [];
  const nonFavorites = [];

  list.forEach(item => {
    if (isFavorite(item.id)) {
      favorites.push(item);
    } else {
      nonFavorites.push(item);
    }
  });

  // 3. Função de Ordenação (mantida, mas não está ligada ao template simplificado)
  const sortFn = (a, b) => {
    let valA = a.name.toLowerCase();
    let valB = b.name.toLowerCase();

    if (valA < valB) return currentSortDirection.value === 'asc' ? -1 : 1;
    if (valA > valB) return currentSortDirection.value === 'asc' ? 1 : -1;
    return 0;
  };

  favorites.sort(sortFn);
  nonFavorites.sort(sortFn);

  // 4. Juntar: Favoritos (topo) + Não-Favoritos
  return [...favorites, ...nonFavorites];
});


// FUNÇÕES
const openModal = (item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
};

const filterItems = () => {
  // Reatividade garantida pelo computed
};

const sortItems = (key, direction) => {
  // A lógica foi mantida caso você queira reintroduzir o botão de ordenação.
  currentSortKey.value = key;
  currentSortDirection.value = currentSortDirection.value === 'asc' ? 'desc' : 'asc';
};
</script>

<style scoped>
/* ESTILOS DE LAYOUT, BUSCA E CARDS */
.wishlist-page { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: sans-serif; }

.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
}

.page-title {
  flex-grow: 1;
  text-align: center;
  color: #333;
  font-size: 2em;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
  min-width: 250px;
  justify-content: flex-end;
  align-items: center;
}

/* Estilos de Busca/Botões */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
}

.search-input {
  padding: 8px 12px 8px 35px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9em;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #999;
}

.icon-button {
  background: none;
  border: 1px solid #ccc;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9em;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
}

.icon-button:hover {
  background-color: #f0f0f0;
}

.icon-button svg {
  margin-right: 5px;
}

.back-button {
  margin-right: auto;
  margin-left: 0;
}

.sort-button {
  gap: 5px;
}

.sort-button svg {
  margin-right: 0;
}

/* ESTILOS DOS CARDS (Visualização da Main) */
.wishlist-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.empty-list-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: #999;
}
.wishlist-card {
  position: relative;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  text-align: center;
  padding-bottom: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
/* Destaque visual para cards favoritados */
.wishlist-card.is-favorited {
  border: 2px solid #ff69b4; /* Borda rosa para destaque */
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
}

.wishlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.favorite-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  color: #ff69b4;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  line-height: 1;
  font-size: 1.5em;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 10;
}

.favorite-button.favorited {
  background-color: #ff69b4;
  color: white;
  border-color: #ff69b4;
}

.card-image-wrapper {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.card-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-details {
  padding: 0 10px;
}

.card-name {
  margin: 10px 0 5px 0;
  font-size: 1.1em;
  color: #333;
}

.card-stats {
  margin: 0;
  font-size: 0.9em;
  color: #555;
  font-weight: 500;
}
</style>