<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PokemonCard from '../components/PokemonCard.vue'
import PokemonAvatar from '../components/PokemonAvatar.vue'
import { pokemonNameMap } from '../data/pokemonNameMap'

// --- TIPOS ---
interface Proposal {
  id: number
  partner: string
  offerCardId: number
}

interface MyListing {
  id: number;
  status: 'active' | 'completed';
  myCardId: number;
  date: string;
  proposals: Proposal[]
  acceptedOfferId?: number
  acceptedPartner?: string
}

// --- MOCK DATA (Mais dados para preencher a tela) ---
const myListings = ref<MyListing[]>([
  {
    id: 1, status: 'active', myCardId: 6, date: 'há 2h',
    proposals: [
      { id: 101, partner: 'DragonMaster', offerCardId: 150 },
      { id: 102, partner: 'Ash', offerCardId: 25 },
      { id: 103, partner: 'Gary', offerCardId: 3 },
      { id: 104, partner: 'Brock', offerCardId: 95 },
      { id: 105, partner: 'Misty', offerCardId: 54 }
    ]
  },
  {
    id: 2, status: 'active', myCardId: 130, date: 'há 1d', proposals: []
  },
  {
    id: 3, status: 'completed', myCardId: 25, date: '20/11/2025',
    acceptedOfferId: 54, acceptedPartner: 'Misty', proposals: []
  },
  // --- NOVOS EXEMPLOS ---
  {
    id: 4, status: 'active', myCardId: 9, date: 'há 4h', // Blastoise
    proposals: [
      { id: 106, partner: 'Jessie', offerCardId: 24 }, // Arbok
      { id: 107, partner: 'James', offerCardId: 109 }  // Koffing
    ]
  },
  {
    id: 5, status: 'completed', myCardId: 150, date: '15/11/2025', // Mewtwo (Trocado por Mew)
    acceptedOfferId: 151, acceptedPartner: 'Giovanni', proposals: []
  },
  {
    id: 6, status: 'active', myCardId: 143, date: 'há 10m', proposals: [] // Snorlax (Recém criado)
  },
  {
    id: 7, status: 'active', myCardId: 133, date: 'há 6h', // Eevee (Muitas ofertas de evolução)
    proposals: [
      { id: 108, partner: 'Bill', offerCardId: 134 }, // Vaporeon
      { id: 109, partner: 'Red', offerCardId: 135 },  // Jolteon
      { id: 110, partner: 'Green', offerCardId: 136 } // Flareon
    ]
  }
])

const myCollection = ref([
  { id: 101, pokeId: 6 }, { id: 102, pokeId: 9 }, { id: 103, pokeId: 150 },
  { id: 104, pokeId: 25 }, { id: 105, pokeId: 143 }
])

// --- ESTADOS ---
const activeTab = ref<'active' | 'completed'>('active')
const selectedListingId = ref<number | null>(null)
const isCreating = ref(false)
const showMyCardSelector = ref(false)
const selectedProposalId = ref<number | null>(null)
const newTradeMyCard = ref<number | null>(null)

// --- COMPUTEDS ---
const filteredListings = computed(() => myListings.value.filter(t => t.status === activeTab.value))
const selectedListing = computed(() => myListings.value.find(t => t.id === selectedListingId.value))

const selectedProposalData = computed(() => {
  if (!selectedListing.value || !selectedProposalId.value) return null
  return selectedListing.value.proposals.find(p => p.id === selectedProposalId.value)
})

const getPokemonName = (id: number) => pokemonNameMap[id] || `Pokémon #${id}`

// --- AÇÕES ---
onMounted(() => {
  if (filteredListings.value.length > 0) selectedListingId.value = filteredListings.value[0].id
})

function handleSelectListing(id: number) {
  isCreating.value = false
  selectedListingId.value = id
  selectedProposalId.value = null
}

function startNewTrade() {
  selectedListingId.value = null
  newTradeMyCard.value = null
  showMyCardSelector.value = true
}

