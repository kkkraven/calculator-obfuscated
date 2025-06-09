export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Если это API запрос, проксируем его к Worker
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = new URL(url.pathname.replace('/api/', ''), env.API_URL);
      apiUrl.search = url.search;
      
      const apiRequest = new Request(apiUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      return fetch(apiRequest);
    }
    
    // Для всех остальных запросов отдаем статику
    return env.ASSETS.fetch(request);
  }
}; 