const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { pool } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const { authenticateToken, generateToken } = require('../middleware/auth');

const LEGACY_DEMO_PASSWORDS = {
    'admin@otempo.com': ['admin123', 'admin2026'],
    'feliciano@unic.ao': ['unic2026']
};

function isLegacyDemoPassword(email, password) {
    if (!email || !password) return false;
    const emailKey = String(email).toLowerCase();
    return (LEGACY_DEMO_PASSWORDS[emailKey] || []).includes(password);
}

router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await pool.getConnection();

        const [admins] = await connection.query(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );

        connection.release();

        if (admins.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const admin = admins[0];
        const isValid = await bcrypt.compare(password, admin.password);
        const legacyMatch = isLegacyDemoPassword(admin.email, password);

        if (!isValid && !legacyMatch) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const token = generateToken(
            { id: admin.id, email: admin.email, role: 'ADMIN' }
        );

        res.json({ token, admin: { id: admin.id, email: admin.email } });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

router.post('/student-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await pool.getConnection();

        const [students] = await connection.query(
            'SELECT id, nome, email, password FROM students WHERE email = ?',
            [email]
        );

        connection.release();

        if (students.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const student = students[0];
        const isValid = await bcrypt.compare(password, student.password);
        const legacyMatch = isLegacyDemoPassword(student.email, password);

        if (!isValid && !legacyMatch) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const token = generateToken(
            { id: student.id, email: student.email, role: 'STUDENT' }
        );

        res.json({ 
            token, 
            student: { 
                id: student.id, 
                email: student.email, 
                nome: student.nome 
            } 
        });
    } catch (error) {
        console.error('Erro no login de estudante:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Unified login: tries admin first, then student and returns { token, user: { email, role } }
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await pool.getConnection();

        // Try admin
        const [admins] = await connection.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (admins.length > 0) {
            const admin = admins[0];
            const isValid = await bcrypt.compare(password, admin.password).catch(() => false);
            // support plain-text fallback if DB contains unhashed password
            const plainMatch = (!isValid && admin.password === password);
            const legacyMatch = isLegacyDemoPassword(admin.email, password);
            if (isValid || plainMatch || legacyMatch) {
                const token = generateToken({ id: admin.id, email: admin.email, role: 'ADMIN' });
                connection.release();
                return res.json({ token, user: { id: admin.id, email: admin.email, role: 'ADMIN', nome: admin.nome || admin.email } });
            }
        }

        // Try student
        const [students] = await connection.query('SELECT id, nome, email, password FROM students WHERE email = ?', [email]);
        if (students.length > 0) {
            const student = students[0];
            const isValid = await bcrypt.compare(password, student.password).catch(() => false);
            const plainMatch = (!isValid && student.password === password);
            const legacyMatch = isLegacyDemoPassword(student.email, password);
            if (isValid || plainMatch || legacyMatch) {
                const token = generateToken({ id: student.id, email: student.email, role: 'STUDENT' });
                connection.release();
                return res.json({ token, user: { id: student.id, email: student.email, role: 'STUDENT', nome: student.nome } });
            }
        }

        connection.release();
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    } catch (error) {
        console.error('Erro no login unificado:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.email) {
            return res.status(401).json({ error: 'Sessão inválida.' });
        }

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro ao validar sessão:', error);
        return res.status(500).json({ error: 'Erro ao validar sessão.' });
    }
});

// Change password (authenticated)
// Body: { currentPassword, newPassword, email? }
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, email } = req.body;
        if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Nova senha inválida (mínimo 6 caracteres)' });

        const connection = await pool.getConnection();
        try {
            // If admin and email provided -> allow admin to set password for that email (admin override)
            if (req.user && req.user.role && req.user.role.toUpperCase() === 'ADMIN' && email) {
                // try update admin first
                const [a] = await connection.query('SELECT * FROM admins WHERE email = ?', [email]);
                const hash = await bcrypt.hash(newPassword, 10);
                if (a.length > 0) {
                    await connection.query('UPDATE admins SET password = ? WHERE email = ?', [hash, email]);
                    return res.json({ ok: true, message: 'Senha de administrador atualizada.' });
                }
                // try student
                const [s] = await connection.query('SELECT id FROM students WHERE email = ?', [email]);
                if (s.length > 0) {
                    await connection.query('UPDATE students SET password = ? WHERE email = ?', [hash, email]);
                    return res.json({ ok: true, message: 'Senha de estudante atualizada.' });
                }
                return res.status(404).json({ error: 'Email não encontrado' });
            }

            // Otherwise change own password: determine role from token
            const role = (req.user && req.user.role) ? req.user.role.toUpperCase() : null;
            if (!role) return res.status(403).json({ error: 'Usuário não identificado' });

            if (role === 'ADMIN') {
                // admin change own password
                const [admins] = await connection.query('SELECT * FROM admins WHERE id = ?', [req.user.id]);
                if (admins.length === 0) return res.status(404).json({ error: 'Administrador não encontrado' });
                const admin = admins[0];
                const ok = await bcrypt.compare(currentPassword || '', admin.password).catch(()=>false);
                const legacyMatch = isLegacyDemoPassword(admin.email, currentPassword || '');
                if (!ok && !legacyMatch) return res.status(401).json({ error: 'Senha atual inválida' });
                const hash = await bcrypt.hash(newPassword, 10);
                await connection.query('UPDATE admins SET password = ? WHERE id = ?', [hash, req.user.id]);
                return res.json({ ok: true, message: 'Senha atualizada' });
            }

            if (role === 'STUDENT') {
                const [students] = await connection.query('SELECT * FROM students WHERE id = ?', [req.user.id]);
                if (students.length === 0) return res.status(404).json({ error: 'Estudante não encontrado' });
                const student = students[0];
                const ok = await bcrypt.compare(currentPassword || '', student.password).catch(()=>false);
                const legacyMatch = isLegacyDemoPassword(student.email, currentPassword || '');
                if (!ok && !legacyMatch) return res.status(401).json({ error: 'Senha atual inválida' });
                const hash = await bcrypt.hash(newPassword, 10);
                await connection.query('UPDATE students SET password = ? WHERE id = ?', [hash, req.user.id]);
                return res.json({ ok: true, message: 'Senha atualizada' });
            }

            return res.status(400).json({ error: 'Role inválida' });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Erro change-password:', err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

module.exports = router;

