// Константы
const CACHE_TTL = 3600; // 1 час
const RATE_LIMIT = 10; // запросов
const RATE_WINDOW = 60; // секунд
const REQUEST_TIMEOUT = 30000; // 30 секунд

// Альтернативные эндпоинты
const API_ENDPOINTS = [
  'https://generativelanguage.googleapis.com',
  'https://asia-southeast1-generativelanguage.googleapis.com',
  'https://europe-west4-generativelanguage.googleapis.com'
];

// Хранилище данных
const cache = new Map();
const rateLimits = new Map();
const logs = new Map();
const priceFeedback = new Map();

// Генерация уникального ID для запроса
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Проверка доступности API
async function checkApiAvailability(apiKey) {
  for (const endpoint of API_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${endpoint}/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) {
        return endpoint;
      }
    } catch (err) {
      console.error(`Endpoint ${endpoint} is not available:`, err);
    }
  }
  return null;
}

// Очистка старых данных
function cleanupOldData() {
  const now = Date.now();
  
  // Очистка старых rate limits
  for (const [ip, times] of rateLimits.entries()) {
    const validTimes = times.filter(time => time > now - (RATE_WINDOW * 1000));
    if (validTimes.length === 0) {
      rateLimits.delete(ip);
    } else {
      rateLimits.set(ip, validTimes);
    }
  }

  // Очистка старых кэшей
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > (CACHE_TTL * 1000)) {
      cache.delete(key);
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    // Периодическая очистка старых данных
    cleanupOldData();

    // CORS для preflight запросов
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Обработка запроса логов
    if (path === "/api/logs" && request.method === "GET") {
      return new Response(JSON.stringify(Array.from(logs.entries())), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Обработка обратной связи по ценам
    if (path === "/api/feedback" && request.method === "POST") {
      const { requestId, actualPrice } = await request.json();
      if (!requestId || !actualPrice || isNaN(Number(actualPrice))) {
        return new Response(JSON.stringify({ error: "Invalid requestId or actualPrice" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }

      const logEntry = logs.get(requestId);
      if (!logEntry) {
        return new Response(JSON.stringify({ error: "Request not found" }), { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Сохраняем обратную связь
      priceFeedback.set(requestId, {
        ...logEntry,
        actualPrice: Number(actualPrice),
        feedbackTimestamp: Date.now()
      });

      // Обновляем базу знаний
      const knowledgeUpdate = `
Новая информация о ценах:
Заказ: ${logEntry.message}
Предсказанная цена: ${logEntry.answer}
Реальная цена: ${actualPrice}
`;

      // Добавляем новую информацию в кэш для похожих запросов
      cache.set(logEntry.message, {
        answer: `Учитывая новую информацию о ценах, стоимость заказа должна быть около ${actualPrice}`,
        timestamp: Date.now()
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Основной обработчик запросов к Gemini
    if (path === "/api/gemini" && request.method === "POST") {
      console.log('Received request:', {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries())
      });

      // Rate limiting
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const now = Date.now();
      const windowStart = now - (RATE_WINDOW * 1000);
      
      if (!rateLimits.has(clientIP)) {
        rateLimits.set(clientIP, []);
      }
      
      const requests = rateLimits.get(clientIP).filter(time => time > windowStart);
      requests.push(now);
      rateLimits.set(clientIP, requests);
      
      if (requests.length > RATE_LIMIT) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { 
          status: 429,
          headers: { "Content-Type": "application/json" }
        });
      }

      let message;
      try {
        const body = await request.json();
        message = body.message;
        if (!message || typeof message !== 'string') {
          throw new Error('Invalid message format');
        }
        console.log('Received message:', message);
      } catch (err) {
        console.error('Failed to parse request body:', err);
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Генерируем ID для запроса
      const requestId = generateRequestId();

      // Проверка кэша
      const cacheKey = message;
      const cachedResponse = cache.get(cacheKey);
      if (cachedResponse && (now - cachedResponse.timestamp) < (CACHE_TTL * 1000)) {
        console.log('Serving from cache');
        // Сохраняем лог даже для кэшированных ответов
        logs.set(requestId, {
          message,
          answer: cachedResponse.answer,
          timestamp: now,
          fromCache: true
        });
        return new Response(JSON.stringify({ 
          answer: cachedResponse.answer,
          requestId
        }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "X-Cache": "HIT",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

    const GOOGLE_API_KEY = "AIzaSyA4_lNUnQop6JnFg4fa2P5r07oRQigQELg";
      
      // Проверяем доступность API
      const availableEndpoint = await checkApiAvailability(GOOGLE_API_KEY);
      if (!availableEndpoint) {
        return new Response(JSON.stringify({ 
          error: "API недоступен в вашем регионе. Пожалуйста, используйте VPN или прокси-сервер." 
        }), { 
          status: 503,
          headers: { "Content-Type": "application/json" }
        });
      }

      const url = `${availableEndpoint}/v1/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
    const payload = { contents: [{ parts: [{ text: message }] }] };
      
      console.log('Sending request to Gemini:', {
        url,
        payload
      });

      let geminiResponse, geminiResult;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      geminiResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
      });

        clearTimeout(timeoutId);
      geminiResult = await geminiResponse.json();
        console.log('Gemini response status:', geminiResponse.status);
        console.log('Gemini response:', geminiResult);
    } catch (err) {
        console.error('Failed to connect to Gemini API:', err);
        if (err.name === 'AbortError') {
          return new Response(JSON.stringify({ error: "Request timeout" }), { 
            status: 504,
            headers: { "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ 
          error: "Не удалось подключиться к API. Возможно, он недоступен в вашем регионе." 
        }), { 
          status: 502,
          headers: { "Content-Type": "application/json" }
        });
    }

    const answer =
      geminiResult.candidates?.[0]?.content?.parts?.[0]?.text ||
      geminiResult.candidates?.[0]?.content?.text ||
      geminiResult.error?.message ||
      "Нет ответа от модели";

      // Сохраняем в кэш
      cache.set(cacheKey, {
        answer,
        timestamp: now
      });

      // Сохраняем лог
      logs.set(requestId, {
        message,
        answer,
        timestamp: now,
        fromCache: false
      });

      console.log('Final answer:', answer);

      return new Response(JSON.stringify({ 
        answer,
        requestId
      }), {
      status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "X-Cache": "MISS"
        }
      });
    }

    return new Response("Not found", { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
};
