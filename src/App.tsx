import { useState, useEffect, useRef } from 'react';
import { sendMessage, loadLogs } from './services/geminiService';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<Array<{ request: string, response: string, actualPrice?: string }>>([]);
  const [showLogs, setShowLogs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLogs().then(setLogs);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      loadLogs().then(setLogs);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Чат-Калькулятор Упаковки</h1>
        <p>Опишите ваш заказ, и я рассчитаю примерную стоимость.</p>
      </div>

      <button 
        className="toggle-logs-button"
        onClick={() => setShowLogs(!showLogs)}
      >
        {showLogs ? '✕' : '⏳ История запросов'}
      </button>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="loading">
              Рассчитываю стоимость...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите ваш ответ..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Отправить
          </button>
        </form>
      </div>

      <div className={`logs-section ${showLogs ? 'visible' : ''}`}>
        <div className="logs-container">
          <h2>История запросов</h2>
          <div className="logs">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <p><strong>Запрос:</strong> {log.request}</p>
                <p><strong>Ответ:</strong> {log.response}</p>
                {log.actualPrice && (
                  <p><strong>Фактическая цена:</strong> {log.actualPrice}</p>
                )}
                <div className="feedback-form">
                  <input
                    type="text"
                    placeholder="Введите фактическую цену..."
                    onChange={(e) => {
                      const newLogs = [...logs];
                      newLogs[index] = { ...log, actualPrice: e.target.value };
                      setLogs(newLogs);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        © 2025 Fa.tura AI. Все расчеты являются предварительными.
      </footer>
    </div>
  );
}

export default App; 