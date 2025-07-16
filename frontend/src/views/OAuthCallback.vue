<template>
  <div class="oauth-callback">
    <p v-if="loading">Connexion en cours...</p>
    <div v-if="error" class="error">
      <p>
        {{ error }}        
      </p>

      <a href="/">
        {{ t('') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const error = ref('');
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code as string;
  const state = route.query.state as string;
  if (!code || !state) {
    error.value = "Code OAuth manquant dans l'URL.";
    loading.value = false;
    return;
  }
  try {
    // Appel au backend pour échanger le code contre un token
    // const response = await api.post('/auth/oauth/callback', { code, state });
    const response = await api.get('/api/webhook/oauth?code=' + code + '&state=' + state);
    // Supposons que le backend renvoie { token, user }
    authStore.login(response.data.token, response.data.user);
    window.location.href = '/dashboard/settings';
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erreur lors de la connexion OAuth.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.oauth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style> 