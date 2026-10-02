$ErrorActionPreference = 'Stop'

Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' O TEMPO - START + TEST LOGIN' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan

$ports = 3000, 5000, 5001, 8080
foreach ($p in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction Stop
        if ($conns) {
            foreach ($c in $conns) {
                try {
                    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
                } catch {}
            }
        }
    } catch {}
}

Write-Host 'A limpar portas ocupadas...' -ForegroundColor Yellow
Start-Sleep -Seconds 1

$projectPath = 'C:\Users\Admin\Desktop\PROTOTIPO'
Set-Location $projectPath

Write-Host 'A iniciar o backend...' -ForegroundColor Green
$server = Start-Process -FilePath 'node' -ArgumentList '.\server.js' -WorkingDirectory $projectPath -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

Write-Host 'A verificar a saúde da API...' -ForegroundColor Green
$health = Invoke-RestMethod -Uri 'http://localhost:5000/api/health'
$health | ConvertTo-Json -Depth 5

Write-Host 'A testar login do admin...' -ForegroundColor Green
$adminBody = '{"email":"admin@otempo.com","password":"admin123"}'
$adminLogin = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body $adminBody
$adminLogin | ConvertTo-Json -Depth 5 -Compress

Write-Host 'A testar login do estudante...' -ForegroundColor Green
$studentBody = '{"email":"feliciano@unic.ao","password":"unic2026"}'
$studentLogin = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body $studentBody
$studentLogin | ConvertTo-Json -Depth 5 -Compress

Write-Host 'A abrir a página correta...' -ForegroundColor Green
Start-Process 'http://localhost:5000/login.html'

Write-Host '============================================================' -ForegroundColor Cyan
Write-Host 'SETUP TERMINADO COM SUCESSO' -ForegroundColor Green
Write-Host 'Open: http://localhost:5000/login.html' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
