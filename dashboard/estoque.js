// --- 1. LÓGICA DO RELÓGIO E CLIMA (TEMPO REAL) ---
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("pt-BR", { hour12: false });
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    clockElement.textContent = timeString;
  }
}
setInterval(updateClock, 1000);
updateClock();

// --- 2. DADOS SIMULADOS (Banco de Dados em Memória) ---
let sementesBD = [
  {
    id: "L-ALF-001",
    cultura: "Alface Americana",
    fornecedor: "Sementes Brasil Ltda",
    validade: "2026-10-15",
    custo: "12,50",
    quantidade: "500",
    unidade: "g",
    statusClasse: "badge-good",
    statusTexto: "Em Estoque",
  },
  {
    id: "L-TOM-042",
    cultura: "Tomate Cereja",
    fornecedor: "AgroTec Insumos",
    validade: "2026-08-02",
    custo: "45,00",
    quantidade: "50",
    unidade: "unid.",
    statusClasse: "badge-low",
    statusTexto: "Estoque Baixo",
  },
  {
    id: "L-RUC-012",
    cultura: "Rúcula Cultivada",
    fornecedor: "Sementes do Vale",
    validade: "2026-05-20",
    custo: "08,20",
    quantidade: "0",
    unidade: "g",
    statusClasse: "badge-out",
    statusTexto: "Esgotado",
  },
];

let sementeSelecionadaId = sementesBD[0].id; // Inicializa com o primeiro item

// --- 3. RENDERIZAR LISTA LATERAL ---
function renderizarLista() {
  const listaDiv = document.getElementById("lista-sementes");
  if (!listaDiv) return;

  listaDiv.innerHTML = "";

  sementesBD.forEach((semente) => {
    const isAtivo = semente.id === sementeSelecionadaId ? "active" : "";
    const cardHtml = `
            <div class="mini-card ${isAtivo}" onclick="selecionarSemente('${semente.id}')">
                <div class="mini-card-header">
                    <h4>${semente.id}</h4>
                    <span class="badge ${semente.statusClasse}">${semente.statusTexto}</span>
                </div>
                <div class="mini-card-cultura">${semente.cultura}</div>
                <div class="mini-card-qty">
                    ${semente.quantidade}${semente.unidade}
                </div>
            </div>
        `;
    listaDiv.innerHTML += cardHtml;
  });
}

// --- 4. EXIBIR DETALHES DE UMA SEMENTE NA DIREITA ---
function selecionarSemente(id) {
  sementeSelecionadaId = id;
  renderizarLista();

  const semente = sementesBD.find((s) => s.id === id);
  const painel = document.getElementById("painel-principal");
  if (!painel) return;

  // Formatação de data simples
  const dataParts = semente.validade.split("-");
  const dataBR =
    dataParts.length === 3
      ? `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`
      : semente.validade;

  painel.innerHTML = `
        <div class="detail-header">
            <h2><span class="material-symbols-outlined">qr_code_2</span> ${semente.id}</h2>
            <span class="badge ${semente.statusClasse} badge-detail">${semente.statusTexto}</span>
        </div>
        
        <div class="detail-grid">
            <div class="detail-item">
                <label>Cultura / Semente</label>
                <span>${semente.cultura}</span>
            </div>
            <div class="detail-item">
                <label>Fornecedor</label>
                <span>${semente.fornecedor}</span>
            </div>
            <div class="detail-item">
                <label>Data de Validade</label>
                <span>${dataBR}</span>
            </div>
            <div class="detail-item">
                <label>Custo Unitário</label>
                <span>R$ ${semente.custo}</span>
            </div>
            <div class="detail-item full-width qty-destaque">
                <label class="qty-label">Quantidade em Estoque</label>
                <span class="qty-value"><span class="material-symbols-outlined" style="vertical-align: middle;">scale</span> ${semente.quantidade} ${semente.unidade}</span>
            </div>
        </div>

        <div class="form-actions">
            <button class="btn-delete" onclick="excluirSemente('${semente.id}')"><span class="material-symbols-outlined">delete</span> Excluir Lote</button>
            <button class="btn-save"><span class="material-symbols-outlined">edit</span> Editar Lote</button>
        </div>
    `;
}

