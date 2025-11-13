<script setup lang="ts">
import { ref } from 'vue'
// REMOVIDO: onMounted e PokemonCard

// Usuário atual
const currentUser = ref({
  username: 'USERNAME',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser'
})

// Itens do menu
const menuItems = ref([
  { icon: 'home', label: 'Home', to: '/trades' },
  { icon: 'plus', label: 'Add Trade', to: '/add-trade' },
  { icon: 'heart', label: 'Favorites', to: '/wishlist' },
  { icon: 'cards', label: 'Card Test', to: '/card-test' }
])

// REMOVIDO: A lógica do randomId e onMounted
</script>

<template>
  <aside class="sidebar">
    <!-- Perfil do usuário -->
    <div class="user-profile">
      <img :src="currentUser.avatar" :alt="currentUser.username" class="avatar" />
      <span class="username">{{ currentUser.username }}</span>
    </div>

    <!-- Menu lateral -->
    <nav class="menu">
      <router-link
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="menu-item"
          active-class="active"
      >
        <span class="menu-icon">
          <!-- (Seus ícones SVG permanecem aqui) -->
          <template v-if="item.icon === 'home'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </template>
          <template v-else-if="item.icon === 'plus'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </template>
          <template v-else-if="item.icon === 'cards'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
              <polyline points="17 2 17 7 7 7 7 2"/>
            </svg>
          </template>
          <template v-else-if="item.icon === 'heart'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </template>
        </span>
      </router-link>
    </nav>

    <!-- REMOVIDO: O <div> para o card aleatório -->

  </aside>
</template>

<style scoped>
/* ESTILOS DE BASE (DESKTOP) */
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  transition: width 0.3s ease, height 0.3s ease;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.username {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: center;
}

.menu-item {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  text-decoration: none;
}

.menu-item:hover {
  border-color: #333;
  background-color: #f9f9f9;
}

.menu-item.active {
  background-color: #333;
  border-color: #333;
  color: #fff;
}

/* REMOVIDO: Estilos .random-pokemon */


/* ESTILOS RESPONSIVOS (MOBILE) */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    padding: 8px 16px;
    gap: 16px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .menu {
    flex-direction: row;
    gap: 16px;
    width: 100%;
  }

  .menu-item {
    width: 48px;
    height: 48px;
  }

  /* Esconde o perfil (e o card que não existe mais) */
  .user-profile {
    display: none;
  }
}
</style>