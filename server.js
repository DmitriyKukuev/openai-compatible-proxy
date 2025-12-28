require('dotenv').config();
const http = require('http');
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { URL } = require('url');

// ========== ЗАГРУЗКА И ВАЛИДАЦИЯ КОНФИГУРАЦИИ ==========

// Проверка обязательных переменных
if (!process.env.PROXY_URL) {
    console.error('❌ ОШИБКА: Переменная PROXY_URL не задана в .env файле');
    console.error('   PROXY_URL является обязательной для работы прокси-сервера');
    process.exit(1);
}

if (!process.env.API_URL) {
    console.error('❌ ОШИБКА: Переменная API_URL не задана в .env файле');
    console.error('   API_URL является обязательной для работы прокси-сервера');
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

// ========== СОЗДАНИЕ SOCKS5 АГЕНТА ==========
const agent = new SocksProxyAgent(PROXY_URL);

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
    console.log(`✅ OpenAI-compatible proxy server is running`);
    console.log(`🌐 Local address: http://${BIND_HOST}:${LOCAL_PORT}`);
    console.log(`🔒 SOCKS5 proxy: ${PROXY_URL.replace(/:[^:@]+@/, ':***@')}`);
    console.log(`🎯 Target API: ${process.env.API_URL}`);
    console.log('='.repeat(60));
});
