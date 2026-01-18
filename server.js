require('dotenv').config();
const http = require('http');
const https = require('https');
const { ProxyAgent } = require('proxy-agent');
const { URL } = require('url');
const { program } = require('commander');

// ========== CLI АРГУМЕНТЫ ==========

program
  .name('openai-compatible-proxy')
  .description('Universal OpenAI-compatible API proxy through SOCKS5')
  .version('1.0.0')
  .option('--proxy-url <url>', 'SOCKS5 proxy URL (e.g., socks5://username:password@proxy-host:port)')
  .option('--api-url <url>', 'Target API URL (e.g., https://api.z.ai/api/coding/paas/v4)')
  .option('--port <port>', 'Local port to bind to', '8888')
  .option('--host <host>', 'Host to bind to', '127.0.0.1')
  .parse();

const options = program.opts();

// CLI аргументы имеют приоритет над .env переменными
if (options.proxyUrl) process.env.PROXY_URL = options.proxyUrl;
if (options.apiUrl) process.env.API_URL = options.apiUrl;
if (options.port) process.env.LOCAL_PORT = options.port;
if (options.host) process.env.BIND_HOST = options.host;

// ========== ЗАГРУЗКА И ВАЛИДАЦИЯ КОНФИГУРАЦИИ ==========

// Проверка обязательных переменных
if (!process.env.PROXY_URL) {
    console.error('❌ ОШИБКА: Переменная PROXY_URL не задана');
    console.error('   Укажите её через --proxy-url аргумент или в .env файле');
    process.exit(1);
}

// Валидация PROXY_URL
let proxyUrl;
try {
    proxyUrl = new URL(process.env.PROXY_URL);
} catch (err) {
    console.error('❌ ОШИБКА: Невалидный PROXY_URL:', process.env.PROXY_URL);
    console.error('   Должен быть валидным URL');
    process.exit(1);
}

// Проверка поддерживаемых протоколов прокси
const supportedProxyProtocols = ['http:', 'https:', 'socks:', 'socks4:', 'socks5:'];
if (!supportedProxyProtocols.includes(proxyUrl.protocol)) {
    console.error('❌ ОШИБКА: Неподдерживаемый протокол прокси:', proxyUrl.protocol);
    console.error('   Поддерживаемые протоколы: http://, https://, socks://, socks4://, socks5://');
    process.exit(1);
}

if (!process.env.API_URL) {
    console.error('❌ ОШИБКА: Переменная API_URL не задана');
    console.error('   Укажите её через --api-url аргумент или в .env файле');
    process.exit(1);
}

// Парсинг и валидация API_URL
let targetUrl;
try {
    targetUrl = new URL(process.env.API_URL);
} catch (err) {
    console.error('❌ ОШИБКА: Невалидный API_URL:', process.env.API_URL);
    console.error('   Должен быть валидным URL (например: https://api.z.ai)');
    process.exit(1);
}

// Проверка протокола
if (targetUrl.protocol !== 'https:') {
    console.error('❌ ОШИБКА: API_URL должен использовать протокол HTTPS');
    console.error('   Текущий протокол:', targetUrl.protocol);
    process.exit(1);
}

// Конфигурация
const PROXY_URL = process.env.PROXY_URL;
const TARGET_HOSTNAME = targetUrl.hostname;
const TARGET_BASE_PATH = targetUrl.pathname !== '/' ? targetUrl.pathname : '';
const TARGET_PORT = targetUrl.port || 443;
const LOCAL_PORT = process.env.LOCAL_PORT || 8888;
const BIND_HOST = process.env.BIND_HOST || '127.0.0.1';

// ========== СОЗДАНИЕ PROXY АГЕНТА ==========
const agent = new ProxyAgent({
    getProxyForUrl: () => PROXY_URL
});

// ========== HTTP СЕРВЕР ==========
const server = http.createServer((req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);

    const options = {
        hostname: TARGET_HOSTNAME,
        port: TARGET_PORT,
        path: TARGET_BASE_PATH + req.url,
        method: req.method,
        headers: {
            ...req.headers,
            host: TARGET_HOSTNAME
        },
        agent: agent
    };

    const proxyReq = https.request(options, (proxyRes) => {
        console.log(`[${timestamp}] Response: ${proxyRes.statusCode}`);
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    proxyReq.on('error', (err) => {
        console.error(`[${timestamp}] ❌ Proxy error:`, err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Proxy error',
            message: err.message
        }));
    });
});

// ========== ЗАПУСК СЕРВЕРА ==========
server.listen(LOCAL_PORT, BIND_HOST, () => {
    console.log('='.repeat(60));
    console.log(`OpenAI-compatible proxy server is running`);
    console.log(`Local address: http://${BIND_HOST}:${LOCAL_PORT}`);
    console.log(`Proxy type: ${proxyUrl.protocol.replace(':', '')}`);
    console.log(`Target API: ${process.env.API_URL}`);
    console.log('='.repeat(60));
});
