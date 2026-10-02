const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'otempo_db'
  });

  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashStudent = await bcrypt.hash('unic2026', 10);

  await conn.query('UPDATE admins SET password = ? WHERE email = ?', [hashAdmin, 'admin@otempo.com']);
  await conn.query('UPDATE students SET password = ? WHERE email = ?', [hashStudent, 'feliciano@unic.ao']);

  console.log('Credenciais de demonstração atualizadas');
  await conn.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
