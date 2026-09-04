# GreenTech — Front-End (PI_III_2026TB)

Sistema de Gestão Agrícola e Monitoramento Inteligente de Estufas desenvolvido para o Projeto Interdisciplinar III (Sistemas de Informação — FHO | Uniararas).

---

## Stack Tecnológica

* **Framework:** Vue 3.5 (Composition API com `<script setup>`)
* **Build Tool & Bundler:** Vite 8
* **Roteamento:** Vue Router 5 (com Lazy Loading assíncrono e Route Guards)
* **Gerenciamento de Estado:** Pinia 3
* **Estilização:** CSS Modular em camadas com Design Tokens nativos (`01-tokens` a `06-responsive`)
* **Comunicação:** Client HTTP centralizado (`services/api.js`) com interceptação de tokens JWT e auto-refresh
* **Ícones:** Material Symbols (Google), sem emojis hardcoded na UI

---

## Módulos & Funcionalidades

### 1. ERP Agrícola & Gestão de Campo
* **Autenticação & Controle de Acesso:** Sessão com JWT (`access_token` e `refresh_token`) e controle por papéis via Grupos do Django (Operador, Técnico, Gerente e Administrador).
* **Dashboard Executivo:** Métricas consolidadas de produção, telemetria em tempo real e atalhos rápidos.
* **Culturas, Lotes e Colheitas:** Cadastro, rastreabilidade e acompanhamento do ciclo de vida das plantações, com barra de progresso de maturação por lote.
* **Telemetria de Sensores IoT:** Visualização de temperatura, umidade e luminosidade com tabelas responsivas.
* **Gêmeo Virtual da Estufa:** Mapeamento espacial das mesas de cultivo (`GerenciadorLayoutView`).
* **Auditoria & Rastreabilidade:** Histórico imutável de ações com conversão automática de tabelas em cards no mobile.

### 2. Inteligência Artificial Integrada (Arquitetura Plug-and-Play)
* **RF09 — Previsão de Estoque (Prophet):** Projeção inteligente da curva de consumo e data estimada de término por insumo (`PrevisaoEstoqueWidget`).
* **RF10 — Irrigação Inteligente (Scikit-learn):** Alternância entre modo manual e autônomo baseado em árvores de decisão, com registro de explicabilidade agronômica (`IrrigacaoView`).
* **RF11 — Importação de NF-e via OCR (Tesseract):** Upload de documento fiscal com leitura automatizada e interface de conferência manual antes da entrada em estoque (`NotaFiscalOcrView`).
* **RF12 — Assistente Virtual Inteligente (NLP/LLM):** Chatbot flutuante integrado para consultas de status e comandos operacionais em linguagem natural (`ChatAssistantModal`).

> **Arquitetura Plug-and-Play:** Todos os módulos de IA conectam-se prioritariamente aos endpoints do back-end Django REST Framework. Caso os modelos ou rotas do servidor ainda estejam em desenvolvimento ou temporariamente indisponíveis, a interface ativa um modo de contingência/simulação transparente sem interromper a navegação.

---

## Responsividade & Acessibilidade (WCAG 2.1 AA)

* **Ergonomia de Campo:** Áreas de toque mínimas (*touch targets*) de 44×44px em botões, paginações e seletores para uso seguro em tablets e smartphones.
* **Telas Ultra-largas (Ultrawide / 2K / 4K):** Layout contido com limite de largura de leitura (`max-width: 1440px`).
* **Navegação por Teclado:** Suporte a *Skip to Content* (atalho para pular navegação) e anéis de foco visíveis (`:focus-visible`).
* **Sensibilidade de Movimento:** Adaptação automática a `prefers-reduced-motion` para usuários sensíveis a animações.
* **Resiliência de Rede:** Detecção de queda de conectividade celular em tempo real com alerta discreto ao operador rural.

---

## Arquitetura de Componentes

Para evitar duplicação entre as telas, o layout comum de toda página autenticada foi extraído em componentes compartilhados:

| Componente | Responsabilidade |
|---|---|
| `PageLayout.vue` | Esqueleto padrão de página: `Sidebar` + `main.main-content` + `DashHeader` + `Footer`. Toda view autenticada renderiza seu conteúdo dentro dele, via slot padrão e slot nomeado `#header-actions` |
| `DashHeader.vue` | Cabeçalho da página (título, subtítulo e o `MobileMenuButton`); aceita widgets extras (ex: `WeatherWidget`, filtros) via slot |
| `Sidebar.vue` | Menu lateral de navegação; controla sua própria visibilidade no mobile através do composable `useSidebar` |
| `MobileMenuButton.vue` | Botão de hambúrguer, visível apenas em telas ≤768px; aciona o mesmo estado compartilhado que a `Sidebar` escuta |
| `WeatherWidget.vue` | Widget de condições climáticas exibido no cabeçalho das páginas operacionais |
| `ChatAssistantModal.vue` | Assistente virtual (RF12), montado globalmente no `App.vue` quando o usuário está autenticado |
| `ToastContainer.vue` | Notificações globais (sucesso/erro), consumidas via `stores/toast.js` |

### Estado compartilhado (composables)

* **`useSidebar.js`** — expõe um `ref` de estado (`isOpen`) definido no escopo do módulo, funcionando como um mini-store: qualquer componente que chame `useSidebar()` compartilha a mesma instância, sem precisar de `provide`/`inject` ou prop-drilling pelas views.

### Convenção para novas telas

