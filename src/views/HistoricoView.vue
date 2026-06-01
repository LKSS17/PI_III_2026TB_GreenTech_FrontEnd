<template>
  <Sidebar />

  <main class="main-content">
    <DashHeader
      title="Auditoria do Sistema"
      subtitle="Registro global de inserções, alterações e exclusões (Acesso Restrito)."
    />

    <section class="auditoria-container">
      <div class="auditoria-card">

        <div class="card-header">
          <h3 style="display: flex; align-items: center; gap: 8px; color: var(--primary-dark); font-size: 1.2rem;">
            <span class="material-symbols-outlined" style="color: var(--primary-green);">policy</span>
            Logs de Atividade
          </h3>

          <button class="btn-outline" @click="carregarLogs" :disabled="carregando">
            <span class="material-symbols-outlined" :class="{ 'spinning': carregando }">refresh</span>
            {{ carregando ? 'Atualizando...' : 'Atualizar Logs' }}
          </button>
        </div>

        <div v-if="erro" class="alert-error">
          <span class="material-symbols-outlined">gpp_bad</span>
          <div>
            <strong>Acesso Bloqueado ou Falha na Requisição</strong><br>
            {{ erro }}
          </div>
        </div>

        <div class="table-responsive" v-else>
          <table class="auditoria-table">
            <thead>
            <tr>
              <th>Data e Hora</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Módulo Afetado</th>
              <th>Detalhes / Histórico</th>
              <th>Registro</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="carregando && logs.length === 0">
              <td colspan="6" style="text-center; padding: 40px; color: #888;">
                <div style="display:flex; justify-content:center; align-items:center; gap: 10px;">
                  <span class="material-symbols-outlined spinning">sync</span> Buscando dados seguros...
                </div>
              </td>
            </tr>

            <tr v-else-if="logs.length === 0">
              <td colspan="6" style="text-align: center; padding: 40px; color: #888;">
                Nenhum registro de auditoria foi encontrado no banco de dados.
              </td>
            </tr>

            <tr v-else v-for="log in logs" :key="log.id_log">
              <td class="col-data" style="white-space: nowrap;">{{ formatarData(log.data_hora) }}</td>
              <td class="col-user">
                  <span class="user-badge">
                    <span class="material-symbols-outlined" style="font-size: 1rem; vertical-align: text-bottom;">person</span>
                    {{ log.usuario }}
                  </span>
              </td>
              <td>
                  <span class="badge-acao" :class="badgeClass(log.acao)">
                    {{ log.acao }}
                  </span>
              </td>
              <td class="col-tabela" style="font-family: monospace; color: #555;">{{ log.tabela_afetada }}</td>
              <td class="col-detalhes" style="color: #666; font-size: 0.85rem; max-width: 300px;">
                {{ log.detalhes || 'Sem detalhes adicionais.' }}
              </td>
              <td class="col-registro" style="font-weight: 600; color: var(--primary-dark);">{{ log.registro_afetado }}</td>
            </tr>
            </tbody>
          </table>
        </div>

      </div>
    </section>

    <Footer />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from '@/components/Footer.vue';
import DashHeader from '@/components/DashHeader.vue';

const logs = ref([]);
const carregando = ref(false);
const erro = ref('');

const carregarLogs = async () => {
  carregando.value = true;
  erro.value = '';
  const token = localStorage.getItem('access_token');

  try {
    const res = await fetch('http://127.0.0.1:8000/api/funcionarios/auditoria/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 403) {
        erro.value = "Suas credenciais não possuem o nível de 'Gerente' ou 'Admin' necessário para visualizar a auditoria.";
      } else {
        erro.value = "Falha ao se comunicar com o servidor de logs.";
      }
      return;
    }

    logs.value = await res.json();
  } catch (e) {
    console.error("Erro ao buscar auditoria:", e);
    erro.value = "Erro de conexão. Verifique se a API do Django está rodando.";
  } finally {
    carregando.value = false;
  }
};

const formatarData = (dataStr) => {
  const data = new Date(dataStr);
  return data.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

// Define a cor da badge baseado na ação do banco de dados
const badgeClass = (acao) => {
  if (acao === 'ADICIONOU') return 'badge-add';
  if (acao === 'MODIFICOU') return 'badge-edit';
  if (acao === 'DELETOU') return 'badge-delete';
  return 'badge-default';
};

onMounted(() => {
  carregarLogs();
});
</script>

<style scoped>
.auditoria-container {
  padding: 0 40px 40px;
}

.auditoria-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 15px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ccc;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-outline:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #aaa;
  color: #333;
}

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert-error {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  color: #c62828;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.alert-error .material-symbols-outlined {
  font-size: 2rem;
}

/* Tabela de Auditoria */
.table-responsive {
  overflow-x: auto;
}

.auditoria-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.auditoria-table th {
  background: rgba(0,0,0,0.03);
  color: var(--primary-dark);
  padding: 14px 15px;
  text-align: left;
  font-weight: 700;
  border-bottom: 2px solid rgba(0,0,0,0.05);
  white-space: nowrap;
}

.auditoria-table td {
  padding: 14px 15px;
  border-bottom: 1px solid rgba(0,0,0,0.03);
  vertical-align: middle;
}

.auditoria-table tr:hover {
  background-color: rgba(255,255,255,0.6);
}

/* Badges e Estilos Específicos */
.user-badge {
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  color: #444;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-acao {
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  display: inline-block;
  text-align: center;
}

.badge-add { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.badge-edit { background: #e3f2fd; color: #1565c0; border: 1px solid #bbdefb; }
.badge-delete { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
.badge-default { background: #f5f5f5; color: #616161; border: 1px solid #e0e0e0; }

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
