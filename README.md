# OpenAI-Compatible Proxy

Прокси-сервер для OpenAI-совместимых API с поддержкой HTTP, HTTPS и SOCKS5 прокси

## Установка

```bash
npm ci
```

## Настройка

Создайте `.env` файл:

```env
# Обязательные параметры
PROXY_URL=socks5://username:password@proxy-host:port
API_URL=https://api.z.ai/api/coding/paas/v4

# Опциональные параметры
LOCAL_PORT=8888
BIND_HOST=127.0.0.1
```

### Поддерживаемые типы прокси

Поддерживаются: `http://`, `https://`, `socks4://`, `socks5://`

```env
# Примеры
PROXY_URL=http://username:password@proxy-host:port
PROXY_URL=socks5://username:password@proxy-host:port
PROXY_URL=http://proxy-host:port  # без аутентификации
```

## Запуск

```bash
npm start
```

Прокси будет доступен по адресу `http://127.0.0.1:8888`

## Использование

В настройках вашего приложения укажите URL прокси-сервера вместо прямого URL API:

```
http://127.0.0.1:8888
```

Все запросы к этому URL будут автоматически перенаправлены через прокси к целевому API.
