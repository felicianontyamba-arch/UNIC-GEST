# 🔐 Sistema Simplificado de Gerenciar Senhas

## ✅ Como Funciona (Versão Simplificada)

**APENAS O ADMIN pode alterar as senhas dos estudantes!**

- ✅ Admin controla TODAS as senhas
- ✅ Senhas guardadas no XAMPP (MySQL)
- ✅ Estudantes NÃO podem alterar suas próprias senhas
- ❌ Funcionalidade de estudante alterar senha REMOVIDA

---

## 🚀 Como Testar

### 1️⃣ **Fazer Login como Admin**
- URL: http://localhost:5000/admin-login.html
- Email: `admin@otempo.com`
- Senha: `admin123`

### 2️⃣ **Acessar Painel de Gerenciar Senhas**
- URL: http://localhost:5000/admin-gerenciar-senhas.html
- Você verá lista de TODOS os estudantes

### 3️⃣ **Alterar Senha de um Estudante**
1. Procure o estudante (ex: "João Silva")
2. Clique no botão **"Alterar Senha"**
3. Modal abre
4. Digite nova senha (mín 6 caracteres)
5. Confirme a senha
6. Clique **"Atualizar Senha"**
7. ✅ Mensagem: "Senha de João Silva alterada e guardada no XAMPP!"
8. Senha é criptografada e guardada no banco de dados

### 4️⃣ **Testar Login do Estudante com Nova Senha**
- URL: http://localhost:5000/estudante-login.html
- Email: `joao@unic.ao`
- Senha: **a nova senha que você alterou**
- ✅ Estudante consegue fazer login com a nova senha

---

## 📊 Credenciais de Teste

### Admin
- Email: `admin@otempo.com`
- Senha: `admin123`

### Estudantes (para testar login após alterar senha)
- Email: `joao@unic.ao`
- Email: `maria@unic.ao`
- Email: `pedro@unic.ao`
- Email: `feliciano@unic.ao`

---

## 🔧 API Endpoint

### Alterar Senha (Apenas Admin)
```
POST /api/password/admin/change-student-password
Authorization: Bearer {token}

{
    "studentId": 1,
    "newPassword": "nova_senha_123"
}
```

### Listar Estudantes (Apenas Admin)
```
GET /api/password/admin/students-password-management
Authorization: Bearer {token}
```

---

## 📁 Ficheiros Criados/Modificados

✅ `/admin-gerenciar-senhas.html` - Página principal para admin gerenciar senhas
✅ `/src/routes/passwords.js` - API de senhas (removida rota de estudante)
✅ `/src/app.js` - Integração da rota de senhas

---

## ✅ O Que Foi Removido

❌ Página `perfil-alterar-senha.html` (estudante alterar senha)
❌ Rota `POST /api/password/student/change-password`
❌ Funcionalidade de estudante alterar sua própria senha

---

## 🛠️ Troubleshooting

### Problema: Erro "Não autorizado"
- Verificar se está logado como admin
- Verificar se o token é válido

### Problema: Estudante não consegue fazer login com nova senha
- Verificar se a senha foi guardada (mysql query)
- Verificar se não há caracteres especiais

### Problema: Página em branco
- Verificar console do navegador (F12)
- Reiniciar servidor (`npm start`)

---

## 📝 Sumário

| Funcionalidade | Admin | Estudante |
|---|---|---|
| Ver lista de estudantes | ✅ Sim | ❌ Não |
| Alterar senhas | ✅ Sim | ❌ Não |
| Fazer login | ✅ Sim | ✅ Sim |
| Acessar dashboard | ✅ Sim | ✅ Sim |

---

**Pronto! Sistema simplificado onde APENAS O ADMIN controla todas as senhas!** 🔐
