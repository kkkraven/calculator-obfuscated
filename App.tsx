import React, { useState, useEffect } from 'react';
import { askGemini, getLogs, sendPriceFeedback } from './services/geminiService';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  requestId?: string;
}

interface LogEntry {
  message: string;
  answer: string;
  timestamp: number;
  fromCache: boolean;
  actualPrice?: number;
  feedbackTimestamp?: number;
}

const App: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: Date.now().toString(),
      text: "Здравствуйте! Пожалуйста, опишите ваш заказ на упаковку одним сообщением. Я постараюсь извлечь все необходимые параметры, включая варианты тиражей, если они указаны (например, 500/1000 шт).",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<[string, LogEntry][]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [feedbackPrice, setFeedbackPrice] = useState<Record<string, string>>({});

  // Загрузка логов
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logsData = await getLogs();
        setLogs(logsData);
      } catch (err) {
        console.error('Failed to load logs:', err);
      }
    };
    loadLogs();
  }, []);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Добавляем сообщение пользователя в чат
    setChatMessages((prev: ChatMessage[]) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: userInput,
        sender: 'user',
        timestamp: new Date()
      }
    ]);
    setIsLoading(true);
    setError(null);

    try {
      // Запрашиваем у Gemini
      const response = await askGemini(userInput);

      // Добавляем ответ бота в чат
      setChatMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: response.answer,
          sender: 'bot',
          timestamp: new Date(),
          requestId: response.requestId
        }
      ]);

      // Обновляем логи
      const logsData = await getLogs();
      setLogs(logsData);
    } catch (err: any) {
      setError('Ошибка при получении ответа. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  const handlePriceFeedback = async (requestId: string) => {
    const price = feedbackPrice[requestId];
    if (!price || isNaN(Number(price))) {
      setError('Пожалуйста, введите корректную цену');
      return;
    }

    try {
      await sendPriceFeedback(requestId, Number(price));
      setFeedbackPrice((prev: Record<string, string>) => ({ ...prev, [requestId]: '' }));
      // Обновляем логи
      const logsData = await getLogs();
      setLogs(logsData);
    } catch (err) {
      setError('Ошибка при отправке обратной связи');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={() => setShowLogs(!showLogs)}
          style={{ padding: '8px 16px', borderRadius: 4 }}
        >
          {showLogs ? 'Скрыть логи' : 'Показать логи'}
        </button>
      </div>

      {showLogs && (
        <div style={{
          background: "#222",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          maxHeight: 400,
          overflowY: 'auto'
        }}>
          <h3 style={{ color: '#fff', marginTop: 0 }}>История запросов</h3>
          {logs.map(([id, entry]) => (
            <div key={id} style={{ marginBottom: 16, color: '#fff' }}>
              <div><strong>Запрос:</strong> {entry.message}</div>
              <div><strong>Ответ:</strong> {entry.answer}</div>
              <div><strong>Время:</strong> {new Date(entry.timestamp).toLocaleString()}</div>
              {entry.actualPrice ? (
                <div><strong>Реальная цена:</strong> {entry.actualPrice}</div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <input
                    type="number"
                    value={feedbackPrice[id] || ''}
                    onChange={e => setFeedbackPrice(prev => ({ ...prev, [id]: e.target.value }))}
                    placeholder="Введите реальную цену"
                    style={{ marginRight: 8, padding: 4 }}
                  />
                  <button
                    onClick={() => handlePriceFeedback(id)}
                    style={{ padding: '4px 8px' }}
                  >
                    Отправить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: "#222",
        borderRadius: 8,
        padding: 16,
        minHeight: 400,
        marginBottom: 16
      }}>
        {chatMessages.map(msg => (
          <div key={msg.id} style={{
            textAlign: msg.sender === 'user' ? 'right' : 'left',
            color: msg.sender === 'user' ? '#7ed6df' : '#f8c291',
            marginBottom: 8
          }}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div style={{ color: "#fff" }}>...Бот думает...</div>}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <div>
        <input
          type="text"
          value={userInput}
          disabled={isLoading}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Введите ваш ответ..."
          style={{ width: '70%', marginRight: 8, padding: 8, borderRadius: 4 }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !userInput.trim()}
          style={{ padding: '8px 16px', borderRadius: 4 }}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default App;
