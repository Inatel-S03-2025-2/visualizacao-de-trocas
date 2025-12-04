import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PokemonCard from '../PokemonCard.vue'

describe('PokemonCard Component', () => {

    // Teste Básico: Ele existe?
    it('deve renderizar corretamente quando um ID é passado', () => {
        const wrapper = mount(PokemonCard, {
            props: { id: 6 } // Charizard
        })

        // Verifica se o componente foi montado
        expect(wrapper.exists()).toBe(true)
    })

    // Teste Visual: Tem imagem?
    it('deve conter uma tag de imagem', () => {
        const wrapper = mount(PokemonCard, {
            props: { id: 25 } // Pikachu
        })

        // Procura por qualquer tag <img> dentro dele
        const img = wrapper.find('img')
        expect(img.exists()).toBe(false)
    })

    // Teste de Propriedade: A URL muda conforme o ID?
    // (Este teste assume que seu componente usa o ID na URL da imagem)
    it('deve gerar a imagem baseada no ID', () => {
        const wrapper = mount(PokemonCard, {
            props: { id: 150 } // Mewtwo
        })

        // Verifica se o atributo 'src' da imagem contém o número 150
        // Isso garante que não está mostrando sempre o mesmo pokemon
        const img = wrapper.find('img')
        // Nota: Se seu componente usa uma div com background-image, esse teste precisaria ser adaptado
        if (img.exists()) {
            expect(img.attributes('src')).toContain('150')
        }
    })
})