function confirmMyCardSelection(pokeId: number) {
  newTradeMyCard.value = pokeId
  showMyCardSelector.value = false
  isCreating.value = true
}

function createListing() {
  if (!newTradeMyCard.value) return
  const newId = Math.max(...myListings.value.map(t => t.id), 0) + 1
  myListings.value.unshift({
    id: newId, status: 'active', myCardId: newTradeMyCard.value, date: 'Agora mesmo', proposals: []
  })
  isCreating.value = false
  selectedListingId.value = newId
}

function deleteListing() {
  if (!selectedListingId.value) return
  if(confirm("Tem certeza que deseja cancelar este anúncio?")) {
    myListings.value = myListings.value.filter(t => t.id !== selectedListingId.value)
    selectedListingId.value = null
  }
}

function acceptProposal() {
  if(!selectedListing.value || !selectedProposalData.value) return
  alert("Troca realizada com sucesso!")
  selectedListing.value.status = 'completed'
  selectedListing.value.acceptedOfferId = selectedProposalData.value.offerCardId
  selectedListing.value.acceptedPartner = selectedProposalData.value.partner
  activeTab.value = 'completed'
}

function rejectProposal() { alert("Proposta recusada.") }
</script>

<template>
  <div class="my-trades-page">
    <header class="page-header"><h1 class="page-title">Gerenciar Meus Anúncios</h1></header>

    <div class="layout-grid">

      <aside class="left-sidebar">
        <button class="add-trade-btn" @click="startNewTrade"><span class="plus-icon">+</span> Anunciar Carta</button>
        <div class="tabs">
          <button class="tab-btn" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'; selectedListingId = null">Ativos</button>
          <button class="tab-btn" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'; selectedListingId = null">Histórico</button>
        </div>
        <div class="trades-list">
          <div v-for="listing in filteredListings" :key="listing.id" class="trade-item" :class="{ selected: selectedListingId === listing.id && !isCreating }" @click="handleSelectListing(listing.id)">
            <div class="mini-card-preview"><PokemonCard :id="listing.myCardId" /></div>
            <div class="trade-info">
              <span class="pokemon-name">{{ getPokemonName(listing.myCardId) }}</span>
              <span class="proposal-count" v-if="listing.status === 'active'">
                {{ listing.proposals.length > 0 ? `${listing.proposals.length} propostas` : 'Aguardando...' }}
              </span>
              <span class="proposal-count completed" v-else>Concluída</span>
            </div>
            <span class="arrow-indicator">›</span>
          </div>
        </div>
      </aside>

      <main class="right-panel">

        <transition name="fade-up" mode="out-in">
          <div v-if="isCreating" class="creating-mode content-box">
            <div class="panel-header-simple">
              <h2>Novo Anúncio</h2>
              <button class="cancel-text-btn" @click="isCreating = false">Cancelar</button>
            </div>
            <div class="create-stage">
              <div class="card-display large"><PokemonCard v-if="newTradeMyCard" :id="newTradeMyCard" /></div>
              <p class="instruction">Ao confirmar, sua carta ficará visível para receber ofertas.</p>
              <button class="confirm-button full" @click="createListing">Confirmar Anúncio</button>
            </div>
          </div>

          <div v-else-if="selectedListing" class="viewing-mode-container" :key="selectedListing.id">

            <div class="panel-header content-box">
              <div class="header-content">
                <div class="title-group">
                  <h2>{{ activeTab === 'active' ? 'Gerenciar Oferta' : 'Detalhes do Histórico' }}</h2>
                  <span class="status-badge" :class="selectedListing.status">
                    {{ selectedListing.status === 'active' ? 'Anúncio Ativo' : 'Troca Concluída' }}
                  </span>
                </div>

                <button v-if="selectedListing.status === 'active'" class="cancel-ad-header-btn" @click="deleteListing">
                  🗑 Cancelar Anúncio
                </button>
              </div>
            </div>

            <div v-if="selectedListing.status === 'active'" class="active-trade-view">

              <div class="comparison-box content-box">
                <div class="comparison-stage">

                  <div class="card-side my-side">
                    <span class="slot-label">Seu Anúncio</span>
                    <div class="card-display static">
                      <PokemonCard :id="selectedListing.myCardId" />
                    </div>
                  </div>

                  <div class="exchange-center-actions">
                    <div class="exchange-icon-container">
                      <img
                          src="https://cdn0.iconfinder.com/data/icons/image-3/24/switch-flip-512.png"
                          alt="Trade"
                          class="trade-img-icon"
                      />
                    </div>

                    <transition name="fade-scale">
                      <button v-if="selectedProposalId" class="confirm-button" @click="acceptProposal">
                        <span>ACEITAR</span>
                        <span>TROCA</span>
                      </button>
                    </transition>
                  </div>

                  <div class="card-side proposal-side">
                    <span class="slot-label">Proposta Selecionada</span>
                    <transition name="fade-scale" mode="out-in">
                      <div v-if="selectedProposalData" :key="selectedProposalData.id" class="card-display">
                        <div class="partner-tag">
                          <PokemonAvatar :seed="selectedProposalData.partner" class="tiny-avatar"/>
                          <span>{{ selectedProposalData.partner }}</span>
                        </div>
                        <PokemonCard :id="selectedProposalData.offerCardId" />
                      </div>
                      <div v-else class="empty-slot-placeholder">
                        <span v-if="selectedListing.proposals.length > 0">👈 Selecione uma proposta</span>
                        <span v-else>Aguardando ofertas... ⏳</span>
                      </div>
                    </transition>
                  </div>
                </div>
              </div>

              <div class="proposals-section content-box" v-if="selectedListing.proposals.length > 0">
                <h4 class="section-title">Propostas Recebidas ({{ selectedListing.proposals.length }})</h4>
                <div class="proposals-carousel">
                  <div v-for="prop in selectedListing.proposals" :key="prop.id" class="mini-proposal-item" :class="{ active: selectedProposalId === prop.id }" @click="selectedProposalId = prop.id">
                    <PokemonCard :id="prop.offerCardId" />
                  </div>
                </div>
              </div>

            </div>

            <div v-else class="history-trade-view">
              <div class="comparison-box content-box">
                <div class="comparison-stage static-stage">
                  <div class="card-side"><span class="slot-label">Você enviou</span><div class="card-display static no-hover"><PokemonCard :id="selectedListing.myCardId" /></div></div>
                  <div class="exchange-result"><span class="check-icon">✅</span><span class="date-label">Trocado em<br>{{ selectedListing.date }}</span></div>
                  <div class="card-side"><span class="slot-label">Você recebeu</span><div class="card-display static no-hover"><div class="partner-tag"><PokemonAvatar :seed="selectedListing.acceptedPartner || 'User'" class="tiny-avatar"/><span>{{ selectedListing.acceptedPartner }}</span></div><PokemonCard :id="selectedListing.acceptedOfferId || 0" /></div></div>
                </div>
              </div>
            </div>

          </div>

          <div v-else class="empty-state-panel content-box">
            <div class="empty-icon">👈</div>
            <h3>Selecione um item ao lado</h3>
          </div>
        </transition>
      </main>
    </div>

    <div v-if="showMyCardSelector" class="modal-overlay" @click.self="showMyCardSelector = false">
      <div class="modal-box">
        <h3>Selecione para anunciar</h3>
        <div class="cards-grid">
          <div v-for="card in myCollection" :key="card.id" class="grid-item" @click="confirmMyCardSelection(card.pokeId)"><PokemonCard :id="card.pokeId" /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* GERAL */
