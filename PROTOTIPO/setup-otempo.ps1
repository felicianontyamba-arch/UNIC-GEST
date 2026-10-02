Write-Host "🚀 Iniciando configuracao do O Tempo..." -ForegroundColor Green

if (-not (Test-Path ".env")) {
    @"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=otempo_db
JWT_SECRET=sua_chave_secreta_super_segura_2026
PORT=3000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
"@ | Set-Content -Path ".env"
    Write-Host "✅ Ficheiro .env criado com sucesso!" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️ Ficheiro .env ja existe." -ForegroundColor Yellow
}

Write-Host "📦 A atualizar a base de dados..." -ForegroundColor Cyan
node .\scripts\populate-db.js

Write-Host "🌐 A iniciar o servidor..." -ForegroundColor Green
npm start
