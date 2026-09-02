# GreenTech — Front-End (PI_III_2026TB)

Sistema de Gestão Agrícola e Monitoramento Inteligente de Estufas desenvolvido para o Projeto Interdisciplinar III (Sistemas de Informação — FHO | Uniararas).

---

## 🛠️ Stack Tecnológica

* **Framework:** Vue 3 (Composition API com `<script setup>`)
* **Build Tool & Bundler:** Vite
* **Roteamento:** Vue Router 4 (com Lazy Loading assíncrono e Route Guards)
* **Gerenciamento de Estado:** Pinia
* **Estilização:** CSS Modular em camadas com Design Tokens nativos (`01-tokens` a `06-responsive`)[cite: 1, 2]
* **Comunicação:** Client HTTP centralizado com interceptação de tokens JWT e auto-refresh

---

## 🚀 Módulos & Funcionalidades

### 1. ERP Agrícola & Gestão de Campo
* **Autenticação & Controle de Acesso:** Sessão com JWT (`access_token` e `refresh_token`) e controle por papéis (Colaborador, Gerente e Administrador).
* **Dashboard Executivo:** Métricas consolidadas de produção, telemetria em tempo real e atalhos rápidos.
* **Culturas, Lotes e Colheitas:** Cadastro, rastreabilidade e acompanhamento do ciclo de vida das plantações.
* **Telemetria de Sensores IoT:** Visualização de temperatura, umidade e luminosidade com tabelas responsivas.
* **Gêmeo Virtual da Estufa:** Mapeamento espacial com alternância dinâmica entre **3D Isométrico** e **Grade Técnica 2D**, com suporte a zoom interativo e compatibilidade com telas estreitas.
* **Auditoria & Rastreabilidade:** Histórico imutável de ações com conversão automática de tabelas em cards no mobile[cite: 2].

### 2. Inteligência Artificial Integrada (Arquitetura Plug-and-Play)
* **RF09 — Previsão de Estoque (Prophet):** Projeção inteligente da curva de consumo e data estimada de término por insumo[cite: 2].
* **RF10 — Irrigação Inteligente (Scikit-learn):** Alternância entre modo manual e autônomo baseado em árvores de decisão, com registro de explicabilidade agronômica[cite: 2].
* **RF11 — Importação de NF-e via OCR (Tesseract):** Upload de documento fiscal com leitura automatizada e interface de conferência manual antes da entrada em estoque[cite: 2].
* **RF12 — Assistente Virtual Inteligente (NLP/LLM):** Chatbot flutuante integrado para consultas de status e comandos operacionais em linguagem natural[cite: 2].

> **Arquitetura Plug-and-Play:** Todos os módulos de IA conectam-se prioritariamente aos endpoints do back-end Django REST Framework[cite: 2]. Caso os modelos ou rotas do servidor ainda estejam em desenvolvimento ou temporariamente indisponíveis, a interface ativa um modo de contingência/simulação transparente sem interromper a navegação[cite: 2].

---

## 📱 Responsividade & Acessibilidade (WCAG 2.1 AA)

* **Ergonomia de Campo:** Áreas de toque mínimas (*touch targets*) de 44×44px em botões, paginações e seletores para uso seguro em tablets e smartphones[cite: 2].
* **Telas Ultra-largas (Ultrawide / 2K / 4K):** Layout contido com limite de largura de leitura (`max-width: 1440px`).
* **Navegação por Teclado:** Suporte a *Skip to Content* (atalho para pular navegação) e anéis de foco visíveis (`:focus-visible`).
* **Sensibilidade de Movimento:** Adaptação automática a `prefers-reduced-motion` para usuários sensíveis a animações.
* **Resiliência de Rede:** Detecção de queda de conectividade celular em tempo real com alerta discreto ao operador rural.

---

## ⚙️ Configuração do Ambiente & Execução

### Pré-requisitos
* Node.js (v18+)
* Gerenciador de pacotes `pnpm` (recomendado) ou `npm`[cite: 1]

### Recomendação de IDE & Navegador
* [VS Code](https://code.visualstudio.com/) + extensão [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (desative a extensão legada Vetur).
* [Vue.js Devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) instalado no navegador.

### Instalação das Dependências
```sh
pnpm install