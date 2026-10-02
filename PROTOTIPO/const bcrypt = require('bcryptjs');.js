const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/database');

async function setPasswordForEmail(email, plainPassword, table='admins') {
  const hash = await bcrypt.hash(plainPassword, 10);
  const conn = await pool.getConnection();
  try {
    await conn.query(`UPDATE ${table} SET password = ? WHERE email = ?`, [hash, email]);
  } finally { conn.release(); }
}

// atualizar admin
await setPasswordForEmail('admin@otempo.com', 'admin123');

// inserir novo estudante (exemplo)
INSERT INTO students (nome,email,password,curso,semestre)
VALUES ('Novo Aluno','novo@unic.ao','<HASH_GERADO>','Eng. Informática','1º Semestre');