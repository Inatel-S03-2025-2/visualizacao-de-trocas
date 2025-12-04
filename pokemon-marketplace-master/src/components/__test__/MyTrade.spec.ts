import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MyTrades from '../MyTradesPage.vue'

// 1. Mockamos os dados externos para o teste não depender dos arquivos reais
vi.mock('../../data/pokemonNameMap', () => ({
    pokemonNameMap: {
        6: 'Charizard',
        25: 'Pikachu'
    }
}))

// 2. Mockamos o componente filho complexo para focar apenas na lógica da página
// Isso evita erros de 'injection' e deixa o teste mais rápido
const PokemonCardStub = {
    template: '<div class="pokemon-card-stub"></div>',
    props: ['id']
}

describe('MyTrades View', () => {

    it('deve renderizar o título correto', () => {
        const wrapper = mount(MyTrades, {
            global: {
                stubs: {
                    PokemonCard: PokemonCardStub,
                    PokemonAvatar: true // true usa um stub padrão simples
                }
            }
        })

        expect(wrapper.find('.page-title').text()).toBe('Gerenciar Meus Anúncios')
    })

    it('deve exibir o botão de adicionar nova troca', () => {
        const wrapper = mount(MyTrades, {
            global: { stubs: { PokemonCard: PokemonCardStub, PokemonAvatar: true } }
        })

        const btn = wrapper.find('.add-trade-btn')
        expect(btn.exists()).toBe(true)
        expect(btn.text()).toContain('Anunciar Carta')
    })

    it('deve abrir o modal de seleção ao clicar em Anunciar', async () => {
        const wrapper = mount(MyTrades, {
            global: { stubs: { PokemonCard: PokemonCardStub, PokemonAvatar: true } }
        })

        // Simula o clique no botão
        await wrapper.find('.add-trade-btn').trigger('click')

        // Verifica se o texto do modal apareceu
        expect(wrapper.text()).toContain('Selecione para anunciar')
    })
})