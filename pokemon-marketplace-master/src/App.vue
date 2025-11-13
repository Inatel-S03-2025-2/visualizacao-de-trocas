<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="app-container">
    <Sidebar />

    <main class="main-content">
      <router-view />
    </main>

    <aside class="right-sidebar">
      <div class="notification-card">
        <div class="notification-icon">!</div>
        <div class="notification-content">
          <div class="notification-line"></div>
          <div class="notification-line short"></div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* Estilos do Layout */
.app-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.right-sidebar {
  width: 280px;
  padding: 24px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
}

.notification-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #333;
  border-radius: 50%;
  font-size: 24px;
  font-weight: bold;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-line {
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.notification-line.short {
  width: 60%;
}

@media (max-width: 1024px) {
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .main-content {
    padding: 16px;
  }
}
</style>