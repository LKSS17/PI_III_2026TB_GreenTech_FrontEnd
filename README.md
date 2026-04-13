# 🌿 GreenTech - ERP de Rastreabilidade Agrícola

O **GreenTech** é um sistema de gerenciamento para agricultura de precisão, focado na rastreabilidade total de cultivos, desde a entrada da semente até a colheita final. Desenvolvido para o Projeto Integrador (PI) na **FHO | Fundação Hermínio Ometto**.

## 🚀 Funcionalidades Atuais

- **Painel Geral:** Registro de lotes de plantio com IDs únicos.
- **Gestão de Estoque de Sementes:** Controle de insumos com layout "Master-Detail" (Lista/Detalhe), permitindo visualizar, registar e gerir quantidades e validades.
- **Widgets Dinâmicos:** Relógio em tempo real e espaço preparado para API de previsão do tempo.
- **Rastreabilidade:** Controle por Estufas (Estufa-XX) e Mesas (M-XX).
- **Interface Responsiva:** Sidebar moderna com efeito de expansão e Glassmorphism.
- **Identidade Visual:** Design focado em agricultura inteligente (Verde Musgo e Terracota) com Grid de Cards moderno.

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica do sistema com separação clara de responsabilidades.
- **CSS3:** Estilização avançada (Flexbox, CSS Grid, Glassmorphism e Variáveis CSS).
- **JavaScript:** Lógica de navegação, manipulação do DOM em tempo real e simulação de CRUD (Create, Read, Update, Delete) no estoque.
- **Google Fonts:** Fontes Poppins e Segoe UI para legibilidade.
- **Material Symbols:** Ícones modernos para a interface.

## 📂 Estrutura do Projeto

```text
/
├── cadastro/         # Telas de registro de usuário e scripts de validação
├── Css/              # Estilos globais e da tela de login
├── dashboard/        # Módulo principal do ERP
│   ├── dashboard.html    # Painel geral de plantio
│   ├── estoque.html      # Tela de controle do estoque de sementes
│   ├── estoque.js        # Lógica e interatividade do estoque (Widgets e Banco de Dados em memória)
│   └── style.css         # Estilos centralizados do painel e componentes
├── recuperar_senha/  # Telas de recuperação de acesso
├── scr/              # Imagens e assets visuais do projeto
└── index.html        # Tela de Login (Entrada principal)
```
