import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WishlistPage from '../WishlistPage.vue' // Ajuste o caminho se necessário

// Mock dos componentes filhos para isolar o teste da página
const PokemonCardStub = { template: '<div class="pokemon-card-stub"></div>', props: ['id', 'rarity'] }
const PokemonDetailModalStub = { template: '<div class="modal-stub"></div>', props: ['id'] }

// Mock dos dados importados
vi.mock('../data/pokemonNameMap', () => ({
    pokemonNameMap: {
        1: 'bulbasaur',
        4: 'charmander',
        25: 'pikachu',
        150: 'mewtwo'
    }
}))

describe('WishlistPage.vue', () => {
    let wrapper: any
    const notifyMock = vi.fn()

    beforeEach(() => {
        // Reset do mock antes de cada teste
        notifyMock.mockClear()

        wrapper = mount(WishlistPage, {
            global: {
                stubs: {
                    PokemonCard: PokemonCardStub,
                    PokemonDetailModal: PokemonDetailModalStub,
                    'router-link': { template: '<a><slot /></a>' } // Stub simples para router-link
                },
                provide: {
                    'notify': notifyMock // Injetando o mock da notificação
                }
            }
        })
    })


    it('deve adicionar item aos favoritos e chamar notify', async () => {
        // Encontra o botão de coração do primeiro card (Bulbasaur id:1)
        const cards = wrapper.findAll('.card-display-area .card-wrapper')
        const favButton = cards[0].find('.favorite-button')

        await favButton.trigger('click')

        // Verifica se entrou na lista de favoritos
        const favoritesSection = wrapper.find('.favorites-section')
        expect(favoritesSection.text()).toContain('Bulbasaur')

        // Verifica notificação
        expect(notifyMock).toHaveBeenCalledWith('Pokémon adicionado aos favoritos!', 'success')
    })


    it('deve abrir o modal ao clicar no card', async () => {
        const card = wrapper.find('.card-display-area .card-wrapper')
        await card.trigger('click')

        expect(wrapper.vm.isModalOpen).toBe(true)
        expect(wrapper.findComponent(PokemonDetailModalStub).exists()).toBe(true)
    })
})