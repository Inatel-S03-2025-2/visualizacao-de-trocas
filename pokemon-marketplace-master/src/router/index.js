// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import WishlistPage from '../components/WishlistPage.vue';
import CardTest from '../components/CardTest.vue';
// ✅ IMPORTA A PÁGINA PRINCIPAL
import TradesListPage from '../components/TradesListPage.vue';
import MyTradesPage from "../components/MyTradesPage.vue";

import LoginPage from "../components/LoginPage.vue";

// Componentes "dummy" temporários
const AddTradePage = { template: '<h1>Página Add Trade (Em construção)</h1>' };
const MyCardsPage = { template: '<h1>Página My Cards (Em construção)</h1>' };

const routes = [
     {
        path: '/login',
        name: 'Login',
        component: LoginPage
    },

    // ✅ ADICIONADO: Redireciona a raiz '/' para '/trades'
    {
        path: '/',
        redirect: '/login' // Qualquer acesso à raiz é jogado para /trades
    },
    // ✅ ALTERADO: A página principal agora vive em '/trades'
    {
        path: '/trades',
        name: 'Home', // O nome da rota ainda pode ser 'Home'
        component: TradesListPage
    },
    {
        path: '/wishlist',
        name: 'Wishlist',
        component: WishlistPage
    },
    {
        path: '/card-test',
        name: 'CardTest',
        component: CardTest
    },
    {
        path: '/add-trade',
        name: 'AddTrade',
        component: AddTradePage
    },
    {
        path: '/my-cards',
        name: 'MyCards',
        component: MyCardsPage
    },
    { 
        path: "/mytrades", component: MyTradesPage 
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;