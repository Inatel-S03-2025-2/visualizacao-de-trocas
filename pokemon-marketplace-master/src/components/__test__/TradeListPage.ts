import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TradeListPage from '../TradesListPage.vue'

// Stubs para componentes filhos
const TradeCardStub = {
    template: '<div class="trade-card-stub" @click="$emit(\'click\')"></div>',
    props: ['username', 'isActive'],
    emits: ['click', 'cardClicked']
}
const PokemonCardStub = { template: '<div class="pokemon-card-stub"></div>', props: ['id'] }

// Mock dos dados (tradesData e pokemonNameMap)
vi.mock('../data/pokemonNameMap', () => ({
    pokemonNameMap: { 6: 'Charizard', 25: 'Pikachu' }
}))

vi.mock('../data/tradesData', () => ({
    tradesData: [
        {
            id: 101,
            player: 'Ash Ketchum',
            date: '2025-11-20',
            offers: [{ pokeId: 6 }], // Charizard
            wants: [],
            offerCount: 1
        },
        {
            id: 102,
            player: 'Gary Oak',
            date: '2025-11-21',
            offers: [{ pokeId: 25 }], // Pikachu
            wants: [],
            offerCount: 1
        }
    ]
}))

describe('TradeListPage.vue', () => {
    let wrapper: any
    const notifyMock = vi.fn()

    beforeEach(() => {
        notifyMock.mockClear()
        wrapper = mount(TradeListPage, {
            global: {
                stubs: {
                    TradeCard: TradeCardStub,
                    PokemonCard: PokemonCardStub,
                    'router-link': true
                },
                provide: {
                    notify: notifyMock
                }
            }
        })
    })

    it('deve renderizar a lista de trocas', () => {
        const tradeItems = wrapper.findAllComponents(TradeCardStub)
        expect(tradeItems.length).toBe(2)
        // Verifica se os nomes dos jogadores aparecem (props passadas para o stub)
        expect(tradeItems[0].props('username')).toBe('Ash Ketchum')
    })

    it('deve filtrar trocas pelo nome do Pokémon ofertado', async () => {
        const input = wrapper.find('.search-input')
        await input.setValue('Charizard') // Ash tem o Charizard

        const tradeItems = wrapper.findAllComponents(TradeCardStub)
        expect(tradeItems.length).toBe(1)
        expect(tradeItems[0].props('username')).toBe('Ash Ketchum')
    })

    it('deve expandir a troca ao clicar no card', async () => {
        const tradeCard = wrapper.findComponent(TradeCardStub)

        // Simula clique no componente filho
        await tradeCard.trigger('click')

        // Verifica se a área expandida apareceu
        const expandedArea = wrapper.find('.expanded-area')
        expect(expandedArea.exists()).toBe(true)
    })

    it('deve abrir o popup de oferta ao clicar no botão "Ofertar"', async () => {
        // 1. Expande a troca
        await wrapper.findComponent(TradeCardStub).trigger('click')

        // 2. Clica no botão de ofertar (+)
        const offerButton = wrapper.find('.trade-slot-button')
        await offerButton.trigger('click')

        // 3. Verifica se o popup abriu
        expect(wrapper.find('.popup-overlay').exists()).toBe(true)
    })

    it('deve selecionar uma carta do usuário e habilitar botão de envio', async () => {
        // 1. Abre popup
        await wrapper.findComponent(TradeCardStub).trigger('click')
        await wrapper.find('.trade-slot-button').trigger('click')

        // 2. Seleciona carta da "Minha Coleção" dentro do popup
        // Como o PokemonCard é um stub, vamos simular o click no wrapper dele
        const myCards = wrapper.findAll('.popup-cards.grid .responsive-wrapper')
        await myCards[0].findComponent(PokemonCardStub).trigger('click')

        // 3. Popup deve fechar
        expect(wrapper.find('.popup-overlay').exists()).toBe(false)

        // 4. Botão "Enviar Proposta" deve aparecer
        const sendButton = wrapper.find('.confirm-button')
        expect(sendButton.exists()).toBe(true)
    })

    it('deve enviar proposta e notificar', async () => {
        // Setup do estado "pronto para enviar"
        await wrapper.findComponent(TradeCardStub).trigger('click') // expande
        wrapper.vm.selectedUserCardApiId = 6 // força seleção direta no estado para agilizar

        await wrapper.nextTick()

        const sendButton = wrapper.find('.confirm-button')
        await sendButton.trigger('click')

        expect(notifyMock).toHaveBeenCalledWith('Proposta enviada com sucesso!', 'success')
        // Deve resetar o estado (fechar expandido)
        expect(wrapper.vm.expandedTradeId).toBeNull()
    })
})