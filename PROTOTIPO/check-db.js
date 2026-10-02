const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'otempo_db'
    });

    const [dbRows] = await conn.query('SHOW DATABASES LIKE ?', ['otempo_db']);
    console.log('DB_EXISTS', dbRows.length > 0 ? 'yes' : 'no');

    const [admins] = await conn.query('SELECT id, email, nome FROM admins');
    console.log('ADMINS', JSON.stringify(admins));

    const [students] = await conn.query('SELECT id, email, nome FROM students');
    console.log('STUDENTS', JSON.stringify(students));

    await conn.end();
  } catch (err) {
    console.error('DB_CHECK_ERROR', err.message || err);
    process.exit(1);
  }
})();
