<template>
  <div class="login-page">
    <div class="card" role="dialog" aria-labelledby="login-title">
      <img class="logo" src="/Holoyoverlay.png" alt="logo" />
      <h1 id="login-title">Entrar</h1>

      <label class="field">
        <span>Usuário</span>
        <input
            v-model="username"
            @keyup.enter="handleLogin"
            placeholder="seu usuário"
            aria-label="Usuário"
        />
      </label>

      <label class="field">
        <span>Senha</span>
        <input
            type="password"
            v-model="password"
            @keyup.enter="handleLogin"
            placeholder="sua senha"
            aria-label="Senha"
        />
      </label>

      <div class="actions">
        <button class="btn" :disabled="loading" @click="handleLogin">
          {{ loading ? 'Entrando...' : 'Fazer login' }}
        </button>
      </div>

      <p class="hint">Use qualquer credencial (simulação). Você será redirecionado para Trades.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  if (loading.value) return;
  if (!username.value.trim() || !password.value.trim()) {
    alert('Informe usuário e senha.');
    return;
  }

  loading.value = true;
  await new Promise((r) => setTimeout(r, 450));
  try { localStorage.setItem('pm_user', JSON.stringify({ username: username.value })); } catch {}
  try { await router.push({ name: 'Trades' }); } catch {
    const fallbacks = ['/trades', '/tradeslistpage', '/trades-list', '/'];
    for (const p of fallbacks) {
      try { await router.push(p); break; } catch {}
    }
  } finally { loading.value = false; }
}
</script>

<style scoped>
/* Força fundo branco e texto escuro apenas nesta página */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  box-sizing: border-box;
  background: #f5f5f5 !important;
  color: #333;
  font-family: inherit;
}

/* cartão claro */
.card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border: 2px solid #e0e0e0;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* logo (mantém a imagem) */
.logo {
  width: 84px;
  height: 84px;
  object-fit: contain;
  margin: 0 auto 12px;
}

/* título escuro */
h1 {
  margin: 0 0 18px;
  font-size: 22px;
  color: #333;
}

/* campos */
.field {
  display: block;
  margin-bottom: 14px;
  text-align: left;
}

.field span {
  display: inline-block;
  margin-bottom: 6px;
  color: #333;
  font-size: 13px;
}

input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  color: #333;
  outline: none;
  box-sizing: border-box;
  font-size: 14px;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* botão primário escuro sobre fundo claro (visível) */
.actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
.btn {
  background: #007bff;
  color: #fff;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  min-width: 160px;
}
.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  margin-top: 14px;
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>