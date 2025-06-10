import { useState, useEffect, useRef } from 'react';
import { sendMessage, loadLogs } from './services/geminiService';
import './index.css'; // Импортируем базовые стили Tailwind
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

// Импортируем иконку (замените на ваш путь, если нужно)
import calculatorIcon from './assets/calculator-icon.png'; 

// Удаляем аватаров, так как в новом дизайне их нет или они не показаны
// import botAvatar from './assets/bot-avatar.png'; 
// import userAvatar from './assets/user-avatar.png';

function App() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<Array<{ request: string, response: string, actualPrice?: string }>>([]);
  const [showLogs, setShowLogs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // В реальном приложении здесь может быть загрузка истории чата
    // setLogs([]); // Уберите или закомментируйте, если хотите сохранять историю
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
      // loadLogs().then(setLogs); // В реальном приложении обновляйте логи
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

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 text-white">
      {/* Заголовок приложения */}
      <div className="text-center mb-8">
        <img src={calculatorIcon} alt="Calculator Icon" className="mx-auto mb-4 w-16 h-16" />
        <h1 className="text-5xl font-bold text-[#6EE7B7] mb-2">Чат-Калькулятор Упаковки</h1>
        <p className="text-xl text-gray-300">Опишите ваш заказ, и я рассчитаю примерную стоимость</p>
      </div>

      {/* Основной контейнер чата/приветствия */}
      <div className="flex-1 flex flex-col bg-[#2A313C] rounded-xl shadow-2xl p-6 mb-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <img src={calculatorIcon} alt="Calculator Icon" className="mb-6 w-24 h-24 opacity-60" />
            <p className="text-2xl font-semibold mb-4">Начните описание вашего заказа упаковки</p>
            <p className="text-lg max-w-md">Например: &quot;Нужны коробки самосборные 200x150x100мм, мелованная бумага 350г/м², 1000 штук, печать 4+0&quot;</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message, index) => (
              <motion.div 
                key={index} 
                className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Аватары не используются в новом дизайне, но оставим логику для роли */}
                <div className={`p-3 rounded-xl shadow-md ${message.role === 'user' ? 'bg-[#4A5568] text-white' : 'bg-[#3B4451] text-gray-200'} max-w-[80%] break-words`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="ml-2 text-gray-400">Рассчитываю стоимость...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Форма ввода сообщения */}
        <form onSubmit={handleSubmit} className="flex items-center mt-auto p-4 bg-[#2A313C] rounded-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Опишите ваш заказ упаковки..."
            disabled={isLoading}
            className="flex-1 p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#6EE7B7] text-white bg-[#3B4451] shadow-inner transition-all duration-200 placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="ml-3 px-4 py-3 bg-[#3F72AF] text-white rounded-lg hover:bg-[#4A85C1] focus:outline-none focus:ring-2 focus:ring-[#6EE7B7] focus:ring-offset-2 focus:ring-offset-[#2A313C] transition-colors duration-200 flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>

      {/* Футер */}
      <footer className="text-center mt-8 text-gray-500 text-sm">
        &copy; 2025 AI Packaging Estimator. Все расчеты являются предварительными.
      </footer>

      {/* Панель истории запросов (скрыта по умолчанию, так как ее нет на референсе) */}
      {/* <div className={`fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-in-out ${showLogs ? 'translate-x-0' : 'translate-x-full'} p-6 overflow-y-auto z-50 border-l border-gray-200`}>
        <button onClick={() => setShowLogs(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">История запросов</h2>
        <button onClick={handleClearLogs} className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 mb-6 shadow-md">Очистить историю</button>
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 text-sm break-words">
              <p className="font-semibold text-gray-700 mb-1">Запрос:</p>
              <p className="text-gray-800 mb-3">{log.request}</p>
              <p className="font-semibold text-gray-700 mb-1">Ответ:</p>
              <p className="text-gray-800 mb-3">{log.response}</p>
              {log.actualPrice && (
                <p className="font-semibold text-gray-700">Фактическая цена: <span className="font-normal text-gray-800">{log.actualPrice}</span></p>
              )}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default App; 