export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/ask' && request.method === 'POST') {
      // Устанавливаем CORS заголовки для POST запросов
      const headers = new Headers({
        'Access-Control-Allow-Origin': '*', // Разрешаем все домены
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      });

      try {
        const data = await request.json();
        const responseData = { message: `Hello from new Worker! You sent: ${data.query}` };
        return new Response(JSON.stringify(responseData), { status: 200, headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
      }
    }

    // Обработка OPTIONS запросов для CORS preflight
    if (request.method === 'OPTIONS') {
      const headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
      });
      return new Response(null, { status: 204, headers });
    }

    // Ответ для любых других запросов
    return new Response("Not Found", { status: 404 });
  },
}; 