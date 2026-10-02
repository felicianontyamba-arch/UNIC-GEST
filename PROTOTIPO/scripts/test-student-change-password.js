const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(body); } catch(e) { parsed = body; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  try {
    console.log('1) Login as student');
    const login = await post('/api/auth/login', { email: 'feliciano@unic.ao', password: 'unic2026' });
    console.log('login status', login.status);
    console.log(JSON.stringify(login.body, null, 2));
    if (login.status !== 200) return process.exit(1);

    const token = login.body.token;
    console.log('\n2) Change password (current -> TempStud123)');
    const change = await post('/api/auth/change-password', { currentPassword: 'unic2026', newPassword: 'TempStud123' }, token);
    console.log('change status', change.status);
    console.log(JSON.stringify(change.body, null, 2));

    console.log('\n3) Try login with new password');
    const login2 = await post('/api/auth/login', { email: 'feliciano@unic.ao', password: 'TempStud123' });
    console.log('login2 status', login2.status);
    console.log(JSON.stringify(login2.body, null, 2));

    // restore original password
    console.log('\n4) Restore original password to unic2026');
    const loginNew = login2.status === 200 ? login2 : login; // if new login failed, fallback
    const token2 = loginNew.body.token;
    const restore = await post('/api/auth/change-password', { currentPassword: 'TempStud123', newPassword: 'unic2026' }, token2);
    console.log('restore status', restore.status);
    console.log(JSON.stringify(restore.body, null, 2));

  } catch (err) {
    console.error('ERR', err.message || err);
    process.exit(1);
  }
}

run();
