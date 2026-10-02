(function () {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const config = window.UNIC_LOGIN_CONFIG || {
    apiUrl: '/api/auth/login',
    redirectAdmin: 'admin.html',
    redirectStudent: 'dashboard.html',
    errorSelector: '#errorMessage',
    defaultError: 'Credenciais inválidas ou servidor indisponível.'
  };

  if (form.dataset.loginBound === 'true') return;
  form.dataset.loginBound = 'true';
  form.setAttribute('novalidate', 'novalidate');
  form.noValidate = true;

  const suppressInvalidFeedback = (event) => {
    const target = event.target;
    if (!target || !target.closest || !target.closest('#loginForm')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
  };

  form.addEventListener('invalid', suppressInvalidFeedback, true);
  document.addEventListener('invalid', suppressInvalidFeedback, true);

  const errorEl = document.querySelector(config.errorSelector);

  const clearLoginCache = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentCourse');
    localStorage.removeItem('studentSemester');
    localStorage.removeItem('isLoggedIn');
  };

  window.OtempoAuth = {
    clearSession() {
      clearLoginCache();
      sessionStorage.clear();
    },
    getUser() {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    },
    getToken() {
      return localStorage.getItem('token') || localStorage.getItem('studentToken') || localStorage.getItem('adminToken');
    },
    logout() {
      this.clearSession();
      window.location.href = 'login.html';
    }
  };

  let isSubmitting = false;

  const readValue = (id) => {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
  };

  const showError = (message) => {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  };

  const hideError = () => {
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  };

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem('token');
  const normalizedRole = (storedUser && storedUser.role ? storedUser.role.toUpperCase() : '');
  if (token && storedUser && (normalizedRole === 'ADMIN' || normalizedRole === 'STUDENT')) {
    const target = normalizedRole === 'ADMIN' ? config.redirectAdmin : config.redirectStudent;
    window.location.replace(target);
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) {
      return;
    }

    hideError();

    const email = readValue(config.emailFieldId || 'email');
    const password = readValue(config.passwordFieldId || 'password');

    if (!email || !password) {
      clearLoginCache();
      showError('Preencha o email e a senha.');
      const firstEmpty = document.getElementById(email ? config.passwordFieldId || 'password' : config.emailFieldId || 'email');
      if (firstEmpty) firstEmpty.focus();
      return;
    }

    isSubmitting = true;

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data || !data.user) {
        clearLoginCache();
        showError(data.error || config.defaultError);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.id) {
        localStorage.setItem('studentId', String(data.user.id));
      }

      if (data.user.role === 'ADMIN') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', data.user.email);
        window.location.replace(config.redirectAdmin);
        return;
      }

      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('studentEmail', data.user.email);
      localStorage.setItem('studentName', data.user.nome || data.user.email);
      localStorage.setItem('studentId', String(data.user.id || localStorage.getItem('studentId') || ''));
      localStorage.setItem('isLoggedIn', 'true');
      window.location.replace(config.redirectStudent);
    } catch (error) {
      console.error('Erro de autenticação:', error);
      clearLoginCache();
      showError('Servidor indisponível ou erro ao validar credenciais.');
    } finally {
      isSubmitting = false;
    }
  });

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentName');
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
})();
