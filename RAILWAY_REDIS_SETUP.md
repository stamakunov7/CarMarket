# Настройка Redis на Railway

## Проблема
Redis на Railway засыпает, если к нему нет активных подключений. Это особенно актуально для бесплатного тарифа Railway.

## Решение
Код обновлен для автоматического подключения к Redis с retry логикой и heartbeat механизмом.

## Переменные окружения для CarMarket сервиса

### Рекомендуемая настройка

В Railway Dashboard для вашего **CarMarket** сервиса должны быть установлены следующие переменные:

```bash
# Основные переменные (уже настроены)
JWT_SECRET="f4dce7dc9939e59991e6086b31a47882f3f18c6bc5ebc16e2bda543314602323646bd5cf8e100beb81ca176841278b3b8b1422a4badf1caf8a1b9d914ef2ffa7"
JWT_EXPIRES_IN="7d"
PORT="4000"
NODE_ENV="production"
FRONTEND_URL="https://car-market-sage.vercel.app/"
CLOUDINARY_CLOUD_NAME="dehuz4bcb"
CLOUDINARY_API_KEY="351546468712866"
CLOUDINARY_API_SECRET="6cYfDsdEpgVPZ-NTt7LwXZu5Tz8"
TELEGRAM_BOT_TOKEN="8395616953:AAFmevG0I_I44MatoIRbvDMt7QeFbIkT54o"
TELEGRAM_CHAT_ID="630916915"
DATABASE_URL="${{Postgres.DATABASE_URL}}"
LOG_LEVEL="info"
```

### Важно: Redis URL

**Railway автоматически предоставляет переменные Redis**, когда сервисы связаны. У вас есть несколько вариантов:

#### Вариант 1: Использовать автоматический REDIS_URL (РЕКОМЕНДУЕТСЯ)
Railway автоматически создаст `REDIS_URL` когда вы свяжете Redis сервис с CarMarket сервисом.

**Как связать сервисы:**
1. В Railway Dashboard откройте ваш проект
2. Убедитесь, что Redis и CarMarket находятся в одном проекте
3. Railway автоматически предоставит `REDIS_URL` переменную

**В этом случае НЕ нужно вручную устанавливать REDIS_URL!**

#### Вариант 2: Использовать REDIS_PUBLIC_URL
Если Railway не предоставляет `REDIS_URL` автоматически, можно использовать `REDIS_PUBLIC_URL` из Redis сервиса:

```bash
REDIS_URL="${{Redis.REDIS_PUBLIC_URL}}"
```

#### Вариант 3: Использовать отдельные переменные
Если первые два варианта не работают, можно собрать URL вручную:

```bash
REDIS_URL="redis://default:lEbmpeuyCRwZuKaumWMthdoLURbCPBZA@${{Redis.REDISHOST}}:${{Redis.REDISPORT}}"
```

Или использовать отдельные переменные (код автоматически соберет URL):
```bash
REDISHOST="${{Redis.RAILWAY_PRIVATE_DOMAIN}}"
REDISPORT="6379"
REDISUSER="default"
REDISPASSWORD="lEbmpeuyCRwZuKaumWMthdoLURbCPBZA"
```

## Как код обрабатывает Redis

### 1. Автоматическое определение URL
Код автоматически ищет Redis URL в следующем порядке приоритета:
1. `REDIS_URL` - основной (Railway автоматически предоставляет)
2. `REDIS_PUBLIC_URL` - публичный URL через TCP proxy
3. Сборка из компонентов: `REDISHOST`, `REDISPORT`, `REDISUSER`, `REDISPASSWORD`

### 2. Retry логика
- До 10 попыток подключения с задержкой 5 секунд между попытками
- Помогает, если Redis спит при старте приложения

### 3. Heartbeat (ping каждые 30 секунд)
- Предотвращает засыпание Redis
- Автоматически поддерживает соединение активным

### 4. Автоматическое переподключение
- Если Redis просыпается после старта приложения, код автоматически переподключится
- При следующем запросе к кэшу произойдет попытка переподключения

### 5. Fallback на in-memory кэш
- Если Redis недоступен, приложение автоматически использует in-memory кэш
- Приложение продолжает работать даже если Redis спит

## Проверка статуса

После деплоя проверьте `/health` endpoint:
```bash
curl https://carmarket-production.up.railway.app/health
```

Ответ должен содержать секцию `redis`:
```json
{
  "status": "healthy",
  "redis": {
    "status": "connected",
    "responseTime": "5ms",
    "cacheType": "Redis"
  }
}
```

Возможные статусы:
- `connected` - Redis подключен и работает ✅
- `disconnected` - Redis настроен, но не подключен (используется fallback)
- `configured_but_not_connected` - Redis URL настроен, но соединение еще устанавливается
- `not_configured` - Redis не настроен (используется только in-memory кэш)

## Рекомендации

1. **Убедитесь, что Redis и CarMarket в одном проекте Railway**
   - Railway автоматически предоставляет переменные между связанными сервисами

2. **Не используйте хардкодный URL** 
   - Вместо `redis://default:password@containers-us-west-xxx.railway.app:6379`
   - Используйте `${{Redis.REDIS_URL}}` или автоматическую переменную

3. **Проверьте логи после деплоя**
   - Должны увидеть: `✅ Redis connected for caching`
   - Если видите `⚠️ Redis not available`, проверьте переменные окружения

4. **Heartbeat работает автоматически**
   - После успешного подключения код будет автоматически пингать Redis каждые 30 секунд
   - Это предотвратит засыпание Redis

## Устранение неполадок

### Redis все еще спит
1. Проверьте, что `REDIS_URL` установлен в переменных окружения CarMarket
2. Проверьте логи на наличие ошибок подключения
3. Убедитесь, что Redis сервис запущен в Railway Dashboard

### Запросы таймаутят
1. Код имеет таймауты (2 секунды) для операций Redis
2. Если Redis недоступен, автоматически используется in-memory кэш
3. Проверьте `/health` endpoint для диагностики

### Redis не подключается при старте
1. Это нормально - код делает до 10 попыток подключения
2. После первой успешной попытки Redis не должен засыпать благодаря heartbeat
3. Проверьте логи - должно быть сообщение об успешном подключении

