// src/main.ts (Apenas a seção de importação e uso)

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// CORREÇÃO FINAL: Especificamos o nome completo do ficheiro com a sua extensão.
// Isto resolve a ambiguidade de o main.ts ser TypeScript (.ts)
// e o ficheiro de rotas ser JavaScript (.js).
import router from "./router/index.js";

createApp(App)
    .use(router)
    .mount('#app');