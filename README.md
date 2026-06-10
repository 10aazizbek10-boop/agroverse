# 🌾 AgroVerse - Агромаркетплейс

Полнофункциональный маркетплейс для торговли фермерскими продуктами. 

**Версия:** 2.0  
**Статус:** ✅ Готово к запуску

---

## 📦 Что в проекте

```
agroverse_check/
├── agroverse back/          # FastAPI Backend (Python)
│   ├── main.py             # Главный файл
│   ├── requirements.txt     # Зависимости Python
│   ├── venv/               # Виртуальное окружение
│   └── app/                # Структурированный код (опционально)
│
├── agroverse front/         # Frontend (HTML/JS/CSS)
│   ├── index.html          # Главная страница
│   ├── js/                 # JavaScript логика
│   │   ├── api.js          # API клиент
│   │   ├── auth.js         # Управление авторизацией
│   │   ├── router.js       # SPA роутинг
│   │   └── pages/          # Страницы приложения
│   └── css/                # Стили
│
├── START.ps1               # ⭐ Один клик для запуска (Windows)
├── SETUP_GUIDE.md          # Подробная инструкция
└── README.md               # Этот файл
```

---

## 🚀 Быстрый старт (Windows)

### Способ 1: Один клик (рекомендуется)

1. Распакуй `agroverse-fixed.zip`
2. Открой PowerShell в папке проекта
3. Запусти:
   ```powershell
   .\START.ps1
   ```
4. Дождись, браузер откроется сам на http://127.0.0.1:5500

**Готово!** Проект запущен.

### Способ 2: Ручной запуск

**Терминал 1 - Backend:**
```powershell
cd "agroverse back"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

**Терминал 2 - Frontend:**
```powershell
cd "agroverse front"
python -m http.server 5500
# или через VS Code: Right-Click index.html → Open with Live Server
```

Затем открой http://127.0.0.1:5500

---

## 🐛 Что было исправлено

### ✅ Backend (main.py)
- **HTTPException** вместо неправильного формата `(dict, status_code)`
- **Pydantic Models** для валидации запросов
- **Header parsing** для Authorization
- **CORS** поддерживает все нужные origins

### ✅ Frontend (API & Auth)
- **Content-Type** правильно установлен для JSON
- **Authorization** корректно отправляется в headers
- **localStorage** правильно хранит токен и данные пользователя

---

## 🧪 Тестирование

### Тестовый аккаунт

**Покупатель:**
- Телефон: `+998901234567`
- Пароль: `123456`

**Фермер:**
- Телефон: `+998902222222`
- Пароль: `123456`

Или создай свой при регистрации.

---

## 🔗 Полезные ссылки

| Адрес | Описание |
|-------|----------|
| http://127.0.0.1:5500 | 🌐 Frontend приложение |
| http://127.0.0.1:8000 | 🔧 Backend API |
| http://127.0.0.1:8000/docs | 📚 Swagger UI (API документация) |
| http://127.0.0.1:8000/redoc | 📖 ReDoc (альтернативная документация) |

---

## 📋 API Endpoints

### Auth
- `POST /api/auth/register` — Регистрация
- `POST /api/auth/login` — Вход
- `GET /api/auth/me` — Получить профиль

### Products
- `GET /api/products` — Список продуктов
- `GET /api/products/{id}` — Один продукт
- `POST /api/products` — Создать продукт (фермер)

### Orders
- `GET /api/orders/my` — Мои заказы
- `POST /api/orders` — Создать заказ

### Wallet
- `GET /api/payment/wallet` — Баланс кошелька

Полная документация: http://127.0.0.1:8000/docs

---

## ⚙️ Технологический стек

| Слой | Технология |
|------|-----------|
| **Backend** | FastAPI (Python) |
| **Frontend** | Vanilla JavaScript + HTML + CSS |
| **Database** | In-Memory (Mock) — легко заменить на PostgreSQL |
| **Auth** | JWT токены |
| **API** | REST |

---

## 🎯 Основные функции

✅ Регистрация и авторизация  
✅ Роли пользователей (Фермер, Покупатель)  
✅ Каталог продуктов  
✅ Добавление продуктов (фермеры)  
✅ Заказы  
✅ Уведомления (Toast)  
✅ Современный UI с анимациями  

---

## 🆘 Решение проблем

### Проблема: "Connection refused" на 8000
**Решение:** Backend не запущен. Проверь терминал backend'а и запусти `python main.py`

### Проблема: CORS ошибка в консоли
**Решение:** 
1. Убедись, что фронт на `http://127.0.0.1:5500` (не `localhost`)
2. Перезагрузи страницу (Ctrl+F5)
3. Очисти кеш: DevTools → Application → Clear Storage

### Проблема: 404 при регистрации
**Решение:** Проверь, что BASE_URL в `js/api.js` указывает на `http://localhost:8000`

### Проблема: START.ps1 не запускается
**Решение:** Разреши выполнение скриптов:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Затем попробуй снова: `.\START.ps1`

---

## 📞 Быстрые команды

### Чистка (если что-то сломалось)
```powershell
# Удалить venv и переустановить
Remove-Item "agroverse back/venv" -Recurse
python -m venv "agroverse back/venv"
& "agroverse back/venv/Scripts/Activate.ps1"
cd "agroverse back"
pip install -r requirements.txt
```

### Просмотр логов API
API логирует все в консоль. Если Backend не отвечает, смотри ошибки там.

### Отладка JavaScript
Открой DevTools (F12) → Console. Там все ошибки.

---

## 🚀 Что дальше?

1. ✅ Запусти проект
2. ✅ Протестируй регистрацию и вход
3. ✅ Добавь продукты от имени фермера
4. ✅ Заказывай как покупатель
5. 📝 Подключи реальную БД (PostgreSQL вместо mock)
6. 🔒 Добавь хеширование паролей (bcrypt)
7. 📲 Деплой на хостинг

---

## 📄 Лицензия

MIT

---

**Создано для AgroVerse** 🌾  
Версия 2.0 | 2026
