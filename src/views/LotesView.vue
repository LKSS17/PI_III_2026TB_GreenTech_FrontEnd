<template>
  <Sidebar />

  <main class="main-content">
    <header class="dash-header">
      <div class="header-titles">
        <h1>Lotes e IDs 🔖</h1>
        <p>Consulta, rastreio e visualização de QR Codes dos lotes de tubetes alocados.</p>
      </div>
      <WeatherWidget />
    </header>

    <div class="lotes-action-bar">
      <div class="search-box-estoque" style="width: 350px; display: flex; align-items: center; border: 1px solid var(--glass-border); border-radius: 12px; padding: 0 15px; background: var(--glass-bg);">
        <span class="material-symbols-outlined search-icon" style="color: var(--primary-green);">search</span>
        <input type="text" class="search-input" v-model="termoBusca" placeholder="Buscar por ID, cultura..." style="border: none; background: transparent; padding: 12px 10px; width: 100%; outline: none;" />
      </div>

      <div class="lotes-filtros">
        <button class="filtro-btn" :class="{ active: filtroStatus === 'todos' }" @click="filtroStatus = 'todos'">Todos</button>
        <button class="filtro-btn" :class="{ active: filtroStatus === 'cultivo' }" @click="filtroStatus = 'cultivo'">Em Desenvolvimento</button>
        <button class="filtro-btn" :class="{ active: filtroStatus === 'colheita' }" @click="filtroStatus = 'colheita'">Pronto p/ Colheita</button>
        <button class="filtro-btn" :class="{ active: filtroStatus === 'colhido' }" @click="filtroStatus = 'colhido'">Colhido</button>
      </div>
    </div>

    <section class="lotes-split-view">
      <div class="lotes-lista">
        <div v-if="lotesFiltrados.length === 0" style="color:#aaa;text-align:center;padding:30px;">Nenhum lote encontrado.</div>
        <div
          v-else
          v-for="l in lotesFiltrados"
          :key="l.id"
          class="lote-card"
          :class="{ active: l.id === loteSelecionado?.id }"
          @click="selecionarLote(l)"
        >
          <div class="lote-card-header">
            <div class="lote-card-id">{{ l.id }}</div>
            <span class="badge" :class="getBadgeClass(l.status)">{{ getBadgeText(l.status) }}</span>
          </div>
          <div class="lote-card-cultura">{{ l.cultura }} · {{ l.estufa }} · {{ l.mesa }}</div>
          <div class="lote-card-meta">
            <span><span class="material-symbols-outlined" style="font-size:0.85rem;vertical-align:middle">calendar_today</span> {{ l.dataAlocacao }}</span>
            <span><span class="material-symbols-outlined" style="font-size:0.85rem;vertical-align:middle">person</span> {{ l.responsavel }}</span>
          </div>
        </div>
      </div>

      <div class="lote-detalhe-panel">
        <div v-if="!loteSelecionado" class="detalhe-placeholder" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#aaa;">
          <span class="material-symbols-outlined" style="font-size:3rem;color:#ccc">qr_code_2</span>
          <p>Selecione um lote para ver o QR Code e detalhes</p>
        </div>

        <div v-else>
          <div class="lote-detalhe-titulo">
            <span class="material-symbols-outlined">qr_code_2</span>
            {{ loteSelecionado.id }}
            <span class="badge" :class="getBadgeClass(loteSelecionado.status)">{{ getBadgeText(loteSelecionado.status) }}</span>
          </div>

          <div class="lote-info-grid">
            <div class="lote-info-item"><label>Cultura</label><span>{{ loteSelecionado.cultura }}</span></div>
            <div class="lote-info-item"><label>Responsável</label><span>{{ loteSelecionado.responsavel }}</span></div>
            <div class="lote-info-item"><label>Estufa / Mesa</label><span>{{ loteSelecionado.estufa }} · {{ loteSelecionado.mesa }}</span></div>
            <div class="lote-info-item"><label>Lote de Origem (Tubetes)</label><span>{{ loteSelecionado.tubetes }}</span></div>
            <div class="lote-info-item"><label>Data de Alocação</label><span>{{ loteSelecionado.dataAlocacao }}</span></div>
            <div class="lote-info-item"><label>Previsão de Colheita</label><span>{{ loteSelecionado.previsaoColheita }}</span></div>
          </div>

          <h4 style="font-family:'Poppins',sans-serif;color:var(--primary-green);font-size:0.9rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
            <span class="material-symbols-outlined" style="font-size:1.1rem">timeline</span> Rastreabilidade
          </h4>

          <div class="timeline">
            <div v-for="h in loteSelecionado.historico" :key="h.evento" class="timeline-item">
              <div class="timeline-dot" :class="{ pending: !h.feito }">
                <span class="material-symbols-outlined" style="font-size:0.95rem">{{ h.feito ? 'check' : 'radio_button_unchecked' }}</span>
              </div>
              <div class="timeline-content">
                <div class="timeline-titulo">{{ h.evento }}</div>
                <div class="timeline-data">{{ h.data }}</div>
              </div>
            </div>
          </div>

          <div class="qr-section">
            <canvas ref="qrCanvasRef" width="160" height="160"></canvas>
            <p>QR Code do lote — escaneie para rastrear</p>
            <button class="btn-imprimir" @click="imprimirQR">
              <span class="material-symbols-outlined">print</span> Imprimir QR Code
            </button>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from "@/components/Footer.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";

