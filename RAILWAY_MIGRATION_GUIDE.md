# Миграция с Render.com на Railway

## Пошаговое руководство по миграции

### 1. Подготовка к миграции

#### Создание аккаунта Railway
1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Подключите ваш репозиторий

#### Экспорт данных с Render.com
```bash
# Экспорт базы данных PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# Экспорт переменных окружения
# Скопируйте все переменные из Render.com dashboard
```

### 2. Настройка Railway

#### Создание проекта
1. В Railway dashboard нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Выберите ваш репозиторий
4. Railway автоматически определит структуру проекта

#### Добавление сервисов
1. **PostgreSQL Database**:
   - Нажмите "+ New" → "Database" → "PostgreSQL"
   - Railway создаст базу данных автоматически

2. **Redis Cache**:
   - Нажмите "+ New" → "Database" → "Redis"
   - Railway создаст Redis инстанс

3. **Backend Service**:
   - Railway автоматически определит backend как Node.js сервис
   - Настройте переменные окружения

### 3. Переменные окружения

#### Обязательные переменные для Railway:

```bash
# Database (Railway автоматически предоставит)
DATABASE_URL=postgresql://user:password@host:port/database
PGUSER=postgres
PGHOST=containers-us-west-xxx.railway.app
PGDATABASE=railway
PGPASSWORD=your_password
PGPORT=5432

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=production

# Redis (Railway автоматически предоставит)
REDIS_URL=redis://default:password@host:port

# Cloudinary (оставьте те же значения)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Logging
LOG_LEVEL=info
```

### 4. Миграция базы данных

#### Импорт данных в Railway PostgreSQL:
```bash
# Подключение к Railway PostgreSQL
psql $DATABASE_URL

# Импорт схемы и данных
\i setup-db.sql
\i setup-listings.sql
\i setup-images.sql
```

#### Альтернативно через Railway CLI:
```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Подключение к проекту
railway link

# Импорт данных
railway run psql < backup.sql
```

### 5. Настройка домена

#### Railway автоматически предоставляет:
- HTTPS домен: `your-app.railway.app`
- Можно настроить кастомный домен в настройках проекта

### 6. Мониторинг и логи

#### Railway предоставляет:
- Автоматические логи в dashboard
- Метрики производительности
- Health checks на `/health` endpoint

### 7. Преимущества Railway над Render.com

#### Railway:
- ✅ Более быстрый деплой
- ✅ Лучшая производительность
- ✅ Встроенный Redis
- ✅ Автоматические backups
- ✅ Простая настройка переменных окружения
- ✅ Лучший мониторинг

#### Render.com:
- ❌ Медленный cold start
- ❌ Ограниченный free tier
- ❌ Нет встроенного Redis
- ❌ Сложная настройка

### 8. Тестирование миграции

#### Проверочный список:
- [ ] Backend запускается без ошибок
- [ ] База данных подключена
- [ ] Redis кэширование работает
- [ ] API endpoints отвечают
- [ ] Загрузка изображений работает
- [ ] Telegram bot работает
- [ ] Health check проходит

### 9. Обновление frontend

#### Обновить API URL в frontend:
```typescript
// В frontend/src/context/AuthContext.tsx
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.railway.app'  // Новый Railway URL
  : 'http://localhost:4000';
```

### 10. Откат (если что-то пойдет не так)

#### Сохраните Render.com до полного тестирования:
1. Не удаляйте Render.com проект сразу
2. Протестируйте Railway в течение недели
3. Убедитесь, что все работает корректно
4. Только после этого удалите Render.com

## Результат

После миграции вы получите:
- Более быстрый и стабильный backend
- Встроенный Redis для кэширования
- Лучший мониторинг и логи
- Автоматические backups базы данных
- Более простую настройку переменных окружения

Время миграции: ~1-2 часа
