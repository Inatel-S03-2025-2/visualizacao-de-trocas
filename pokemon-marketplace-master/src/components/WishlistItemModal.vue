<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">

      <button class="close-button" @click="$emit('close')">
        &times;
      </button>

      <h2>Detalhes do Item para Troca</h2>

      <div class="item-header">
        <img :src="item.imageUrl" :alt="item.name" class="modal-image" />
        <h3>{{ item.name }}</h3>
      </div>

      <div class="item-info">
        <p><strong>Tipo:</strong> {{ item.details.type }}</p>
        <p><strong>Vida (HP):</strong> {{ item.details.hp }}</p>
        <p><strong>Dano de Ataque:</strong> {{ item.details.attack }}</p>
        <p><strong>Descrição:</strong> {{ item.details.description }}</p>
        <hr>
      </div>

    </div>
  </div>
</template>

<script setup>
// MÉTODO EDUCATIVO: O componente modal recebe o item via 'props'
// e emite o evento 'close' quando o usuário quer fechar.

const props = defineProps({
  item: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['close']);

</script>

<style scoped>
/* ESTILOS DE VISUALIZAÇÃO DO MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
  position: relative;
  animation: slide-down 0.3s ease-out;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #666;
}

.item-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.modal-image {
  width: 150px; /* Aumentamos um pouco para melhor visualização */
  height: auto; /* Mantém a proporção da imagem da carta */
  object-fit: contain;
  border-radius: 4px; /* Suaviza as bordas sem ser circular */
  border: 1px solid #ddd; /* Uma borda sutil, se desejar */
  margin-bottom: 10px;
}

/* O estilo do .action-button foi removido, mas o bloco vazio pode ser mantido
   se você não o estiver a usar noutros locais do projeto. */

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>