const termoBusca = ref('');
const filtroStatus = ref('todos');
const loteSelecionado = ref(null);
const qrCanvasRef = ref(null);

// Lógica de "Tubetes" e "Alocação" aplicadas
const lotesBD = ref([
  {
    id: "GT-2026-0041", cultura: "Alface Americana", estufa: "Estufa 01", mesa: "M-01", responsavel: "Lucas", tubetes: "L-TUB-001", dataAlocacao: "10/04/2026", previsaoColheita: "24/04/2026", status: "cultivo",
    historico: [
      { evento: "Tubetes recebidos (Estoque)", data: "05/04/2026", feito: true },
      { evento: "Alocação na mesa realizada", data: "10/04/2026", feito: true },
      { evento: "Irrigação ativada", data: "10/04/2026", feito: true },
      { evento: "Colheita prevista", data: "24/04/2026", feito: false },
    ],
  },
  {
    id: "GT-2026-0042", cultura: "Rúcula Cultivada", estufa: "Estufa 01", mesa: "M-02", responsavel: "Lucas", tubetes: "L-TUB-012", dataAlocacao: "28/03/2026", previsaoColheita: "22/04/2026", status: "colheita",
    historico: [
      { evento: "Tubetes recebidos (Estoque)", data: "24/03/2026", feito: true },
      { evento: "Alocação na mesa realizada", data: "28/03/2026", feito: true },
      { evento: "Colheita prevista", data: "22/04/2026", feito: true },
    ],
  }
]);

const lotesFiltrados = computed(() => {
  return lotesBD.value.filter(l => {
    const passaStatus = filtroStatus.value === 'todos' || l.status === filtroStatus.value;
    const busca = termoBusca.value.toLowerCase();
    const passaBusca = l.id.toLowerCase().includes(busca) || l.cultura.toLowerCase().includes(busca) || l.responsavel.toLowerCase().includes(busca);
    return passaStatus && passaBusca;
  });
});

const getBadgeClass = (status) => {
  const m = { cultivo: "badge-good", colheita: "badge-low", colhido: "badge-out" };
  return m[status] || "badge-good";
};

const getBadgeText = (status) => {
  const m = { cultivo: "Em Desenvolvimento", colheita: "Pronto p/ Colheita", colhido: "Colhido" };
  return m[status] || status;
};

const selecionarLote = async (lote) => {
  loteSelecionado.value = lote;
  await nextTick(); // Aguarda a ref do Canvas ser criada
  gerarQRCode(lote.id);
};

// O Seu Algoritmo de QR CODE!
const gerarQRCode = (texto) => {
  if (!qrCanvasRef.value) return;
  const ctx = qrCanvasRef.value.getContext("2d");
  const size = qrCanvasRef.value.width;
  const cor = "#3a5a40";

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);

  const N = 21;
  const cell = Math.floor(size / N);
  const matrix = gerarMatrizQR(texto, N);

  ctx.fillStyle = cor;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (matrix[r][c]) ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
    }
  }

  const desenharFinder = (x, y) => {
    ctx.fillStyle = cor; ctx.fillRect(x, y, 7 * cell, 7 * cell);
    ctx.fillStyle = "white"; ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
    ctx.fillStyle = cor; ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
  };

  desenharFinder(0, 0);
  desenharFinder((N - 7) * cell, 0);
  desenharFinder(0, (N - 7) * cell);
};

const gerarMatrizQR = (texto, N) => {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) { hash = ((hash << 5) - hash) + texto.charCodeAt(i); hash |= 0; }
  const matrix = [];
  for (let r = 0; r < N; r++) {
    matrix[r] = [];
    for (let c = 0; c < N; c++) {
      const seed = hash ^ (r * 31 + c * 17);
      matrix[r][c] = ((seed * 1664525 + 1013904223) & 0x80) !== 0;
    }
  }
  return matrix;
};

const imprimirQR = () => {
  const url = qrCanvasRef.value.toDataURL();
  const id = loteSelecionado.value.id;
  const janela = window.open('', '_blank', 'width=400,height=500');
  janela.document.write(`
      <html lang=""><head><title>QR Code — ${id}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;gap:20px;">
          <h2 style="color:#3a5a40;font-size:1rem">GreenTech ERP</h2>
          <img src="${url}" width="200"  alt=""/>
          <p style="font-weight:700;color:#344e41">${id}</p>
          <script>window.onload = () => window.print();<\/script>
      </body></html>
  `);
};
</script>
