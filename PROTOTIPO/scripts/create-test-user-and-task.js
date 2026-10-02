const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { generateToken } = require('../src/middleware/auth');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'otempo_db'
  });

  try {
    // ensure a student exists
    const [rows] = await connection.query('SELECT id FROM students LIMIT 1');
    let studentId;
    if (rows && rows.length) {
      studentId = rows[0].id;
      console.log('Found existing student id=', studentId);
    } else {
      const [res] = await connection.query("INSERT INTO students (nome, email) VALUES (?, ?)", ['Test User', 'test@example.com']);
      studentId = res.insertId;
      console.log('Created test student id=', studentId);
    }

    // generate token
    const token = generateToken({ id: studentId, nome: 'Test User' });
    console.log('JWT token:', token);

    // create a task via API
    const apiUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/:\/\/.*/, '') : 'http://localhost:5001';
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`;
    const fetchUrl = serverUrl + '/api/tasks';

    console.log('Posting task to', fetchUrl);

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ titulo: 'Tarefa de teste para notificacao', descricao: 'Descrição de teste', data_prazo: null })
    });

    const data = await response.json();
    console.log('Task create response:', response.status, data);

    // get notifications
    const notifRes = await fetch(serverUrl + '/api/notifications', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const notifs = await notifRes.json();
    console.log('Notifications for user:', JSON.stringify(notifs, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

main();
