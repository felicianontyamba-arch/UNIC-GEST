const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function normalizeDateValue(value) {
    if (!value) return null;
    if (typeof value === 'string') return value.slice(0, 10);
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return String(value).slice(0, 10);
}

function normalizeTaskRecord(task) {
    if (!task) return task;
    return {
        ...task,
        data_prazo: normalizeDateValue(task.data_prazo),
        data_inicio: normalizeDateValue(task.data_inicio),
        data_fim: normalizeDateValue(task.data_fim)
    };
}

router.get('/students', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [students] = await connection.query('SELECT * FROM students');
        connection.release();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/students/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [students] = await connection.query(
            'SELECT id, nome, email, curso, semestre, trimestre, disciplinas, telefone, morada FROM students WHERE id = ?',
            [id]
        );
        connection.release();

        if (students.length === 0) {
            return res.status(404).json({ error: 'Estudante não encontrado' });
        }

        return res.json(students[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/students', authenticateToken, async (req, res) => {
    try {
        const { nome, email, curso, semestre, trimestre, telefone, morada, disciplinas } = req.body;
        const connection = await pool.getConnection();

        const normalizedDisciplinas = Array.isArray(disciplinas)
            ? JSON.stringify(disciplinas)
            : (typeof disciplinas === 'string' ? disciplinas : null);

        await connection.query(
            'INSERT INTO students (nome, email, curso, semestre, trimestre, telefone, morada, disciplinas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, email, curso, semestre, trimestre || null, telefone, morada || null, normalizedDisciplinas]
        );

        connection.release();
        res.status(201).json({ message: 'Estudante criado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/students/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, curso, semestre, trimestre, telefone, morada, disciplinas } = req.body;
        const connection = await pool.getConnection();

        const normalizedDisciplinas = Array.isArray(disciplinas)
            ? JSON.stringify(disciplinas)
            : (typeof disciplinas === 'string' ? disciplinas : null);

        await connection.query(
            'UPDATE students SET nome = ?, email = ?, curso = ?, semestre = ?, trimestre = ?, telefone = ?, morada = ?, disciplinas = ? WHERE id = ?',
            [nome, email, curso, semestre, trimestre || null, telefone, morada ?? null, normalizedDisciplinas, id]
        );

        connection.release();
        res.json({ message: 'Estudante atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/students/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        await connection.query('DELETE FROM students WHERE id = ?', [id]);

        connection.release();
        res.json({ message: 'Estudante deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [tasks] = await connection.query(
            `SELECT t.*, s.nome AS student_nome, s.email AS student_email
             FROM tasks t
             LEFT JOIN students s ON s.id = t.student_id
             ORDER BY t.id DESC`
        );
        connection.release();
        res.json(tasks.map(normalizeTaskRecord));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tasks/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const connection = await pool.getConnection();

        const [tasks] = await connection.query(
            'SELECT * FROM tasks WHERE student_id = ? ORDER BY created_at DESC',
            [studentId]
        );

        connection.release();
        res.json(tasks.map(normalizeTaskRecord));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/tasks', authenticateToken, async (req, res) => {
    try {
        const { titulo, descricao, data_prazo, data_inicio, data_fim, status, disciplina, student_id, studentId } = req.body;
        const resolvedStudentId = Number(student_id ?? studentId ?? req.user?.id ?? 0);

        if (!titulo || !String(titulo).trim()) {
            return res.status(400).json({ error: 'O título da tarefa é obrigatório.' });
        }

        if (!resolvedStudentId) {
            return res.status(400).json({ error: 'Estudante inválido.' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO tasks (student_id, titulo, descricao, data_prazo, data_inicio, data_fim, status, disciplina) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                resolvedStudentId,
                String(titulo).trim(),
                descricao || null,
                data_prazo || null,
                data_inicio || data_prazo || null,
                data_fim || data_prazo || null,
                status || 'pendente',
                disciplina || null
            ]
        );

        // After creating task, insert a corresponding notification for the student
        try {
            const notificationMessage = `Nova tarefa criada: ${String(titulo).trim()}`;
            const meta = JSON.stringify({ task_id: result.insertId, priority: status === 'pendente' ? 'medium' : 'low', deadline: data_prazo || null });
            await connection.query(
                'INSERT INTO notifications (user_id, type, title, message, is_read, meta) VALUES (?, ?, ?, ?, ?, ?)',
                [resolvedStudentId, 'upcoming', `Nova tarefa: ${String(titulo).trim()}`, notificationMessage, 0, meta]
            );
        } catch (err) {
            console.warn('Falha ao criar notificação automática:', err.message);
        }

        const [tasks] = await connection.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        connection.release();
        return res.status(201).json(normalizeTaskRecord(tasks[0]));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/courses', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [courses] = await connection.query(
            'SELECT * FROM courses ORDER BY nome ASC'
        );
        connection.release();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/courses', authenticateToken, async (req, res) => {
    try {
        const { nome, codigo, descricao } = req.body;
        if (!nome || !String(nome).trim()) {
            return res.status(400).json({ error: 'O nome do curso é obrigatório.' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO courses (nome, codigo, descricao) VALUES (?, ?, ?)',
            [String(nome).trim(), codigo || null, descricao || null]
        );
        connection.release();

        const [courses] = await connection.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);
        return res.status(201).json(courses[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put('/courses/:courseId', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { nome, codigo, descricao } = req.body;
        if (!nome || !String(nome).trim()) {
            return res.status(400).json({ error: 'O nome do curso é obrigatório.' });
        }

        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE courses SET nome = ?, codigo = ?, descricao = ? WHERE id = ?',
            [String(nome).trim(), codigo || null, descricao || null, courseId]
        );
        connection.release();

        const [courses] = await connection.query('SELECT * FROM courses WHERE id = ?', [courseId]);
        return res.json(courses[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.delete('/courses/:courseId', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM courses WHERE id = ?', [courseId]);
        connection.release();
        return res.json({ message: 'Curso eliminado com sucesso.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/courses/:courseId/subjects', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const connection = await pool.getConnection();
        const [subjects] = await connection.query(
            'SELECT * FROM subjects WHERE course_id = ? ORDER BY nome ASC',
            [courseId]
        );
        connection.release();
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/courses/:courseId/subjects', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { nome, codigo, professor, creditos } = req.body;
        if (!nome || !String(nome).trim()) {
            return res.status(400).json({ error: 'O nome da disciplina é obrigatório.' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO subjects (course_id, nome, codigo, professor, creditos) VALUES (?, ?, ?, ?, ?)',
            [courseId, String(nome).trim(), codigo || null, professor || null, Number(creditos || 0)]
        );
        const [subjects] = await connection.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);
        connection.release();
        return res.status(201).json(subjects[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put('/courses/:courseId/subjects/:subjectId', authenticateToken, async (req, res) => {
    try {
        const { courseId, subjectId } = req.params;
        const { nome, codigo, professor, creditos } = req.body;
        if (!nome || !String(nome).trim()) {
            return res.status(400).json({ error: 'O nome da disciplina é obrigatório.' });
        }

        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE subjects SET nome = ?, codigo = ?, professor = ?, creditos = ? WHERE id = ? AND course_id = ?',
            [String(nome).trim(), codigo || null, professor || null, Number(creditos || 0), subjectId, courseId]
        );
        connection.release();

        const [subjects] = await connection.query('SELECT * FROM subjects WHERE id = ? AND course_id = ?', [subjectId, courseId]);
        return res.json(subjects[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.delete('/courses/:courseId/subjects/:subjectId', authenticateToken, async (req, res) => {
    try {
        const { courseId, subjectId } = req.params;
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM subjects WHERE id = ? AND course_id = ?', [subjectId, courseId]);
        connection.release();
        return res.json({ message: 'Disciplina eliminada com sucesso.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
