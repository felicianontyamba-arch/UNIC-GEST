# O Tempo - Backend Setup

## 📋 Requisitos
- Node.js (v14 ou superior)
- MySQL Server
- npm (gerenciador de pacotes)

## 🚀 Instalação e Setup

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados MySQL

#### No Windows:
```bash
# Abrir MySQL CLI
mysql -u root -p

# Copiar e colar o conteúdo do arquivo database.sql
source database.sql;
```

#### Ou use uma ferramenta como MySQL Workbench para executar database.sql

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=otempo_db
JWT_SECRET=sua_chave_secreta_muito_segura
PORT=5000
NODE_ENV=development
```

### 4. Iniciar o Servidor
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Ou modo produção
npm start
```

O servidor estará rodando em `http://localhost:5000`

## 📁 Arquivos Principais

- **server.js** - Servidor Express principal
- **database.sql** - Schema do banco de dados
- **.env** - Variáveis de ambiente
- **package.json** - Dependências do projeto

## 🔐 Credenciais Padrão

**Admin:**
- Email: `admin@otempo.com`
- Senha: `admin123`

## 📊 Endpoints Principais

### Autenticação
- `POST /api/auth/admin-login` - Login de administrador

### Estudantes
- `GET /api/students` - Listar todos os estudantes
- `POST /api/students` - Criar novo estudante
- `PUT /api/students/:id` - Atualizar estudante
- `DELETE /api/students/:id` - Deletar estudante

### Tarefas
- `GET /api/tasks/:studentId` - Listar tarefas de um estudante

### Export
- `GET /api/export/students/csv` - Exportar estudantes em CSV
- `GET /api/export/tasks/csv` - Exportar tarefas em CSV
- `GET /api/export/performance/csv` - Exportar relatório de desempenho em CSV

## 🔗 URLs Importantes

- **Página Inicial:** `http://localhost:5000/INDEX.html`
- **Login de Estudante:** `http://localhost:5000/login.html`
- **Login:** `http://localhost:5000/login.html`
- **Painel Admin:** `http://localhost:5000/admin.html`

## ⚠️ Notas Importantes

1. Certifique-se de que MySQL está rodando antes de iniciar o servidor
2. As credenciais do banco de dados no `.env` devem corresponder à sua instalação
3. Para segurança em produção, gere uma chave JWT mais forte
4. Nunca faça commit do arquivo `.env` com credenciais reais

## 🆘 Troubleshooting

**Erro: "Cannot find module 'express'"**
- Solução: Execute `npm install`

**Erro: "Connection refused (localhost:3306)"**
- Solução: Verifique se MySQL está rodando

**Erro: "Access denied for user"**
- Solução: Verifique credenciais no `.env`

**Erro: "ER_BAD_DB_ERROR"**
- Solução: Execute o script `database.sql` para criar o banco
