// server.js - Entry point da aplicação
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    const secret = process.env.JWT_SECRET || '(not set)';
    const masked = typeof secret === 'string' && secret.length > 6 ? secret.slice(0,3) + '...' + secret.slice(-3) : secret;
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🌐 Acesso via rede local: http://SEU_IP:${PORT}`);
    console.log(`🔐 JWT secret (masked): ${masked}`);
});

module.exports = app;
