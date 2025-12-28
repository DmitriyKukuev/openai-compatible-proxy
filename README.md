# OpenAI-Compatible Proxy

Прокси-сервер для OpenAI-совместимых API с поддержкой SOCKS5

## Установка

```bash
npm ci
```

## Настройка

Создайте `.env` файл:

```env
PROXY_URL=socks5://username:password@proxy-host:port
API_URL=https://api.z.ai/api/coding/paas/v4
LOCAL_PORT=8888
BIND_HOST=127.0.0.1
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

Все запросы к этому URL будут автоматически перенаправлены через SOCKS5 прокси к целевому API.
