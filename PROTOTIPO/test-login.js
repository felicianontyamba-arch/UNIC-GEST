const baseUrl = 'http://localhost:5000/api/auth';

async function login(email, password) {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  console.log('LOGIN', email, 'STATUS', res.status);
  console.log(JSON.stringify(data, null, 2));
}

(async () => {
  await login('admin@otempo.com', 'admin123');
  await login('feliciano@unic.ao', 'unic2026');
})();
