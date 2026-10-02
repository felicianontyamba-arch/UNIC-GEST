// Mobile Menu Manager
document.addEventListener('DOMContentLoaded', function() {
    applySavedTheme();
    createThemeToggle();

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        createMobileMenuButton();
    }

    window.addEventListener('resize', function() {
        const nowIsMobile = window.innerWidth <= 768;
        const menuBtn = document.querySelector('.mobile-menu-toggle');
        const backdrop = document.querySelector('.mobile-menu-backdrop');

        if (nowIsMobile && !menuBtn) {
            createMobileMenuButton();
        } else if (!nowIsMobile && menuBtn) {
            removeMobileMenuButton();
        }

        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !nowIsMobile) {
            sidebar.classList.remove('mobile-open');
        }

        if (backdrop && !sidebar?.classList.contains('mobile-open')) {
            backdrop.classList.remove('visible');
        }
    });
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem('themePreference') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

function createThemeToggle() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight || document.querySelector('.theme-toggle')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Alternar tema');
    btn.innerHTML = '🌙';

    btn.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('themePreference', currentTheme);
        btn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
        btn.title = currentTheme === 'dark' ? 'Modo claro' : 'Modo escuro';
    });

    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    btn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
    btn.title = currentTheme === 'dark' ? 'Modo claro' : 'Modo escuro';
    headerRight.appendChild(btn);
}

function createMobileMenuButton() {
    if (document.querySelector('.mobile-menu-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'mobile-menu-toggle';
    btn.innerHTML = '☰';
    btn.setAttribute('aria-label', 'Abrir menu');
    btn.addEventListener('click', toggleMobileMenu);

    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-menu-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', closeMobileMenu);

    document.body.appendChild(backdrop);
    document.body.appendChild(btn);

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const links = sidebar.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }
}

function removeMobileMenuButton() {
    const btn = document.querySelector('.mobile-menu-toggle');
    const backdrop = document.querySelector('.mobile-menu-backdrop');

    if (btn) btn.remove();
    if (backdrop) backdrop.remove();
    closeMobileMenu();
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.mobile-menu-backdrop');

    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle('mobile-open');
    if (backdrop) {
        backdrop.classList.toggle('visible', isOpen);
    }
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.mobile-menu-backdrop');

    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }
    if (backdrop) {
        backdrop.classList.remove('visible');
    }
}

window.addEventListener('orientationchange', function() {
    closeMobileMenu();
});
