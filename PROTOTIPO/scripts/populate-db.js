#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/database');

async function main() {
  const admin = { email: 'admin@otempo.com', password: 'admin123', nome: 'Administrador' };
  const student = { nome: 'Feliciano Sanjukila', email: 'feliciano@unic.ao', password: 'unic2026', curso: 'Eng. Informática', semestre: '3º Semestre' };

  try {
    const adminHash = await bcrypt.hash(admin.password, 10);
    const studentHash = await bcrypt.hash(student.password, 10);

    const conn = await pool.getConnection();
    try {
      await conn.query(
        `INSERT INTO admins (email, password, nome) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), nome = VALUES(nome)`,
        [admin.email, adminHash, admin.nome]
      );

      await conn.query(
        `INSERT INTO students (nome, email, password, curso, semestre) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), nome = VALUES(nome), curso = VALUES(curso), semestre = VALUES(semestre)`,
        [student.nome, student.email, studentHash, student.curso, student.semestre]
      );

      await conn.query('DELETE FROM tasks');

      await conn.query(`
        CREATE TABLE IF NOT EXISTS courses (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nome VARCHAR(255) NOT NULL,
          codigo VARCHAR(50) DEFAULT NULL,
          descricao TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS subjects (
          id INT PRIMARY KEY AUTO_INCREMENT,
          course_id INT NOT NULL,
          nome VARCHAR(255) NOT NULL,
          codigo VARCHAR(50) DEFAULT NULL,
          professor VARCHAR(255) DEFAULT NULL,
          creditos INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        )
      `);

      console.log('✅ Admin and blank student state prepared successfully.');
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Failed to populate DB:', err.message || err);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch(e){}
  }
}

main();
