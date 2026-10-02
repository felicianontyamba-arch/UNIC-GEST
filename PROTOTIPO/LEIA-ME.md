# 🎓 UNIC GEST - Gestor de Tarefas Académicas

Sistema completo de gestão de tarefas académicas para Universidade Internacional do Cuanza (UNIC), desenvolvido como Trabalho Final de Curso (TFC).

## 📋 Visão Geral

UNIC é uma plataforma web para ajudar estudantes universitários a:
- ✅ Organizar e acompanhar tarefas académicas
- 📚 Gerenciar disciplinas e calendários
- 📊 Monitorar progresso académico
- 🔔 Receber notificações e alertas sobre prazos
- 🎓 Consultar notas e médias

## 🚀 Funcionalidades Principais (8 Requisitos Essenciais - TFC)

### 1. 🔐 Sistema de Autenticação
- Login para estudantes e administradores (integração com backend)
- Autenticação real: configure contas no backend ou através da interface de administração
- Sessões com localStorage (provisório para protótipo)

### 2. 🏠 Dashboard Interativo
- Visão geral de tarefas: Pendentes, Em Curso, Concluídas, Atrasadas
- Próximas entregas com prioridades
- Progresso geral e por disciplina
- Estatísticas em tempo real

### 3. 📚 Gestão de Disciplinas
- Listagem de todas as disciplinas inscritas
- Estatísticas por disciplina
- Links rápidos para tarefas de cada disciplina
- Professores responsáveis

### 4. ➕ Criar Tarefas
- Formulário completo com campos:
  - Título e descrição
  - Disciplina (dropdown)
  - Data de entrega
  - Prioridade (Baixa, Média, Alta)
  - Estado (Pendente, Em Andamento, Concluída)

### 5. ✏️ Editar/Eliminar Tarefas
- Botões de acção rápida
- Edição inline de tarefas
- Eliminação com confirmação

### 6. 📅 Prazo + Prioridade
- Visualização de prazos com cores indicadoras
- Prioridades codificadas:
  - 🔴 Alta (Vermelho)
  - 🟠 Média (Laranja)
  - 🟢 Baixa (Verde)

### 7. 🔄 Estado da Tarefa
- Gerenciamento do ciclo de vida:
  - Pendente → Em Andamento → Concluída
- Transições automáticas
- Histórico de mudanças

### 8. 🔔 Alertas/Notificações
- Sistema integrado de alertas
- Categorias:
  - Urgentes (tarefas atrasadas)
  - Próximas (vencimento em breve)
  - Concluídas (feedback positivo)
- Filtros por tipo
- Marcação de leitura

## 🎨 Características Adicionais

### Visualizações Múltiplas
- **Lista**: Visualização em tabela com filtros
- **Kanban**: Visualização em colunas por estado
- **Progresso**: Gráficos e estatísticas

### Filtros Avançados
- Pesquisar por título
- Filtrar por disciplina
- Filtrar por prioridade
- Filtrar por estado

### Navegação Intuitiva
- Sidebar permanente com menu
- Links rápidos para todas as páginas
- Breadcrumbs de contexto
- **Responsivo para móvel com menu hamburger**

### Página de Progresso (📊)
- Taxa de conclusão geral (%)
- Detalhamento por disciplina
- Progresso visual com barras
- Timeline de atividades

### Página de Médias (🎓)
- GPA geral (escala 0-20)
- Notas por avaliação
- Distribuição de notas
- Evolução do desempenho

### Notificações (🔔)
- 4 abas: Todas, Urgentes, Próximas, Concluídas
- Prioridades codificadas
- Botões de marcação
- Eliminação de notificações

### 📱 Responsividade Completa
- Desktop: Sidebar fixo + layout 2 colunas
- Tablet: Grid 2 colunas, sidebar ajustado
- Mobile: Sidebar colapsável com menu hamburger
- Muito pequeno: Layout otimizado com tipografia reduzida

## 📁 Estrutura de Arquivos

```
PROTOTIPO/
├── login.html                # Login principal (unificado)
├── dashboard.html             # Dashboard com resumo geral
├── tarefas.html              # Gestão de tarefas (lista + kanban)
├── disciplinas.html          # Listagem de disciplinas
├── progresso.html            # Acompanhamento de progresso
├── notificacoes.html         # Sistema de notificações
├── medias.html               # Consultar notas e médias
├── perfil.html               # Editar perfil do estudante
├── calendario.html           # Calendário (existente)
├── styles-app.css            # Estilos compartilhados
├── styles.css                # Estilos antigos
├── server.js                 # Backend Node.js/Express
├── database.sql              # Schema MySQL
├── package.json              # Dependências
├── INDEX.html                # Homepage (antigo)
├── login.html                # Login unificado (admin + estudante)
├── admin.html                # Painel admin
└── README.md                 # Este arquivo
```

## 🎯 Conta e Testes locais

Para segurança e para evitar dependências de demonstração, o projeto não inclui mais credenciais de demonstração embutidas.

Como testar:
- Opção 1 — Backend: Inicie o servidor (`node server.js`) e crie contas via API ou banco de dados (veja `database.sql`).
- Opção 2 — Local (rápida): o protótipo usa `localStorage` para armazenar tarefas; pode criar e testar tarefas diretamente na interface (modo offline). 

Se precisa de credenciais temporárias para uma demo ao vivo, crie usuários no banco de dados ou peça ao avaliador que use um ambiente de teste controlado.

## 🏗️ Arquitetura

### Frontend
- HTML5 + CSS3 + JavaScript Vanilla
- Sem frameworks pesados (mantém compatibilidade)
- Design responsivo (Mobile-First)
- Armazenamento local com localStorage

