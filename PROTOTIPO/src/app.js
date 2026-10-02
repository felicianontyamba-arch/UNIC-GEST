const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const exportRoutes = require('./routes/exports');
const passwordRoutes = require('./routes/passwords');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';
const rootDir = path.join(__dirname, '..');

app.disable('x-powered-by');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin ||
            origin === FRONTEND_URL ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.startsWith('http://0.0.0.0') ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            origin.startsWith('http://172.')) {
            callback(null, true);
            return;
        }

        callback(new Error('Origem não autorizada pelo CORS'));
    },
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const noCachePaths = ['/', '.html', '.js', '.css'];
    const shouldNoCache = noCachePaths.some((value) =>
        value === '/' ? req.path === '/' : req.path.endsWith(value)
    );

    if (shouldNoCache) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }

    next();
});

app.use(express.static(rootDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'INDEX.html'));
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        app: 'O Tempo',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api', studentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use((err, req, res, next) => {
    console.error('Erro interno:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

module.exports = app;
