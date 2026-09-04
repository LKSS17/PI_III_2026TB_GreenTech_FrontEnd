<template>
  <PageLayout
    title="Colheitas"
    subtitle="Registro de baixas, perdas de maturação e histórico de produção."
  >
    <template #header-actions>
      <WeatherWidget />
    </template>

    <section class="registration-container-estoque">
      <div class="action-bar-estoque">
        <div class="search-box-estoque">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            class="search-input"
            v-model="busca"
            placeholder="Buscar no histórico..."
          />
        </div>
        <button class="btn-generate" @click="modoCadastro = true">
          <span class="material-symbols-outlined">agriculture</span> Registrar Colheita
        </button>
      </div>

      <div class="inventory-split-view">
        <div class="seed-list-container">
          <div v-if="historicoFiltrado.length === 0" class="empty-state">
            Nenhuma colheita registrada no histórico.
          </div>
          <div
            v-else
            v-for="c in historicoFiltrado"
            :key="c.id"
            class="mini-card"
            :class="{ active: colheitaSelecionada?.id === c.id }"
            @click="selecionar(c)"
          >
            <div class="mini-card-header">
              <h4>{{ c.nomeCultura }} (Lote #{{ c.lote_id }})</h4>
              <span class="badge badge-good">Colhido</span>
            </div>
            <div class="mini-card-cultura">
              {{ new Date(c.data_colheita).toLocaleDateString('pt-BR') }}
            </div>

            <div
              class="mini-card-qty"
              style="
                color: var(--primary-dark);
                font-size: 1.05rem;
                margin-top: 8px;
                font-weight: 600;
              "
            >
              <span class="material-symbols-outlined" style="font-size: 1.1rem">monitoring</span>
              Taxa de Colheita do Lote: {{ c.taxaProducao }}%
            </div>
          </div>
        </div>

        <div class="seed-detail-panel">
          <form v-if="modoCadastro" @submit.prevent="salvarColheita" class="form-grid-layout">
            <div class="detail-header" style="grid-column: 1 / -1">
              <h2><span class="material-symbols-outlined">agriculture</span> Nova Colheita</h2>
              <p style="color: #666; font-size: 0.9rem">
                O lote selecionado será finalizado e zerado da mesa atual.
              </p>
            </div>

            <div class="form-group full-width">
              <label>Lote de Origem (Para Baixa)</label>
              <select v-model="form.lote_id" required>
                <option value="" disabled>Selecione um lote em desenvolvimento...</option>
                <option v-for="l in lotesAtivos" :key="l.id" :value="l.id">
                  LOTE #{{ l.id }} (Mesa {{ l.mesa_id }}) - Saldo Total: {{ l.quantidade }}
                </option>
              </select>
            </div>

            <div
              v-if="loteSelecionadoParaColheita"
              class="form-group full-width"
              style="
                background: rgba(0, 0, 0, 0.02);
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #eee;
              "
            >
              <label style="display: flex; justify-content: space-between; margin-bottom: 15px">
                <span style="color: var(--primary-green); font-weight: 700"
                  >Aproveitamento: {{ form.quantidade_colhida }}</span
                >
                <span style="color: #d32f2f; font-weight: 700" v-if="form.quantidade_perda > 0"
                  >Perda: {{ form.quantidade_perda }}</span
                >
              </label>

              <input
                type="range"
                v-model="form.quantidade_colhida"
                :max="loteSelecionadoParaColheita.quantidade"
                min="0"
                step="1"
                class="harvest-slider"
              />

              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 0.8rem;
                  color: #888;
                  margin-top: 8px;
                "
              >
                <span>0 (Perda Total)</span>
                <span>{{ loteSelecionadoParaColheita.quantidade }} (Sucesso Total)</span>
              </div>
            </div>

            <div class="form-actions-right" style="grid-column: 1 / -1">
              <button type="button" class="btn-outline" @click="modoCadastro = false">
                Cancelar
              </button>
              <button type="submit" class="btn-save">Finalizar Lote</button>
            </div>
          </form>

          <div v-else-if="colheitaSelecionada">
            <div class="detail-header">
              <h2>Registro de Colheita #{{ colheitaSelecionada.id }}</h2>
              <span class="badge badge-good">Lote Finalizado</span>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Data da Colheita</label
                ><span>{{
                  new Date(colheitaSelecionada.data_colheita).toLocaleDateString('pt-BR')
                }}</span>
              </div>
              <div class="detail-item">
                <label>Lote Origem</label><span>LOTE #{{ colheitaSelecionada.lote_id }}</span>
              </div>
              <div class="detail-item">
                <label>Auditor Responsável</label>
                <span style="font-weight: 600; color: var(--primary-dark)">
                  <span
                    class="material-symbols-outlined"
                    style="font-size: 1rem; vertical-align: middle; margin-right: 4px"
                    >person</span
                  >
                  {{ colheitaSelecionada.nomeAuditor }}
                </span>
              </div>

              <div
                class="detail-item full-width qty-destaque"
                style="background: rgba(76, 175, 80, 0.05); border: 1px dashed var(--primary-green)"
              >
                <label class="qty-label">Taxa de Produção (Sucesso)</label>
                <span class="qty-value" style="color: #2e7d32"
                  >{{ colheitaSelecionada.taxaProducao }}%</span
                >
              </div>

              <div style="display: flex; gap: 15px; grid-column: 1 / -1; margin-top: 5px">
                <div
                  class="detail-item"
                  style="flex: 1; background: #f9f9f9; padding: 12px; border-radius: 8px"
                >
                  <label style="font-size: 0.8rem">Volume Aproveitado</label>
                  <span
                    style="
                      color: #2e7d32;
                      font-weight: bold;
                      display: block;
                      margin-top: 5px;
                      font-size: 1.1rem;
                    "
                  >
                    {{ parseFloat(colheitaSelecionada.quantidade_colhida) }}
                  </span>
                </div>

                <div
                  class="detail-item"
                  style="flex: 1; background: #fff5f5; padding: 12px; border-radius: 8px"
                  v-if="parseFloat(colheitaSelecionada.quantidade_perda) > 0"
                >
                  <label style="font-size: 0.8rem; color: #c62828">Volume Descartado</label>
                  <span
                    style="
                      color: #c62828;
                      font-weight: bold;
                      display: block;
                      margin-top: 5px;
                      font-size: 1.1rem;
                    "
                  >
                    {{ parseFloat(colheitaSelecionada.quantidade_perda) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="detalhe-placeholder"
            style="text-align: center; color: #aaa; margin-top: 100px"
          >
            <span class="material-symbols-outlined" style="font-size: 3.5rem">shopping_basket</span>
            <p>Selecione um registro no histórico ao lado ou inicie uma nova colheita.</p>
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import WeatherWidget from '@/components/WeatherWidget.vue'
import PageLayout from '@/components/PageLayout.vue'

const lotesAtivos = ref([])
const lotesGerais = ref([])
const culturas = ref([])
const colheitas = ref([])
const funcionarios = ref([])

const modoCadastro = ref(false)
const colheitaSelecionada = ref(null)
const busca = ref('')

const form = ref({
  lote_id: '',
  quantidade_colhida: 0,
  quantidade_perda: 0,
})

const loteSelecionadoParaColheita = computed(() => {
  return lotesAtivos.value.find((l) => l.id === form.value.lote_id) || null
})

watch(
  () => form.value.lote_id,
  (novoLoteId) => {
    if (novoLoteId) {
      const lote = lotesAtivos.value.find((l) => l.id === novoLoteId)
      if (lote) {
        form.value.quantidade_colhida = parseFloat(lote.quantidade)
        form.value.quantidade_perda = 0
      }
    }
  },
)

watch(
  () => form.value.quantidade_colhida,
  (novoValor) => {
    if (loteSelecionadoParaColheita.value) {
      const total = parseFloat(loteSelecionadoParaColheita.value.quantidade)
      const colhido = parseFloat(novoValor)
      const perda = total - colhido

      form.value.quantidade_perda = perda > 0 ? perda : 0
    }
  },
)

const historicoEnriquecido = computed(() => {
  return colheitas.value
    .map((colheita) => {
      const loteOrigem = lotesGerais.value.find((l) => l.id === colheita.lote_id)
      let nomeCultura = 'Cultura Desconhecida'
      if (loteOrigem) {
        const cultura = culturas.value.find((c) => c.id === loteOrigem.cultura_id)
        if (cultura) nomeCultura = cultura.nome_cultura
      }

      const auditor = funcionarios.value.find(
        (f) => String(f.id) === String(colheita.funcionario_id),
      )
      let nomeAuditor = `Auditor #${colheita.funcionario_id}`
      if (auditor) {
        nomeAuditor =
          auditor.nome ||
          auditor.nome_completo ||
          auditor.first_name ||
          auditor.username ||
          nomeAuditor
      }

      // ALTERADO AQUI: Cálculo da Taxa de Produção Específica do Lote
      const colhido = parseFloat(colheita.quantidade_colhida) || 0
      const perda = parseFloat(colheita.quantidade_perda) || 0
      const totalProcessado = colhido + perda

      // Calcula a porcentagem ou zera se der divisão por zero
      const taxaProducao =
        totalProcessado > 0 ? ((colhido / totalProcessado) * 100).toFixed(1) : '0.0'

      return { ...colheita, nomeCultura, nomeAuditor, taxaProducao }
    })
    .reverse()
})

const historicoFiltrado = computed(() => {
  return historicoEnriquecido.value.filter(
    (c) =>
      c.nomeCultura.toLowerCase().includes(busca.value.toLowerCase()) ||
      c.lote_id.toString().includes(busca.value),
  )
})

const carregarDados = async () => {
  const headers = { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  try {
    const [resLotes, resCulturas, resColheitas, resFuncionarios] = await Promise.all([
      fetch('/api/lotes/', { headers }),
      fetch('/api/cultura/', { headers }),
      fetch('/api/colheita/', { headers }),
      fetch('/api/funcionarios/', { headers }),
    ])

    if (resLotes.ok) {
      lotesGerais.value = await resLotes.json()
      lotesAtivos.value = lotesGerais.value.filter((l) => l.status !== 'CO' && l.status !== 'PE')
    }
    if (resCulturas.ok) culturas.value = await resCulturas.json()
    if (resColheitas.ok) colheitas.value = await resColheitas.json()
    if (resFuncionarios.ok) funcionarios.value = await resFuncionarios.json()
  } catch (err) {
    console.error('Erro na carga de dados:', err)
  }
}

const selecionar = (c) => {
  colheitaSelecionada.value = c
  modoCadastro.value = false
}

const salvarColheita = async () => {
  const token = localStorage.getItem('access_token')
  const payload = {
    ...form.value,
    data_colheita: new Date().toISOString().split('T')[0],
  }

  try {
    const res = await fetch('/api/colheita/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      alert('Colheita registrada! O lote foi finalizado.')
      form.value = { lote_id: '', quantidade_colhida: 0, quantidade_perda: 0 }
      modoCadastro.value = false
      await carregarDados()
    } else {
      const erroDRF = await res.json()
      alert('Erro ao salvar: \n\n' + JSON.stringify(erroDRF, null, 2))
    }
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => carregarDados())
</script>

<style scoped>
/* Estilizando o Slider para ficar com a cara do sistema */
.harvest-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(90deg, #d32f2f, var(--primary-green));
  outline: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.harvest-slider:hover {
  opacity: 1;
}

.harvest-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid var(--primary-dark);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.harvest-slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid var(--primary-dark);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
