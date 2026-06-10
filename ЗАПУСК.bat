@echo off
chcp 65001 >nul
title AgroVerse - Launcher
cd /d "%~dp0"

echo.
echo ===============================================
echo    AgroVerse - Zapusk proekta
echo ===============================================
echo.

REM --- Poisk Python ---
set PYTHON=
where python >nul 2>nul && set PYTHON=python
if "%PYTHON%"=="" (where py >nul 2>nul && set PYTHON=py)
if "%PYTHON%"=="" (
    echo [OSHIBKA] Python ne nayden!
    echo Ustanovi Python s https://python.org
    echo VAZHNO: postav galochku "Add Python to PATH"
    echo.
    pause
    exit /b 1
)
echo [1/4] Python OK: %PYTHON%

REM --- Sozdanie venv ---
set VENVPY=agroverse back\venv\Scripts\python.exe
if not exist "%VENVPY%" (
    echo [2/4] Sozdayu virtualnoe okruzhenie...
    %PYTHON% -m venv "agroverse back\venv"
    echo       Ustanovka bibliotek ^(podozhdi 1 minutu^)...
    "%VENVPY%" -m pip install --upgrade pip -q
    "%VENVPY%" -m pip install -r "agroverse back\requirements.txt" -q
) else (
    echo [2/4] Okruzhenie uzhe est
)

REM --- Zapusk Backend v otdelnom okne ---
echo [3/4] Zapusk Backend ^(port 8000^)...
start "AgroVerse BACKEND" cmd /k "cd /d "%~dp0agroverse back" && "%~dp0agroverse back\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo       Zhdu zapuska backend ^(6 sek^)...
timeout /t 6 /nobreak >nul

REM --- Zapusk Frontend v otdelnom okne ---
echo [4/4] Zapusk Frontend ^(port 5500^)...
start "AgroVerse FRONTEND" cmd /k "cd /d "%~dp0agroverse front" && "%~dp0agroverse back\venv\Scripts\python.exe" -m http.server 5500"

timeout /t 3 /nobreak >nul

REM --- Otkryvaem brauzer ---
echo.
echo ===============================================
echo    Gotovo! Otkryvayu sayt v brauzere...
echo ===============================================
echo.
echo   Sayt:     http://127.0.0.1:5500
echo   Backend:  http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo.
echo   NE ZAKRYVAY okna BACKEND i FRONTEND!
echo.

timeout /t 2 /nobreak >nul
start http://127.0.0.1:5500

echo Etot launcher mozhno zakryt - sayt prodolzhit rabotat.
pause
