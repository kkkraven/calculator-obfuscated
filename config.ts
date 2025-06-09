// Базовый URL API
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com' 
  : 'http://localhost:8787';

// Настройки таймаутов
export const REQUEST_TIMEOUT = 30000; // 30 секунд
export const API_CHECK_TIMEOUT = 5000; // 5 секунд

// Настройки кэширования
export const CACHE_TTL = 3600; // 1 час

// Настройки rate limiting
export const RATE_LIMIT = 10; // запросов
export const RATE_WINDOW = 60; // секунд

// Альтернативные эндпоинты API
export const API_ENDPOINTS = [
  'https://generativelanguage.googleapis.com',
  'https://asia-southeast1-generativelanguage.googleapis.com',
  'https://europe-west4-generativelanguage.googleapis.com'
]; 