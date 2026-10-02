const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

async function waitForServer(child, timeoutMs = 20000) {
  const started = Date.now();
  let output = '';

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Server did not start within ${timeoutMs}ms. Output: ${output}`));
    }, timeoutMs);

    const onData = (chunk) => {
      output += chunk.toString();
      if (output.includes('Servidor rodando')) {
        clearTimeout(timer);
        child.stdout.off('data', onData);
        child.stderr.off('data', onDataErr);
        resolve();
      }
    };

    const onDataErr = (chunk) => {
      output += chunk.toString();
      if (output.includes('Servidor rodando')) {
        clearTimeout(timer);
        child.stdout.off('data', onData);
        child.stderr.off('data', onDataErr);
        resolve();
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onDataErr);

    child.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited early with code ${code}. Output: ${output}`));
    });
  });
}

async function startServer() {
  const env = {
    ...process.env,
    PORT: '5001',
    FRONTEND_URL: 'http://localhost:5001',
    NODE_ENV: 'test'
  };

  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await waitForServer(child);
  return child;
}

async function stopServer(child) {
  if (!child) return;
  child.kill('SIGTERM');
  await new Promise((resolve) => {
    child.once('exit', resolve);
    setTimeout(resolve, 1000);
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return { response, payload };
}

test('health endpoint is available', async () => {
  const child = await startServer();
  try {
    const { response, payload } = await fetchJson('http://localhost:5001/api/health');
    assert.equal(response.status, 200);
    assert.equal(payload.status, 'ok');
  } finally {
    await stopServer(child);
  }
});

test('admin login accepts the documented admin credentials', async () => {
  const child = await startServer();
  try {
    const { response, payload } = await fetchJson('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@otempo.com', password: 'admin123' })
    });

    assert.equal(response.status, 200, JSON.stringify(payload));
    assert.equal(payload.user.email, 'admin@otempo.com');
    assert.equal(payload.user.role, 'ADMIN');
    assert.ok(typeof payload.token === 'string' && payload.token.length > 0);
  } finally {
    await stopServer(child);
  }
});

test('student login accepts the documented student credentials', async () => {
  const child = await startServer();
  try {
    const { response, payload } = await fetchJson('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'feliciano@unic.ao', password: 'unic2026' })
    });

    assert.equal(response.status, 200, JSON.stringify(payload));
    assert.equal(payload.user.email, 'feliciano@unic.ao');
    assert.equal(payload.user.role, 'STUDENT');
    assert.ok(typeof payload.token === 'string' && payload.token.length > 0);
  } finally {
    await stopServer(child);
  }
});

test('profile page exposes the save and load profile handlers', async () => {
  const html = await require('node:fs/promises').readFile(require('node:path').resolve(__dirname, '../perfil.html'), 'utf8');
  assert.match(html, /function\s+loadProfile\s*\(/);
  assert.match(html, /function\s+saveProfile\s*\(/);
  assert.match(html, /onclick="saveProfile\(\)"/);
});

test('calendar page loads task deadlines from the API and refreshes in real time', async () => {
  const html = await require('node:fs/promises').readFile(require('node:path').resolve(__dirname, '../calendario.html'), 'utf8');
  assert.match(html, /loadCalendarTasks\s*\(|setInterval\s*\(|fetch\s*\(\s*[`'\"]\$\{API_URL\}\/tasks\//i);
  assert.match(html, /renderCalendar\s*\(/);
  assert.doesNotMatch(html, /<div class="calendar-grid">\s*<div class="day-header">Seg<\/div>/i);
});

test('calendar page supports month navigation and selected-day task details', async () => {
  const html = await require('node:fs/promises').readFile(require('node:path').resolve(__dirname, '../calendario.html'), 'utf8');
  assert.match(html, /prevMonthBtn|nextMonthBtn|selectedDate|calendarTaskList|calendarDayPanel|renderSelectedDatePanel/i);
  assert.match(html, /addEventListener\(['\"]click['\"]\s*,\s*\(\)\s*=>\s*\{\s*calendarState\.currentMonth/i);
});

test('calendar page supports calendar filters and direct task navigation', async () => {
  const html = await require('node:fs/promises').readFile(require('node:path').resolve(__dirname, '../calendario.html'), 'utf8');
  assert.match(html, /disciplineFilter|statusFilter|goToTasks|window\.location\.href\s*=\s*['\"]tarefas\.html['\"]/i);
  assert.match(html, /filterTasksForCalendar|renderCalendar\s*\(\)/i);
});

test('task creation supports start and end dates with discipline color metadata', async () => {
  const child = await startServer();
  try {
    const adminLogin = await fetchJson('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@otempo.com', password: 'admin123' })
    });

    const courseResponse = await fetchJson('http://localhost:5001/api/courses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminLogin.payload.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: 'Engenharia Informática', codigo: 'EI', descricao: 'Curso de teste' })
    });

    const courseId = courseResponse.payload.id;
    await fetchJson(`http://localhost:5001/api/courses/${courseId}/subjects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminLogin.payload.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: 'Programação', codigo: 'PROG', professor: 'Prof. Teste', creditos: 5 })
    });

    const studentLogin = await fetchJson('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'feliciano@unic.ao', password: 'unic2026' })
    });

    const taskResponse = await fetchJson('http://localhost:5001/api/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentLogin.payload.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: studentLogin.payload.user.id,
        titulo: 'Metodologia de estudo',
        descricao: 'Definir plano de estudo',
        data_inicio: '2026-09-10',
        data_fim: '2026-09-12',
        data_prazo: '2026-09-12',
        status: 'in-progress',
        disciplina: 'Programação',
        prioridade: 'high'
      })
    });

    assert.equal(taskResponse.response.status, 201, JSON.stringify(taskResponse.payload));
    assert.equal(taskResponse.payload.data_inicio, '2026-09-10');
    assert.equal(taskResponse.payload.data_fim, '2026-09-12');
    const calendarHtml = await require('node:fs/promises').readFile(require('node:path').resolve(__dirname, '../calendario.html'), 'utf8');
    assert.match(calendarHtml, /disciplineColors|calendar-task|data_inicio|data_fim/i);
  } finally {
    await stopServer(child);
  }
});