### Backend
- Node.js + Express.js
- Servidor em `localhost:5000`
- API REST com CORS habilitado
- Suporte para MySQL

### Dados
- LocalStorage (dados de demonstração)
- Pronto para integração com backend
- Schema SQL fornecido em `database.sql`

## 📱 Navegação Principal

### Sidebar (Todas as páginas)
```
🎓 UNIC
🏠 Dashboard
📋 Minhas Tarefas
📚 Disciplinas
📅 Calendário
🔔 Notificações
📊 Meu Progresso
🎓 Minhas Médias
🔗 Links Úteis

---

👤 Meu Perfil
⚙️ Definições
🚪 Terminar sessão
```

## 🎓 Alinhamento com TFC

Este projeto implementa completamente a especificação TFC fornecida:

✅ **8 Funcionalidades Obrigatórias** - Todas implementadas
✅ **Design Conforme Especificação** - ASCII diagrams seguidos
✅ **Rastreabilidade** - Cada feature resolve um requisito
✅ **Pronto para Defesa** - Interface profissional e intuitiva
✅ **Escalável** - Pronto para backend real com Node/MySQL

## 🚀 Como Iniciar

### 1. Abrir Frontend
```bash
# Abrir no navegador
estudante-login.html
```

### 2. Nota sobre login
O fluxo de autenticação demo foi removido do frontend. Para demonstrações, prefira criar contas no backend ou usar um script de inserção no banco de dados.

### 3. Explorar Funcionalidades
1. Aceder ao Dashboard
2. Criar nova tarefa
3. Verificar Disciplinas
4. Consultar Progresso
5. Testar Notificações

### 4. Iniciar Backend (Opcional)
```bash
npm install
node server.js
# Servidor em http://localhost:5000
```

## 📊 Dados de Demonstração (prototipo)

O protótipo inicializa com um conjunto de dados de exemplo quando não existem dados em `localStorage`. Esses dados servem apenas para demonstração local e não são credenciais de acesso.

**Disciplinas:**
- Programação (8 tarefas, 75% conclusão)
- Base de Dados (6 tarefas, 67% conclusão)
- Matemática (10 tarefas, 60% conclusão)
- Redes (2 tarefas, 100% conclusão)
- Eng. Software (7 tarefas, 43% conclusão)
- Estrutura de Dados (9 tarefas, 78% conclusão)

**Tarefas:**
- Total: 23 tarefas
- Concluídas: 18
- Pendentes: 5
- Atrasadas: 2

**Notas:**
- Média Geral: 16.3/20 (Bom Desempenho)
- Melhor: 18.0 (Programação)
- Pior: 14.3 (Matemática)

## 🎨 Design System

### Cores
- **Primária**: #d90429 (Vermelho)
- **Primária Escura**: #a8001f (Vermelho Escuro)
- **Secundária**: #636e72 (Cinza)
- **Sucesso**: #1dbf73 (Verde)
- **Aviso**: #f7b731 (Amarelo)
- **Perigo**: #ff3d3d (Vermelho Claro)

### Tipografia
- Font: Sistema (Segoe UI, Roboto, etc.)
- Tamanho base: 16px
- Escala harmônica

### Layout
- Sidebar fixo (250px)
- Conteúdo responsivo
- Grid automático
- Espaçamento consistente

## ✨ Destaques Técnicos

1. **Responsivo**: Funciona em Desktop, Tablet, Mobile
2. **Acessível**: Semântica HTML5, Navegação por teclado
3. **Rápido**: Sem dependências externas pesadas
4. **Seguro**: Validação de formulários, Proteção XSS
5. **Escalável**: Pronto para backend real
6. **Profissional**: Interface polida e intuitiva

## 📈 Próximas Melhorias (Futuro)

- [ ] Integração com backend MySQL real
- [ ] Autenticação JWT completa
- [ ] Drag-and-drop no Kanban
- [ ] Gráficos interativos
- [ ] Tema escuro
- [ ] Notificações push
- [ ] Mobile app nativa
- [ ] Integração com calendário (iCal)

## 🧪 Testes e Validação

Foram realizados testes funcionais das principais funcionalidades:

- [x] Login do estudante
- [x] Login do administrador
- [x] Criação de tarefa
- [x] Edição de tarefa
- [x] Eliminação de tarefa
- [x] Alteração do estado da tarefa
- [x] Filtro por disciplina
- [x] Filtro por prioridade
- [x] Exibição de tarefas atrasadas
- [x] Sistema de notificações
- [x] Cálculo do progresso
- [x] Consulta de médias
- [x] Responsividade
- [x] Persistência dos dados

### Testes de validação

Foram realizados testes com utilizadores para avaliar:

- Facilidade de utilização
- Organização das informações
- Utilidade das funcionalidades
- Adequação do sistema às necessidades identificadas

## 🔍 Troubleshooting

### Login não funciona
- Verificar `localStorage` ativado no browser
- Se estiver a usar autenticação via backend: confirmar que o servidor está a correr (`node server.js`) e que as credenciais existem no banco de dados
- Nota: as credenciais de demonstração foram removidas do frontend por motivos de segurança

### Dados desaparecem ao refresh
- Normal - dados são em localStorage (sessão)
- Backend MySQL preservaria dados

### Páginas não carregam
- Verificar se arquivos CSS estão acessíveis
- Abrir console (F12) para erros

## 📞 Suporte

Para questões sobre o projeto ou para obter credenciais de teste em ambiente controlado, consulte a documentação TFC ou contacte os desenvolvedores.

---

**Desenvolvido para UNIC - Universidade Internacional do Cuanza**  
**TFC - Trabalho Final de Curso**  
**2024**
