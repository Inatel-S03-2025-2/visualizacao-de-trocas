<script setup>
import { ref } from 'vue'
// 1. Importamos o novo componente de avatar
import PokemonAvatar from '../components/PokemonAvatar.vue' // Ajuste o caminho se necessário

// Usuário atual. O 'username' será o "seed"
const currentUser = ref({
  username: 'Henry.blh'
  // REMOVIDO: a propriedade 'avatar' não é mais necessária
})

// Itens do menu (sem mudanças)
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
    <div class="user-profile">
      <PokemonAvatar
          :seed="currentUser.username"
          class="avatar"
      />
      <span class="username">{{ currentUser.username }}</span>
    </div>

    <nav class="menu">
      <router-link
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="menu-item"
          active-class="active"
      >
        <span class="menu-icon">
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
  </aside>
</template>

<style scoped>

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

/* Esta classe agora aplica-se ao componente PokemonAvatar */
.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: #f0f0f0; /* Fundo de fallback */
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

  .user-profile {
    display: none;
  }
}
</style>