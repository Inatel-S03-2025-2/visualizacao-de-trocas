import { describe, it, expect} from 'vitest'
import { mount } from '@vue/test-utils'
import TradeCard from '../TradeCard.vue'

// Mock dos dados (simulamos as props)
const mockCards = [
{ id: 1, pokeId: 25 }, // Pikachu
{ id: 2, pokeId: 6 }   // Charizard
]

describe('TradeCard Component', () => {

// Teste 1: Verifica se renderiza
it('deve renderizar o nome do usuário corretamente', () => {
const wrapper = mount(TradeCard, {
props: {
username: 'AshKetchum',
cards: mockCards,
isActive: false
}
})

// Verifica se o texto 'AshKetchum' existe no HTML do componente
expect(wrapper.text()).toContain('AshKetchum')
})

// Teste 2: Verifica classes dinâmicas
it('deve ter a classe "active" quando a prop isActive for true', () => {
const wrapper = mount(TradeCard, {
props: {
username: 'Misty',
cards: mockCards,
isActive: true // Aqui é true
}
})

// Verifica se a div principal tem a classe .active
expect(wrapper.find('.trade-card').classes()).toContain('active')
})

// Teste 3: Verifica clique e eventos
it('deve emitir o evento "cardClicked" ao clicar em uma carta', async () => {
const wrapper = mount(TradeCard, {
props: {
username: 'Brock',
cards: mockCards,
isActive: true
}
})

// Encontra a primeira carta (wrapper do pokemon card)
const card = wrapper.find('.simple-card-wrapper')

// Simula o clique
await card.trigger('click')

// Verifica se o evento foi emitido para o pai
// O evento deve conter o ID da carta (25 ou 101 dependendo da sua logica de getId)
expect(wrapper.emitted()).toHaveProperty('cardClicked')
})
})