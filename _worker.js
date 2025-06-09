import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = new Hono();

// Настройка CORS
app.use('/*', cors());

// Инициализация Gemini API
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Обработка запросов к Gemini
app.post('/api/ask', async (c) => {
  try {
    const { query } = await c.req.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();
    
    // Сохраняем лог в KV
    const requestId = crypto.randomUUID();
    await LOGS.put(requestId, JSON.stringify({
      requestId,
      timestamp: new Date().toISOString(),
      query,
      response: text,
      price: 0.00025 // Примерная стоимость запроса
    }));
    
    return c.json({ response: text, requestId });
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'Failed to process request' }, 500);
  }
});

// Получение логов
app.get('/api/logs', async (c) => {
  try {
    const logs = [];
    const list = await LOGS.list();
    
    for (const key of list.keys) {
      const value = await LOGS.get(key.name);
      if (value) {
        logs.push(JSON.parse(value));
      }
    }
    
    return c.json({ logs });
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'Failed to fetch logs' }, 500);
  }
});

// Обработка обратной связи
app.post('/api/feedback', async (c) => {
  try {
    const { requestId, actualPrice } = await c.req.json();
    const log = await LOGS.get(requestId);
    
    if (log) {
      const logData = JSON.parse(log);
      logData.feedback = actualPrice;
      await LOGS.put(requestId, JSON.stringify(logData));
      return c.json({ success: true });
    }
    
    return c.json({ error: 'Log not found' }, 404);
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'Failed to process feedback' }, 500);
  }
});

export default app; 