// --- 5. ABRIR FORMULÁRIO DE CADASTRO ---
function abrirFormularioNovo() {
  sementeSelecionadaId = null;
  renderizarLista();

  const painel = document.getElementById("painel-principal");
  const novoId = "L-" + Math.floor(Math.random() * 900 + 100);

  painel.innerHTML = `
        <div class="detail-header">
            <h2><span class="material-symbols-outlined">add_circle</span> Novo Lote de Insumo</h2>
            <span class="detail-header-id">ID Automático: ${novoId}</span>
        </div>

        <form id="formNovaSemente" onsubmit="salvarNovaSemente(event, '${novoId}')">
            <div class="form-grid-layout">
                <div class="form-group full-width">
                    <label>Cultura / Tipo de Semente</label>
                    <input type="text" id="inputCultura" placeholder="Ex: Alface Crespa" required>
                </div>
                <div class="form-group full-width">
                    <label>Fornecedor</label>
                    <input type="text" id="inputFornecedor" placeholder="Ex: Agro Sementes S.A" required>
                </div>
                
                <div class="form-group">
                    <label>Data de Validade</label>
                    <input type="date" id="inputValidade" required>
                </div>
                <div class="form-group">
                    <label>Custo Unitário (R$)</label>
                    <input type="text" id="inputCusto" placeholder="Ex: 15,90" required>
                </div>

                <div class="form-group">
                    <label>Quantidade Inicial</label>
                    <input type="number" id="inputQuantidade" placeholder="Ex: 1000" required>
                </div>
                <div class="form-group">
                    <label>Unidade de Medida</label>
                    <select id="inputUnidade" required>
                        <option value="g">Gramas (g)</option>
                        <option value="kg">Quilogramas (kg)</option>
                        <option value="unid.">Unidades (unid.)</option>
                    </select>
                </div>
            </div>

            <div class="form-actions-right">
                <button type="button" class="btn-outline" onclick="cancelarCadastro()">Cancelar</button>
                <button type="submit" class="btn-save"><span class="material-symbols-outlined">save</span> Registrar Lote</button>
            </div>
        </form>
    `;
}

// --- 6. SALVAR NOVA SEMENTE ---
function salvarNovaSemente(event, novoId) {
  event.preventDefault();

  const novaSemente = {
    id: novoId,
    cultura: document.getElementById("inputCultura").value,
    fornecedor: document.getElementById("inputFornecedor").value,
    validade: document.getElementById("inputValidade").value,
    custo: document.getElementById("inputCusto").value,
    quantidade: document.getElementById("inputQuantidade").value,
    unidade: document.getElementById("inputUnidade").value,
    statusClasse: "badge-good",
    statusTexto: "Em Estoque",
  };

  sementesBD.unshift(novaSemente);
  selecionarSemente(novoId);
}

// --- 7. EXCLUIR SEMENTE ---
function excluirSemente(id) {
  if (confirm("Tem certeza que deseja excluir o lote " + id + "?")) {
    sementesBD = sementesBD.filter((s) => s.id !== id);
    if (sementesBD.length > 0) {
      selecionarSemente(sementesBD[0].id);
    } else {
      document.getElementById("painel-principal").innerHTML =
        "<h3 style='color:#777; text-align:center; padding: 50px;'>Estoque Vazio. Adicione um novo lote.</h3>";
      document.getElementById("lista-sementes").innerHTML = "";
    }
  }
}

// --- 8. CANCELAR CADASTRO ---
function cancelarCadastro() {
  if (sementesBD.length > 0) {
    selecionarSemente(sementesBD[0].id);
  } else {
    document.getElementById("painel-principal").innerHTML = "";
  }
}

// Inicializa tudo quando a tela carrega
window.onload = () => {
  renderizarLista();
  if (sementesBD.length > 0) {
    selecionarSemente(sementesBD[0].id);
  }
};
