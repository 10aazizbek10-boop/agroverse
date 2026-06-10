# ===========================================================
#   AgroVerse - Запуск проекта (Windows)
#   Запускает Backend + Frontend и открывает браузер
# ===========================================================

# Переходим в папку, где лежит скрипт
Set-Location -Path $PSScriptRoot

$BackDir  = Join-Path $PSScriptRoot "agroverse back"
$FrontDir = Join-Path $PSScriptRoot "agroverse front"
$VenvDir  = Join-Path $BackDir "venv"
$VenvPy   = Join-Path $VenvDir "Scripts\python.exe"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   AgroVerse - Запуск проекта" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ----- Проверка Python -----
Write-Host "[1/4] Проверка Python..." -ForegroundColor Yellow
$pythonCmd = $null
foreach ($cmd in @("python", "py", "python3")) {
    try {
        $v = & $cmd --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pythonCmd = $cmd
            Write-Host "      OK: $v (команда: $cmd)" -ForegroundColor Green
            break
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Host ""
    Write-Host "[ОШИБКА] Python не найден!" -ForegroundColor Red
    Write-Host "Установи Python с https://python.org" -ForegroundColor Red
    Write-Host "ВАЖНО: при установке поставь галочку 'Add Python to PATH'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Нажми Enter чтобы закрыть"
    exit 1
}

# ----- Создание venv -----
Write-Host ""
Write-Host "[2/4] Виртуальное окружение..." -ForegroundColor Yellow
if (-not (Test-Path $VenvPy)) {
    Write-Host "      Создаю venv (подожди немного)..." -ForegroundColor Gray
    & $pythonCmd -m venv "$VenvDir"
    if (-not (Test-Path $VenvPy)) {
        Write-Host "[ОШИБКА] Не удалось создать venv!" -ForegroundColor Red
        Read-Host "Нажми Enter чтобы закрыть"
        exit 1
    }
    Write-Host "      Устанавливаю зависимости (1-2 минуты)..." -ForegroundColor Gray
    & $VenvPy -m pip install --upgrade pip -q
    & $VenvPy -m pip install -r (Join-Path $BackDir "requirements.txt") -q
    Write-Host "      OK: окружение готово" -ForegroundColor Green
} else {
    Write-Host "      OK: venv уже есть" -ForegroundColor Green
}

# ----- Запуск Backend в отдельном окне -----
Write-Host ""
Write-Host "[3/4] Запуск Backend (порт 8000)..." -ForegroundColor Yellow

$backScript = @"
Set-Location '$BackDir'
Write-Host '=== AgroVerse BACKEND ===' -ForegroundColor Cyan
Write-Host 'API: http://127.0.0.1:8000' -ForegroundColor Green
Write-Host 'Docs: http://127.0.0.1:8000/docs' -ForegroundColor Green
Write-Host 'Не закрывай это окно пока работаешь!' -ForegroundColor Yellow
Write-Host ''
& '$VenvPy' -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Write-Host ''
Write-Host 'Backend остановлен.' -ForegroundColor Red
Read-Host 'Нажми Enter чтобы закрыть это окно'
"@

# Сохраняем во временный файл и запускаем — так надёжнее, окно не закрывается
$backFile = Join-Path $env:TEMP "agroverse_back.ps1"
$backScript | Out-File -FilePath $backFile -Encoding UTF8
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-File", "`"$backFile`""

Write-Host "      Backend запускается в отдельном окне..." -ForegroundColor Gray
Write-Host "      Жду 6 секунд..." -ForegroundColor Gray
Start-Sleep -Seconds 6
Write-Host "      OK" -ForegroundColor Green

# ----- Запуск Frontend в отдельном окне -----
Write-Host ""
Write-Host "[4/4] Запуск Frontend (порт 5500)..." -ForegroundColor Yellow

$frontScript = @"
Set-Location '$FrontDir'
Write-Host '=== AgroVerse FRONTEND ===' -ForegroundColor Cyan
Write-Host 'Сайт: http://127.0.0.1:5500' -ForegroundColor Green
Write-Host 'Не закрывай это окно пока работаешь!' -ForegroundColor Yellow
Write-Host ''
& '$VenvPy' -m http.server 5500
Write-Host ''
Write-Host 'Frontend остановлен.' -ForegroundColor Red
Read-Host 'Нажми Enter чтобы закрыть это окно'
"@

$frontFile = Join-Path $env:TEMP "agroverse_front.ps1"
$frontScript | Out-File -FilePath $frontFile -Encoding UTF8
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-File", "`"$frontFile`""

Write-Host "      Frontend запускается в отдельном окне..." -ForegroundColor Gray
Start-Sleep -Seconds 3
Write-Host "      OK" -ForegroundColor Green

# ----- Открываем браузер -----
Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "   Готово! Открываю браузер..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Сайт:     http://127.0.0.1:5500" -ForegroundColor Cyan
Write-Host "  Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:5500"

Write-Host "Открылись 2 окна: BACKEND и FRONTEND." -ForegroundColor Yellow
Write-Host "Не закрывай их пока работаешь с сайтом!" -ForegroundColor Yellow
Write-Host ""
Read-Host "Нажми Enter чтобы закрыть это окно (сайт продолжит работать)"
