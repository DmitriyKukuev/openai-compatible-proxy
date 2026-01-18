# OpenAI-Compatible Proxy

Прокси-сервер для OpenAI-совместимых API с поддержкой HTTP, HTTPS и SOCKS5 прокси

## Быстрый запуск через npx (без клонирования)

Запустите прокси одной командой без необходимости клонировать репозиторий:

**Минимальный запуск:**
```bash
npx github:DmitriyKukuev/openai-compatible-proxy \
  --proxy-url "socks5://username:password@proxy-host:port" \
  --api-url "https://api.z.ai/api/coding/paas/v4"
```

**Запуск со всеми аргументами:**
```bash
npx github:DmitriyKukuev/openai-compatible-proxy \
  --proxy-url "socks5://username:password@proxy-host:port" \
  --api-url "https://api.z.ai/api/coding/paas/v4" \
  --port 8888 \
  --host 127.0.0.1
```

## Аргументы командной строки

| Аргумент | Описание | Обязательный | По умолчанию |
|----------|----------|--------------|--------------|
| `--proxy-url` | URL прокси-сервера (http, https, socks4, socks5) | Да | - |
| `--api-url` | URL целевого API | Да | - |
| `--port` | Локальный порт для прокси | Нет | `8888` |
| `--host` | Хост для привязки | Нет | `127.0.0.1` |

## Традиционная установка

Если вы предпочитаете клонировать репозиторий:

```bash
git clone https://github.com/DmitriyKukuev/openai-compatible-proxy.git
cd openai-compatible-proxy
npm ci
```

Создайте `.env` файл на основе `.env.example`:

```env
# Обязательные параметры
PROXY_URL=socks5://username:password@proxy-host:port
API_URL=https://api.z.ai/api/coding/paas/v4

# Опциональные параметры
LOCAL_PORT=8888
BIND_HOST=127.0.0.1
```

Запустите прокси:

```bash
npm start
```

## Поддерживаемые типы прокси

Поддерживаются: `http://`, `https://`, `socks4://`, `socks5://`

```env
# Примеры
PROXY_URL=http://username:password@proxy-host:port
PROXY_URL=socks5://username:password@proxy-host:port
PROXY_URL=http://proxy-host:port  # без аутентификации
```

## Использование

После запуска прокси будет доступен по адресу `http://127.0.0.1:8888`

В настройках вашего приложения укажите URL прокси-сервера вместо прямого URL API:

```
http://127.0.0.1:8888
```

Все запросы к этому URL будут автоматически перенаправлены через прокси к целевому API.

## Требования

- Node.js 14 или выше
- npm 6 или выше (для npx)
