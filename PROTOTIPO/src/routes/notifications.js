const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Demo fallback data
const demoNotifications = [
    {
        id: 1,
        type: 'urgent',
        icon: '⚠️',
        title: 'Trabalho de Programação atrasado',
        task: 'Trabalho de Programação - Programação',
        deadline: '16 Set',
        time: 'Há 2 dias',
        priority: 'high',
        read: false
    },
    {
        id: 2,
        type: 'urgent',
        icon: '🔴',
        title: 'Prazos próximos',
        task: 'Relatório de Base de Dados - Base de Dados',
        deadline: '18 Set',
        time: 'Há 1 dia',
        priority: 'high',
        read: false
    }
];

router.get('/', authenticateToken, async (req, res) => {
    try {
        // Try to build notifications from tasks table (if exists)
        const connection = await pool.getConnection();
        try {
            // Prefer explicit notifications table filtered by logged user
            const userId = Number(req.user && req.user.id) || 0;
            if (!userId) return res.status(400).json({ error: 'User id missing in token' });

            const [rows] = await connection.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [userId]);
            if (!rows || rows.length === 0) {
                return res.json(demoNotifications.map(d => ({ ...d, user_id: userId })));
            }

            res.json(rows.map(r => ({
                id: r.id,
                type: r.type,
                icon: r.type === 'completed' ? '✅' : (r.type === 'urgent' ? '⚠️' : '⏰'),
                title: r.title || '',
                task: r.message || '',
                deadline: r.meta && r.meta.deadline ? r.meta.deadline : '',
                time: '',
                priority: (r.meta && r.meta.priority) || 'low',
                read: Boolean(r.is_read)
            })));
        } finally {
            connection.release();
        }
    } catch (error) {
        console.warn('notifications route fallback to demo:', error.message);
        res.json(demoNotifications);
    }
});

module.exports = router;