.my-trades-page {
  padding: 20px 40px; /* Um pouco mais de padding vertical */
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
  background-color: #f0f2f5; /* Fundo cinza mais moderno */
}

.page-header { margin-bottom: 20px; }
.page-title { font-size: 1.8em; color: #333; margin: 0; }
.layout-grid { display: grid; grid-template-columns: 320px 1fr; gap: 30px; flex: 1; min-height: 0; }

/* --- NOVO: CLASSE PARA AS CAIXAS DE CONTEÚDO --- */
.content-box {
  background: #fff;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.05);
  /* Importante para o hover da carta não cortar */
  overflow: visible;
}

/* SIDEBAR (Usa o estilo de caixa agora) */
.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* Aplicando o estilo de caixa aqui também para consistência */
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.05);
}

.add-trade-btn { background-color: #fff; border: 1px solid #ddd; color: #555; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.add-trade-btn:hover { background-color: #e8f5e9; border-color: #4caf50; color: #2e7d32; transform: translateY(-2px); }
.tabs { display: flex; background: #f5f5f5; padding: 4px; border-radius: 10px; }
.tab-btn { flex: 1; padding: 8px; border: none; background: transparent; border-radius: 8px; cursor: pointer; color: #777; font-weight: 600; }
.tab-btn.active { background: #333; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.trades-list { overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 5px; }
.trade-item { display: flex; align-items: center; gap: 15px; padding: 12px; border-radius: 12px; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; }
.trade-item:hover { background-color: #f9f9f9; }
.trade-item.selected { background-color: #e3f2fd; border-color: #2196f3; }
.mini-card-preview { width: 50px; pointer-events: none; }
.mini-card-preview :deep(.pokemon-card) { width: 100% !important; height: auto !important; border-radius: 4px; }
.trade-info { flex: 1; display: flex; flex-direction: column; }
.pokemon-name { font-weight: 700; color: #333; font-size: 0.95em; text-transform: capitalize; }
.proposal-count { font-size: 0.75em; color: #4caf50; font-weight: 600; }
.proposal-count.completed { color: #888; }
.proposal-count.empty { color: #999; font-weight: 400; }
.arrow-indicator { color: #ccc; font-weight: bold; }

/* DIREITA - AGORA É TRANSPARENTE E ORGANIZA AS CAIXAS */
.right-panel {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 25px; /* Espaço entre as caixas */
  overflow-y: auto;
  overflow-x: hidden;
}

.viewing-mode-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* HEADER DENTRO DA CAIXA */
.panel-header { /* padding e border removidos pois a .content-box já cuida disso */ }
.header-content { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; }
.title-group h2 { margin: 0 0 10px 0; font-size: 1.5em; color: #333; }
.status-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 700; }
.status-badge.active { background: #e8f5e9; color: #2e7d32; }
.status-badge.completed { background: #eee; color: #666; }

/* BOTÃO CANCELAR NO HEADER */
.cancel-ad-header-btn { background: #fff; border: 1px solid #ffcdd2; color: #d32f2f; padding: 8px 20px; border-radius: 8px; font-size: 0.85em; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.cancel-ad-header-btn:hover { background: #ffebee; border-color: #d32f2f; }

/* CAIXA DE COMPARAÇÃO */
.comparison-box {
  /* Aumente de 40px para 70px ou 80px */
  padding-top: 40px;

  /* Mantenha o restante como está */
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.05);
  overflow: visible; /* Essencial manter isso visível */
}
.comparison-stage { display: flex; align-items: flex-start; justify-content: center; gap: 60px; }
.card-side { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 220px; }
.slot-label { font-weight: 700; color: #555; text-transform: uppercase; font-size: 0.85em; letter-spacing: 1px; }

/* CORREÇÃO DO CORTE NO HOVER - MANTIDA */
.card-display {
  width: 100%;
  perspective: 1000px;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* Animação mais "elástica" */
  z-index: 1;
}

/* Adicione esta regra para garantir que a área da troca fique acima do header */
.active-trade-view {
  position: relative;
  z-index: 10;
}
.card-display.no-hover { cursor: default; }
/* Importante: overflow visible no pai se tiver e z-index alto no hover */
.card-display:not(.no-hover):hover {
  transform: translateY(-15px) scale(1.08);
  z-index: 100 !important;
}
.card-display :deep(.pokemon-card) { width: 100% !important; height: auto !important; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transition: box-shadow 0.3s; }
.card-display:not(.no-hover):hover :deep(.pokemon-card) { box-shadow: 0 20px 40px rgba(0,0,0,0.25); }


.partner-tag { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #fff; border: 1px solid #ddd; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 5px; font-size: 0.8em; font-weight: 700; z-index: 101; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.tiny-avatar { width: 20px; height: 20px; border-radius: 50%; }

/* CENTRO INTERATIVO */
.exchange-center-actions { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; min-width: 140px; align-self: center; }
.exchange-icon-container { transition: color 0.3s; }
.trade-img-icon { width: 60px; opacity: 0.6; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.comparison-stage:hover .trade-img-icon { transform: rotate(180deg); opacity: 1; }

.empty-slot-placeholder { width: 100%; height: 300px; border: 2px dashed #ddd; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #999; font-weight: 600; background: #fafafa; }

/* BOTÃO ACEITAR TROCA */
.confirm-button {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white; border: none; padding: 10px 25px; border-radius: 50px; font-weight: 700; text-transform: uppercase; font-size: 0.85rem; cursor: pointer;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  white-space: nowrap; display: flex; flex-direction: column; align-items: center; line-height: 1.2;
}
.confirm-button:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4); }
.confirm-button.full { width: 100%; }

/* CAIXA DE PROPOSTAS */
.proposals-section { /* padding/border removidos, a content-box cuida */ }
.section-title { margin: 0 0 15px 0; font-size: 0.9em; color: #777; text-transform: uppercase; }
.proposals-carousel {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  /* ADICIONE ESTA LINHA: */
  padding-top: 15px; /* Cria espaço para a carta subir no hover sem cortar */

  /* Mantenha as outras propriedades */
  padding-bottom: 20px;
  scrollbar-width: thin;
}

.mini-proposal-item {
  width: 150px;
  min-width: 150px;
  cursor: pointer;
  transition: transform 0.2s;
  opacity: 0.8; /* Um pouco mais visível */
  position: relative;
  z-index: 20;
}
.mini-proposal-item:hover { transform: translateY(-8px); opacity: 1; z-index: 5; }
.mini-proposal-item.active { opacity: 1; transform: scale(1.05); z-index: 2; }
.mini-proposal-item.active::after { content: ''; position: absolute; inset: -5px; border: 3px solid #4caf50; border-radius: 12px; pointer-events: none; }
.mini-proposal-item :deep(.pokemon-card) { width: 100% !important; height: auto !important; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: box-shadow 0.2s; }
.mini-proposal-item:hover :deep(.pokemon-card) { box-shadow: 0 8px 20px rgba(0,0,0,0.15); }

/* HISTÓRICO */
.history-trade-view .exchange-result { display: flex; flex-direction: column; align-items: center; gap: 5px; color: #4caf50; font-weight: 700; text-align: center; align-self: center; }
.check-icon { font-size: 2em; }
.date-label { font-size: 0.8em; color: #999; font-weight: 400; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); }
.modal-box { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; }
.grid-item { cursor: pointer; transition: transform 0.2s; }
.grid-item:hover { transform: scale(1.05); }
.grid-item :deep(.pokemon-card) { width: 100% !important; height: auto !important; }

/* ANIMAÇÕES E EMPTY STATE */
.fade-up-enter-active, .fade-up-leave-active { transition: all 0.3s ease; }
.fade-up-enter-from { opacity: 0; transform: translateY(20px); }
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.3s ease; }
.fade-scale-enter-from { opacity: 0; transform: scale(0.8); }

/* O empty state agora também é uma caixa */
.empty-state-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #999; }
.empty-icon { font-size: 3em; margin-bottom: 10px; }

/* Ajustes para o modo criação */
.panel-header-simple { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.panel-header-simple h2 { margin: 0; color: #333; }
.cancel-text-btn { background: none; border: none; color: #999; cursor: pointer; font-weight: 600; }
.cancel-text-btn:hover { color: #d32f2f; }
.create-stage { display: flex; flex-direction: column; align-items: center; gap: 20px; max-width: 400px; margin: 0 auto; text-align: center; padding-bottom: 20px; }
</style>