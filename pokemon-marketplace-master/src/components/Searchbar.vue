
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  search: [query: string]
}>()

const searchQuery = ref('')

const handleInput = () => {
  emit('search', searchQuery.value)
}
</script>

<template>
  <div class="search-bar">
    <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
    <input
      v-model="searchQuery"
      @input="handleInput"
      type="text"
      placeholder="Search trades..."
      class="search-input"
    />
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 800px;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  padding: 16px 20px 16px 52px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  background-color: #fff;
  transition: border-color 0.2s;
  outline: none;
}

.search-input:focus {
  border-color: #333;
}

.search-input::placeholder {
  color: #999;
}
</style>