test('student pages load the real current course list from the API instead of static defaults', async () => {
  const profileHtml = await require('node:fs/promises').readFile(require('node:path').resolve(__dirname, '../perfil.html'), 'utf8');
  const tarefasHtml = await require('node:fs/promises').readFile(require('node:path').resolve(__dirname, '../tarefas.html'), 'utf8');

  assert.match(profileHtml, /fetch\s*\(\s*['\"]http:\/\/localhost:5000\/api\/courses['\"]|fetch\s*\(\s*['\"]\/api\/courses['\"]/i);
  assert.match(tarefasHtml, /localStorage\.getItem\('studentCourse'\)|courses\[0\]\.nome|matchingCourse\s*\?\s*matchingCourse\.nome/i);
  assert.doesNotMatch(profileHtml, /<option\s+selected>\s*Engenharia Informática\s*<\/option>/i);
});

test('admin tasks endpoint is available for live task updates', async () => {
  const child = await startServer();
  try {
    const login = await fetchJson('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@otempo.com', password: 'admin123' })
    });

    const { response, payload } = await fetchJson('http://localhost:5001/api/tasks', {
      headers: {
        'Authorization': `Bearer ${login.payload.token}`,
        'Content-Type': 'application/json'
      }
    });

    assert.equal(response.status, 200, JSON.stringify(payload));
    assert.ok(Array.isArray(payload));
  } finally {
    await stopServer(child);
  }
});

test('admin page supports hash navigation and password generation workflow', async () => {
  const html = await require('node:fs/promises').readFile(require('node:path').resolve(__dirname, '../admin.html'), 'utf8');
  assert.match(html, /hashchange|location\.hash/i);
  assert.match(html, /generateAndDownloadPDF\s*\(/);
  assert.match(html, /Gerar Senha|gerar senha/i);
});

test('new student starts with no tasks and courses endpoint is available', async () => {
  const child = await startServer();
  try {
    const studentLogin = await fetchJson('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'feliciano@unic.ao', password: 'unic2026' })
    });

    const studentTasks = await fetchJson('http://localhost:5001/api/tasks/' + studentLogin.payload.user.id, {
      headers: {
        'Authorization': `Bearer ${studentLogin.payload.token}`,
        'Content-Type': 'application/json'
      }
    });

    assert.equal(studentTasks.response.status, 200, JSON.stringify(studentTasks.payload));
    assert.deepEqual(studentTasks.payload, []);

    const adminLogin = await fetchJson('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@otempo.com', password: 'admin123' })
    });

    const courses = await fetchJson('http://localhost:5001/api/courses', {
      headers: {
        'Authorization': `Bearer ${adminLogin.payload.token}`,
        'Content-Type': 'application/json'
      }
    });

    assert.equal(courses.response.status, 200, JSON.stringify(courses.payload));
    assert.ok(Array.isArray(courses.payload));
  } finally {
    await stopServer(child);
  }
});

test('admin can create a student with course, disciplines and trimester', async () => {
  const child = await startServer();
  try {
    const adminLogin = await fetchJson('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@otempo.com', password: 'admin123' })
    });

    const courseResponse = await fetchJson('http://localhost:5001/api/courses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminLogin.payload.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: 'Engenharia Informática', codigo: 'EI', descricao: 'Curso de teste' })
    });

    assert.equal(courseResponse.response.status, 201, JSON.stringify(courseResponse.payload));
    const courseId = courseResponse.payload.id;

    const subjectResponse = await fetchJson(`http://localhost:5001/api/courses/${courseId}/subjects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminLogin.payload.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: 'Programação', codigo: 'PROG', professor: 'Prof. Teste', creditos: 5 })
    });

    assert.equal(subjectResponse.response.status, 201, JSON.stringify(subjectResponse.payload));

    const uniqueEmail = `aluno.${Date.now()}@unic.ao`;
    const studentResponse = await fetchJson('http://localhost:5001/api/students', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminLogin.payload.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: 'Aluno Teste',
        email: uniqueEmail,
        curso: 'Engenharia Informática',
        semestre: '2º Semestre',
        trimestre: '2º Trimestre',
        telefone: '999999999',
        disciplinas: ['Programação']
      })
    });

    assert.equal(studentResponse.response.status, 201, JSON.stringify(studentResponse.payload));

    const listResponse = await fetchJson('http://localhost:5001/api/students', {
      headers: {
        'Authorization': `Bearer ${adminLogin.payload.token}`,
        'Content-Type': 'application/json'
      }
    });

    assert.equal(listResponse.response.status, 200, JSON.stringify(listResponse.payload));
    const createdStudent = listResponse.payload.find((student) => student.email === uniqueEmail);
    assert.ok(createdStudent, 'student should be present in list');
    assert.equal(createdStudent.curso, 'Engenharia Informática');
    assert.equal(createdStudent.semestre, '2º Semestre');
    assert.ok(createdStudent.disciplinas && String(createdStudent.disciplinas).includes('Programação'));
  } finally {
    await stopServer(child);
  }
});
