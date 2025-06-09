import { useState, useEffect } from 'react';
import { askGemini, getLogs, sendFeedback } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import './App.css';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const logsData = await getLogs();
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askGemini(input);
      const assistantMessage: Message = {
        text: response,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      await loadLogs();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        text: 'Произошла ошибка при обработке запроса.',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (requestId: string, actualPrice: number) => {
    try {
      await sendFeedback(requestId, actualPrice);
      await loadLogs();
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  return (
    <div className="app">
      <h1>Hello World!</h1>
      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="loading">...</div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите ваш вопрос..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Отправить
          </button>
        </form>
      </div>
      <div className="logs-container">
        <h2>История запросов</h2>
        <div className="logs">
          {logs.map((log) => (
            <div key={log.requestId} className="log-entry">
              <p><strong>Запрос:</strong> {log.query}</p>
              <p><strong>Ответ:</strong> {log.response}</p>
              <p><strong>Предполагаемая цена:</strong> {log.price || 'Не указана'}</p>
              {!log.feedback && (
                <div className="feedback-form">
                  <input
                    type="number"
                    placeholder="Фактическая цена"
                    onChange={(e) => {
                      const price = parseFloat(e.target.value);
                      if (!isNaN(price)) {
                        handleFeedback(log.requestId, price);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App; 