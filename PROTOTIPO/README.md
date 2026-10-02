# O Tempo

Sistema de gestão acadêmica para estudantes e administradores.

## Requisitos

- Node.js 18+
- MySQL
- npm

## Instalação

1. Instale as dependências:
   npm install
2. Copie o ficheiro de exemplo de ambiente:
   copy .env.example .env
3. Ajuste as variáveis de ambiente no ficheiro `.env`.
4. Inicie o servidor:
   npm start

## Desenvolvimento

```bash
npm run dev
```

## Endpoints principais

- `GET /api/health` - Verifica se o servidor está ativo
- `POST /api/auth/admin-login` - Login de administrador
- `GET /api/students` - Lista estudantes
- `GET /api/tasks/:studentId` - Lista tarefas de um estudante

## Localização web

- Frontend: http://localhost:5000
- Dashboard: http://localhost:5000/INDEX.html

## Observações

O projeto usa um servidor Express com suporte para exportação de CSV, Excel e PDF e está pronto para evoluir para uma arquitetura mais organizada.

## XAMPP / Importar base de dados

Se estiver a usar XAMPP (Windows + phpMyAdmin):

- Inicie `Apache` e `MySQL` no XAMPP Control Panel.
- Abra http://localhost/phpmyadmin, selecione *Importar* e escolha `init-db.sql` do projecto.
- Se causar erro de duplicação ao reimportar, o ficheiro `init-db.sql` já contém `ON DUPLICATE KEY UPDATE` para evitar falhas.

Alternativa (via linha de comandos):

```powershell
mysql -u root -p < "C:\Users\Admin\Desktop\PROTOTIPO\init-db.sql"
```

Se preferir não usar o phpMyAdmin, pode usar o script Node para popular a base (recomendado):

```bash
node scripts/populate-db.js
```

Esse script conecta-se à base configurada em `.env` e insere/actualiza o administrador e um estudante de teste (com senhas bcrypt).

## Variáveis de ambiente (.env)

Crie um ficheiro `.env` na raiz do projecto com estas variáveis mínimas:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=otempo_db
JWT_SECRET=algumsegredoparajwt
PORT=3000
```

## Executar servidor

Instale dependências e inicie o servidor:

```bash
npm install
npm start
```

Se a porta `3000` estiver ocupada, defina `PORT=3001` no `.env` ou execute:

```powershell
$env:PORT=3001; npm start
```

## Credenciais de teste

- Admin: `admin@otempo.com` / `admin123`
- Estudante: `feliciano@unic.ao` / `unic2026`

As senhas das contas de teste estão armazenadas como bcrypt no banco quando usar `populate-db.js`.

## Script: set-password.js

Existe um utilitário CLI para actualizar senhas diretamente na base de dados com hashing seguro (bcrypt):

```bash
node scripts/set-password.js --email <email> --password <novaSenha> --table admins
node scripts/set-password.js --email <email> --password <novaSenha> --table students
```

Exemplos:

```bash
node scripts/set-password.js --email admin@otempo.com --password NovaSenha123 --table admins
node scripts/set-password.js --email feliciano@unic.ao --password SenhaAluno --table students
```

O script faz o hash da senha com bcrypt e executa um `UPDATE` parametrizado na tabela indicada.

## Endpoint: mudar senha via API

Um endpoint autenticado permite que um utilizador altere a sua própria senha, ou que um administrador altere a senha de outro utilizador.

- URL: `POST /api/auth/change-password`
- Autorização: enviar `Authorization: Bearer <token>` (token JWT obtido no login)
- Body JSON:
   - Para alterar a sua própria senha: `{ "currentPassword": "atual", "newPassword": "novaSenha" }`
   - Para um admin alterar a senha de outra conta: `{ "email": "alvo@unic.ao", "newPassword": "novaSenha" }` (não é necessário `currentPassword`)

Exemplos (curl):

```bash
# alterar própria senha
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
   -d '{"currentPassword":"admin123","newPassword":"NovaSenha123"}' \
   http://localhost:3000/api/auth/change-password

# admin atualiza senha de estudante
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
   -d '{"email":"feliciano@unic.ao","newPassword":"SenhaAluno99"}' \
   http://localhost:3000/api/auth/change-password
```

