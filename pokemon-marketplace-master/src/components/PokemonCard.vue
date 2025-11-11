<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

// Props: apenas o ID do Pokémon
const props = defineProps<{
  id: number
}>()

// Estados
const pokemon = ref<{
  name: string
  image: string
  hp: number
  atk: number
  spAtk: number
} | null>(null)

const loading = ref(true)
const error = ref<string | null>(null)

// Função para buscar da API
const fetchPokemon = async (id: number) => {
  try {
    loading.value = true
    error.value = null

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    if (!res.ok) throw new Error('Pokémon não encontrado')

    const data = await res.json()

    pokemon.value = {
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      image: data.sprites.other['official-artwork'].front_default,
      hp: data.stats.find((s: any) => s.stat.name === 'hp').base_stat,
      atk: data.stats.find((s: any) => s.stat.name === 'attack').base_stat,
      spAtk: data.stats.find((s: any) => s.stat.name === 'special-attack').base_stat
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Buscar ao montar ou quando mudar o ID
onMounted(() => fetchPokemon(props.id))
watch(() => props.id, fetchPokemon)
</script>

<template>
  <div class="pokemon-card">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="pokemon-content">
      <img :src="pokemon.image" :alt="pokemon.name" class="pokemon-image" />
      <h3 class="pokemon-name">{{ pokemon.name }}</h3>
      <div class="stats">
        <div class="stat"><strong>HP:</strong> {{ pokemon.hp }}</div>
        <div class="stat"><strong>ATK:</strong> {{ pokemon.atk }}</div>
        <div class="stat"><strong>SP ATK:</strong> {{ pokemon.spAtk }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-card {
  width: 200px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: 16px;
  text-align: center;
  transition: transform 0.2s;
}

.pokemon-card:hover {
  transform: scale(1.05);
}

.pokemon-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.pokemon-name {
  font-size: 18px;
  font-weight: 600;
  text-transform: capitalize;
  margin: 12px 0;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #333;
}

.loading, .error {
  text-align: center;
  font-size: 14px;
  color: #777;
}
</style>
