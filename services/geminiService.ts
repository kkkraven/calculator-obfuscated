// src/services/geminiService.ts

import { API_URL } from '../config';

interface GeminiResponse {
  answer: string;
  requestId: string;
  error?: string;
}

interface LogEntry {
  message: string;
  answer: string;
  timestamp: number;
  fromCache: boolean;
}

interface FeedbackEntry extends LogEntry {
  actualPrice: number;
  feedbackTimestamp: number;
}

export async function sendMessage(message: string): Promise<GeminiResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/api/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при отправке запроса');
    }

    const data: GeminiResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Превышено время ожидания ответа от сервера');
      }
      throw error;
    }
    throw new Error('Неизвестная ошибка при отправке запроса');
  }
}

export async function getLogs(): Promise<[string, LogEntry][]> {
  try {
    const response = await fetch(`${API_URL}/api/logs`);
    if (!response.ok) {
      throw new Error('Ошибка при получении логов');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении логов:', error);
    return [];
  }
}

export async function sendFeedback(requestId: string, actualPrice: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId, actualPrice }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при отправке обратной связи');
    }

    return true;
  } catch (error) {
    console.error('Ошибка при отправке обратной связи:', error);
    return false;
  }
}
