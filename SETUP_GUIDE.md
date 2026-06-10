# 🌾 AgroVerse - Инструкция по запуску

## ✅ Что было исправлено

### Бэк (FastAPI)
- ✅ **HTTPException** - правильный формат ошибок вместо `(dict, status_code)`
- ✅ **Pydantic Models** - добавлены `RegisterRequest`, `LoginRequest`, `CreateProductRequest`, `CreateOrderRequest`
- ✅ **Header parsing** - правильная работа с Authorization header через `Header(None)`
- ✅ **CORS** - расширены origins с поддержкой 127.0.0.1 и *

### Фронт (JavaScript)
- ✅ **API.js** - правильная отправка JSON с Content-Type
- ✅ **auth.js** - правильное сохранение токена и данных пользователя
- ✅ **Никаких изменений не требуется** - фронт уже работает

---

## 📋 Требования

- **Python 3.8+** (на Windows устанавливается как часть Visual Studio Code или отдельно)
- **Live Server** (расширение для VS Code) или простой HTTP сервер
- **Node.js** (опционально, если используешь http-server)

---

## 🚀 Шаг 1: Распакуй проект

```bash
unzip agroverse-fixed.zip
cd agroverse_check
```

Структура:
```
agroverse_check/
├── agroverse\ back/     # FastAPI backend (Python)
├── agroverse\ front/    # Frontend (HTML/JS)
├── START.ps1            # Скрипт запуска для Windows PowerShell
└── SETUP_GUIDE.md       # Этот файл
```

---

## 🔧 Шаг 2: Запуск бэка (FastAPI)

### Вариант 1: Через PowerShell (рекомендуется на Windows)

1. Открой PowerShell в папке проекта
2. Запусти:
   ```powershell
   python -m venv "agroverse back/venv"
   ```
3. Активируй виртуальное окружение:
   ```powershell
   & "agroverse back/venv/Scripts/Activate.ps1"
   ```
4. Установи зависимости:
   ```powershell
   cd "agroverse back"
   pip install -r requirements.txt
   ```
5. Запусти сервер:
   ```powershell
   python main.py
   ```

Ожидаемый вывод:
```
🌾 AgroVerse API запущен на http://127.0.0.1:8000
📚 API Docs: http://127.0.0.1:8000/docs
✅ CORS включен для http://127.0.0.1:5500
```

### Вариант 2: Через CMD (если PowerShell не работает)

```cmd
python -m venv "agroverse back/venv"
"agroverse back/venv/Scripts/activate.bat"
cd "agroverse back"
pip install -r requirements.txt
python main.py
```

### Вариант 3: Через Bash (WSL2 или Linux)

```bash
python3 -m venv "agroverse back/venv"
source "agroverse back/venv/bin/activate"
cd "agroverse back"
pip install -r requirements.txt
python main.py
```

---

## 🌐 Шаг 3: Запуск фронта (HTML/JS)

### Вариант 1: Через VS Code Live Server (самый простой)

1. Открой папку `agroverse front` в VS Code
2. Правый клик на `index.html` → `Open with Live Server`
3. Автоматически откроется http://127.0.0.1:5500

### Вариант 2: Через Python HTTP Server

```bash
cd "agroverse front"
python -m http.server 5500
```

Затем открой http://127.0.0.1:5500

### Вариант 3: Через Node.js http-server

```bash
npm install -g http-server
cd "agroverse front"
http-server -p 5500
```

---

## ✨ Шаг 4: Проверка

1. **Откройся на фронте**: http://127.0.0.1:5500
2. **Проверь консоль**: F12 → Console
3. **Тестовая регистрация**:
   - Имя: ` Азиз`
   - Телефон: `+998901234567`
   - Email: `aziz@test.com`
   - Пароль: `123456`
   - Роль: `Покупатель` или `Фермер`

4. **Успех**, если:
   - ✅ Регистрация проходит без ошибок
   - ✅ Токен сохраняется в localStorage
   - ✅ Перенаправляет на дашборд/каталог

---

## 🐛 Если что-то не работает

### Проблема: `Connection refused` на 8000

**Решение**: Проверь, запущен ли бэк
```powershell
# Смотри процессы Python
Get-Process python

# Если нужно, переподключись:
python main.py
```

### Проблема: CORS ошибка

**Это ИСПРАВЛЕНО в main.py**, но если еще есть:
- Убедись, что фронт на `http://127.0.0.1:5500` (не `localhost`)
- Перезагрузи страницу (Ctrl+F5)
- Очисти localStorage: F12 → Application → Clear Storage

### Проблема: 404 при регистрации

**Причина**: Неправильный BASE_URL в api.js
- Открой `agroverse front/js/api.js`
- Проверь: `const BASE_URL = 'http://localhost:8000';`
- Если нужно, измени на: `const BASE_URL = 'http://127.0.0.1:8000';`

---

## 📊 Полезные ссылки во время разработки

- **API Docs (Swagger)**: http://127.0.0.1:8000/docs
- **API ReDoc**: http://127.0.0.1:8000/redoc
- **Frontend**: http://127.0.0.1:5500
- **Browser DevTools**: F12

---

## 🎯 Далее

После успешного запуска:
1. Зарегистрируйся как `Фермер` и добавь продукты
2. Зарегистрируйся как `Покупатель` и пересмотри каталог
3. Тестируй заказы и функциональность

Удачи! 🚀
