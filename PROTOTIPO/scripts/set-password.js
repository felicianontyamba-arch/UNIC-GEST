#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/database');

function usage() {
  console.log('Usage: node scripts/set-password.js --email <email> --password <password> [--table admins|students]');
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--email') out.email = args[++i];
    else if (a === '--password') out.password = args[++i];
    else if (a === '--table') out.table = args[++i];
    else if (a === '-h' || a === '--help') usage();
  }
  return out;
}

async function main() {
  const { email, password, table = 'admins' } = parseArgs();
  if (!email || !password) usage();
  if (!['admins', 'students'].includes(table)) {
    console.error('Table must be "admins" or "students"');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        `UPDATE ${table} SET password = ? WHERE email = ?`,
        [hash, email]
      );

      if (result && result.affectedRows && result.affectedRows > 0) {
        console.log(`✅ Password updated for ${email} in ${table}`);
      } else {
        console.log(`⚠️  No rows updated. Email not found in ${table}: ${email}`);
      }
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error updating password:', err.message || err);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch(e){}
  }
}

main();
