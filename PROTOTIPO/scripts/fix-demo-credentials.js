#!/usr/bin/env node
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'otempo_db'
  });

  try {
    const adminHash = await bcrypt.hash('admin123', 10);
    const studentHash = await bcrypt.hash('unic2026', 10);

    await conn.query('UPDATE admins SET password = ? WHERE email = ?', [adminHash, 'admin@otempo.com']);
    await conn.query('UPDATE students SET password = ? WHERE email = ?', [studentHash, 'feliciano@unic.ao']);

    console.log('✅ Credenciais de demonstração restauradas para admin123 e unic2026');
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error('Erro ao restaurar credenciais:', error.message || error);
  process.exit(1);
});