Toda nova view autenticada deve seguir este esqueleto mínimo:

```vue
<template>
  <PageLayout title="Título da Página" subtitle="Descrição curta.">
    <template #header-actions>
      <WeatherWidget /> <!-- opcional -->
    </template>

    <section class="conteudo-especifico-da-tela">
      <!-- ... -->
    </section>
  </PageLayout>
</template>
```

Isso garante que o hambúrguer mobile, o padding do conteúdo e o rodapé fiquem consistentes automaticamente, sem precisar copiar `Sidebar` + `Footer` + CSS de cabeçalho em cada arquivo.

---

## Configuração do Ambiente & Execução

### Pré-requisitos
* Node.js `^20.19.0` ou `>=22.12.0`
* `npm` (usado pelo Dockerfile do projeto) ou `pnpm`, se preferir rodar localmente sem Docker

### Recomendação de IDE & Navegador
* [VS Code](https://code.visualstudio.com/) + extensão [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (desative a extensão legada Vetur).
* [Vue.js Devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) instalado no navegador.

---

## Executando com Docker (recomendado)

A forma mais rápida de rodar o sistema completo (frontend + backend + PostgreSQL) é através do `docker-compose.yml` que vive no repositório do **backend**, já configurado para orquestrar os três serviços juntos.

### 1. Clonar os dois repositórios

```bash
git clone https://github.com/LKSS17/PI_III_2026TB_GreenTech_FrontEnd.git
git clone https://github.com/felipegco/PI_III_2026TB_GreenTech_Backend.git
```

*(Podem ficar em pastas completamente separadas no seu computador.)*

### 2. Configurar e subir pelo backend

```bash
cd PI_III_2026TB_GreenTech_Backend/docker-greentech
cp .env.example .env
# edite o .env com o caminho absoluto de onde este repositório (frontend) foi clonado
docker compose up --build
```

Instruções completas (variáveis, portas, superusuário) estão no README do [repositório do backend](https://github.com/felipegco/PI_III_2026TB_GreenTech_Backend).

Depois de subir, o frontend fica disponível em **http://localhost:5173/**, já apontando (via proxy do Vite) para a API rodando em `http://backend:8000` dentro da rede do Docker.

### Rodando só o frontend via Docker (sem o backend)

Se você só quer testar a interface isoladamente (sem banco/API), o `Dockerfile` deste repositório também funciona sozinho:

```bash
docker build -t greentech-frontend .
docker run -p 5173:5173 greentech-frontend
```

Nesse modo, as chamadas à API vão falhar (não há backend rodando) — útil apenas para revisar layout/estilo.

---

## Executando Localmente (sem Docker)

### Instalação das Dependências

```sh
npm install
```

### Servidor de desenvolvimento (hot-reload)

```sh
npm run dev
```

Por padrão, o `vite.config.js` faz proxy de `/api` para `http://127.0.0.1:8000` — ou seja, você precisa do backend rodando localmente nessa porta (veja o README do [repositório do backend](https://github.com/felipegco/PI_III_2026TB_GreenTech_Backend)).

Se o backend estiver em outro endereço, defina a variável de ambiente antes de subir o Vite:

```sh
VITE_API_TARGET=http://localhost:8000 npm run dev
```

### Build de produção

```sh
npm run build
```

### Preview do build de produção

```sh
npm run preview
```

### Lint e formatação

```sh
npm run lint      # oxlint + eslint, com correção automática
npm run format    # prettier
```

---

## Estrutura do Projeto

```
PI_III_2026TB_GreenTech_FrontEnd/
├── Dockerfile
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── favicon.ico
└── src/
    ├── App.vue
    ├── main.js
    ├── assets/
    │   ├── 01-tokens.css … 06-responsive.css
    │   ├── img/
    │   └── JS/
    │       └── verificarPermissao.js
    ├── components/
    │   ├── PageLayout.vue
    │   ├── DashHeader.vue
    │   ├── Sidebar.vue
    │   ├── MobileMenuButton.vue
    │   ├── WeatherWidget.vue
    │   ├── PrevisaoEstoqueWidget.vue
    │   ├── ChatAssistantModal.vue
    │   ├── ToastContainer.vue
    │   ├── ModalConfirmacao.vue
    │   ├── ActionCard.vue
    │   ├── SkeletonLoader.vue
    │   ├── ToggleSwitch.vue
    │   └── Footer.vue
    ├── composables/
    │   └── useSidebar.js
    ├── router/
    │   └── index.js
    ├── services/
    │   └── api.js
    ├── stores/
    │   ├── auth.js
    │   ├── toast.js
    │   └── counter.js
    └── views/
        ├── HomeView.vue          (login)
        ├── DashboardView.vue
        ├── CulturasView.vue
        ├── LotePlantioView.vue
        ├── ColheitasView.vue
        ├── EstoqueView.vue
        ├── SensoresView.vue
        ├── IrrigacaoView.vue
        ├── NotaFiscalOcrView.vue
        ├── AlertasView.vue
        ├── HistoricoView.vue
        ├── GerenciadorLayoutView.vue
        ├── PerfilView.vue
        └── ConfiguracaoView.vue
```

---

## Backend

A API (Django REST Framework + PostgreSQL) vive em um repositório separado:
[PI_III_2026TB_GreenTech_Backend](https://github.com/felipegco/PI_III_2026TB_GreenTech_Backend)

Ao usar Docker (ver seção acima), ele já sobe junto automaticamente.
