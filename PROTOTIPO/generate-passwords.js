const bcrypt = require('bcryptjs');

// Definir senhas de teste
const passwords = {
  'joao@unic.ao': 'joao123',
  'maria@unic.ao': 'maria123',
  'pedro@unic.ao': 'pedro123',
  'admin@otempo.com': 'admin123'
};

async function generateHashes() {
  console.log('\n🔐 Gerando hashes bcrypt das senhas de teste:\n');
  
  for (const [email, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
}

generateHashes();
