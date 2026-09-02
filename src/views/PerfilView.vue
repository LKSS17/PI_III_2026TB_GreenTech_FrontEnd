<template>
  <div class="perfil-container">
    <div class="perfil-card">
      <div class="avatar-section">
        <img 
          :src="avatarSrc || '/src/assets/img/default-avatar.png'" 
          alt="Avatar do Usuário" 
          class="avatar-image"
        />
        <input 
          type="file" 
          ref="fileInput" 
          class="hidden-input" 
          accept="image/*" 
          @change="previewFoto"
        />
        <button 
          type="button" 
          class="btn-avatar" 
          @click="triggerUpload"
          aria-label="Alterar foto de perfil"
        >
          Trocar Foto
        </button>
      </div>

      <div class="info-section">
        <h2>{{ usuario?.nome || 'Carregando perfil...' }}</h2>
        <p class="user-role">{{ usuario?.cargo || 'Colaborador GreenTech' }}</p>
        <p class="user-email">{{ usuario?.email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const authStore = useAuthStore()
const toastStore = useToastStore()

const fileInput = ref(null)
const avatarSrc = ref('')
const usuario = ref(null)

onMounted(async () => {
  usuario.value = await authStore.carregarPerfil()
  if (usuario.value?.foto) {
    avatarSrc.value = usuario.value.foto
  }
})

function triggerUpload() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function previewFoto(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toastStore.error('Selecione um arquivo de imagem válido.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    avatarSrc.value = e.target.result
    toastStore.success('Foto carregada localmente com sucesso!')
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.perfil-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.perfil-card {
  background: var(--cor-fundo-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  padding: 2.5rem;
  box-shadow: var(--sombra-card, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  display: flex;
  gap: 2rem;
  max-width: 650px;
  width: 100%;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-image {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--cor-verde-primaria, #2e7d32);
}

.hidden-input {
  display: none;
}

.btn-avatar {
  background-color: var(--cor-verde-primaria, #2e7d32);
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-avatar:hover {
  opacity: 0.9;
}

.info-section h2 {
  margin: 0 0 0.5rem 0;
  color: var(--cor-texto-principal, #263238);
}

.user-role {
  font-weight: bold;
  color: var(--cor-verde-primaria, #2e7d32);
  margin-bottom: 0.25rem;
}

.user-email {
  color: var(--cor-texto-secundario, #607d8b);
  font-size: 0.9rem;
}
</style>