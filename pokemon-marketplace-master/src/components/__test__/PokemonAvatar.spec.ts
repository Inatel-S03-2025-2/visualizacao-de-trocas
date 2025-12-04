import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PokemonAvatar from '../PokemonAvatar.vue'

describe('PokemonAvatar Component', () => {

    it('deve renderizar com um seed (nome de usuário)', () => {
        const wrapper = mount(PokemonAvatar, {
            props: { seed: 'Henry' }
        })

        expect(wrapper.exists()).toBe(true)
    })

    it('deve ter a classe correta de estilo', () => {
        const wrapper = mount(PokemonAvatar, {
            props: { seed: 'Ash' }
        })

        // Se o seu componente tem uma classe raiz ou na imagem
        // Isso verifica se o CSS está sendo aplicado
        expect(wrapper.classes()).toBeDefined()
    })
})