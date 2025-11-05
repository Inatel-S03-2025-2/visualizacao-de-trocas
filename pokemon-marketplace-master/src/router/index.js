// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import WishlistPage from '../components/WishlistPage.vue'; // Ajuste o caminho conforme o seu projeto

const routes = [
    {
        path: '/',
        name: 'Home',
        component: { template: '<div></div>' } // Componente VAZIO, pois o App.vue já tem o conteúdo principal.
    },
    {
        path: '/wishlist',
        name: 'Wishlist',
        component: WishlistPage // Este é o componente que será injetado no <router-view v-else />
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;