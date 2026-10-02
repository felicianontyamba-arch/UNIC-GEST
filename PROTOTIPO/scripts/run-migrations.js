#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'otempo_db',
    multipleStatements: true
  });

  try {
    console.log('Connected to DB — running migrations from', MIGRATIONS_DIR);

    // Ensure migrations table exists
    await connection.query(`CREATE TABLE IF NOT EXISTS migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const [rows] = await connection.query('SELECT 1 FROM migrations WHERE name = ? LIMIT 1', [file]);
      if (rows && rows.length) {
        console.log(`Skipping already applied: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`Applying migration: ${file}`);
      try {
        await connection.query(sql);
        await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
        console.log(`Applied: ${file}`);
      } catch (err) {
        console.warn(`Error applying ${file}:`, err.message);
        // Continue to next migration — allow idempotent behaviour
      }
    }

    console.log('Migrations finished.');
  } finally {
    await connection.end();
  }
}

run().catch(err => {
  console.error('Migration runner failed:', err.message);
  process.exit(1);
});
