export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  // Если запрос идет на /api/*, перенаправляем его на наш Worker
  if (url.pathname.startsWith('/api')) {
    const workerUrl = new URL(request.url);
    workerUrl.hostname = 'calculator-api.46261vor.workers.dev'; // Ваш домен Worker'а
    workerUrl.protocol = 'https:';

    const response = await fetch(workerUrl.toString(), request);
    return response;
  }

  // Для всех остальных запросов продолжаем цепочку Pages Functions или отдаем статику
  return next();
}; 