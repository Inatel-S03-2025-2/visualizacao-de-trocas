<script setup>
import { ref } from 'vue'
import PokemonAvatar from '../components/PokemonAvatar.vue'

const currentUser = ref({
  username: 'Henry.blh'
})

// MENU ATUALIZADO: Apenas 3 itens
const menuItems = ref([
  { icon: 'home', label: 'Home', to: '/trades' },
  { icon: 'swap', label: 'Minhas Trocas', to: '/mytrades' }, // 2º lugar agora é Minhas Trocas
  { icon: 'heart', label: 'Favorites', to: '/wishlist' }
])
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

          <template v-else-if="item.icon === 'swap'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"/>
              <line x1="3" y1="5" x2="21" y2="5"/>
              <polyline points="7 15 3 19 7 23"/>
              <line x1="3" y1="19" x2="21" y2="19"/>
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
  /* ALTERADO: Aumentei o gap para separar o perfil do menu */
  gap: 50px;
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
  /* ALTERADO: Aumentei muito o espaço entre os botões (de 24px para 50px) */
  gap: 50px;
  align-items: center;
  justify-content: center;
  width: 100%; /* Garante alinhamento central */
}

.menu-item {
  /* ALTERADO: Botões bem maiores (de 80px para 105px) */
  width: 95px;
  height: 95px;

  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #e0e0e0;

  /* ALTERADO: Arredondamento maior para acompanhar o tamanho */
  border-radius: 28px;

  cursor: pointer;
  /* ALTERADO: Animação mais fluida */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: #666;
  text-decoration: none;

  /* ADICIONADO: Sombra leve */
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.menu-item:hover {
  border-color: #333;
  background-color: #f9f9f9;
  /* ADICIONADO: Efeito de levitação */
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.menu-item.active {
  background-color: #333;
  border-color: #333;
  color: #fff;
  /* ADICIONADO: Leve escala no ativo */
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

/* ADICIONADO: Aumentar o ícone dentro do botão grande */
.menu-item svg {
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;
}

/* ESTILOS RESPONSIVOS (MOBILE) */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    padding: 10px 20px;
    /* Reset do gap para mobile */
    gap: 0;
    justify-content: space-around;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .menu {
    flex-direction: row;
    gap: 20px; /* Gap menor no mobile */
    width: 100%;
    justify-content: space-around;
  }

  .menu-item {
    /* Volta a ser pequeno no mobile */
    width: 55px;
    height: 55px;
    border-radius: 14px;
    box-shadow: none;
  }

  /* Ícone volta ao tamanho normal no mobile */
  .menu-item svg {
    width: 24px;
    height: 24px;
  }

  .user-profile {
    display: none;
  }
}
</style>