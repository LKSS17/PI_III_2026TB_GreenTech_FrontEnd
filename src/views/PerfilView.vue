<template>
  <PageLayout title="Meu Perfil" subtitle="Gerencie suas informações pessoais e foto de exibição.">
    <template #header-actions>
      <WeatherWidget />
    </template>

    <section class="perfil-layout">
      <div class="perfil-hero-card">
        <div class="perfil-avatar-wrapper">
          <img v-if="avatarSrc" :src="avatarSrc" alt="Avatar do usuário" class="perfil-avatar" />
          <div
            v-else
            class="perfil-avatar perfil-avatar-placeholder"
            :style="{ background: corAvatar }"
          >
            {{ iniciais }}
          </div>
          <button
            type="button"
            class="perfil-avatar-edit"
            @click="triggerUpload"
            aria-label="Alterar foto de perfil"
          >
            <span class="material-symbols-outlined" style="font-size: 1.1rem">photo_camera</span>
          </button>
          <input
            type="file"
            ref="fileInput"
            class="hidden-input"
            accept="image/*"
            @change="previewFoto"
          />
        </div>

        <h2 class="perfil-nome">{{ usuario?.nome_completo || 'Carregando perfil...' }}</h2>
        <p class="perfil-cargo">{{ usuario?.email || '—' }}</p>
        <span class="perfil-role-badge">
          <span class="material-symbols-outlined" style="font-size: 1rem">verified_user</span>
          {{ usuario?.cargo_display || 'Sem cargo definido' }}
        </span>

        <div class="perfil-stats">
          <div class="stat-item">
            <div class="stat-value">{{ diasNoSistema }}</div>
            <div class="stat-label">Dias no sistema</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ usuario?.username || '-' }}</div>
            <div class="stat-label">Usuário</div>
          </div>
        </div>
      </div>

      <div class="perfil-form-card">
        <h3 class="perfil-section-title">
          <span class="material-symbols-outlined">badge</span>
          Dados Cadastrais
        </h3>
        <div class="perfil-form-grid">
          <div class="detail-item">
            <label>Nome Completo</label><span>{{ usuario?.nome_completo || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>CPF</label><span>{{ usuario?.cpf || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>Telefone</label><span>{{ usuario?.telefone || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>E-mail</label><span>{{ usuario?.email || '-' }}</span>
          </div>
          <div class="detail-item full-width">
            <label>Membro desde</label><span>{{ dataEntradaFormatada }}</span>
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import PageLayout from '@/components/PageLayout.vue'
import WeatherWidget from '@/components/WeatherWidget.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()

const fileInput = ref(null)
const avatarSrc = ref('')
const usuario = ref(null)

const CORES_AVATAR = ['#3a5a40', '#588157', '#bc6c25', '#344e41', '#6c584c']

const iniciais = computed(() => {
  const nome = usuario.value?.nome_completo?.trim()
  if (!nome) return '?'
  const partes = nome.split(/\s+/)
  const primeira = partes[0]?.[0] || ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
})

const corAvatar = computed(() => {
  const nome = usuario.value?.nome_completo || ''
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  return CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length]
})

const diasNoSistema = computed(() => {
  if (!usuario.value?.data_entrada) return 0
  const diff = Math.abs(new Date() - new Date(usuario.value.data_entrada))
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

const dataEntradaFormatada = computed(() =>
  usuario.value?.data_entrada
    ? new Date(usuario.value.data_entrada).toLocaleDateString('pt-BR')
    : '-',
)

onMounted(async () => {
  usuario.value = await authStore.carregarPerfil()
  if (usuario.value?.foto) avatarSrc.value = usuario.value.foto
})

function triggerUpload() {
  fileInput.value?.click()
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
.hidden-input {
  display: none;
}
.perfil-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2.4rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1px;
}
</style>
