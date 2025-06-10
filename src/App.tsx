import { useState, useEffect, useRef } from 'react';
import { sendMessage } from './services/geminiService';
import './index.css'; // Импортируем базовые стили Tailwind
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

// Удаляем импорт иконки, так как теперь она будет встроена как SVG
// import calculatorIcon from './assets/calculator-icon.png'; 

// Удаляем аватаров, так как в новом дизайне их нет или они не показаны
// import botAvatar from './assets/bot-avatar.png'; 
// import userAvatar from './assets/user-avatar.png';

function App() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-6 font-sans antialiased text-white">
      {/* Заголовок приложения */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center mb-2">
          {/* Заменяем img на inline SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mr-3 text-[#6EE7B7]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5M9 12.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5M9 12.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5M9 12.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5M9 12.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5m-3.935 6.525A2.25 2.25 0 0 1 12 12.75a2.25 2.25 0 0 1 2.25-2.25h.375c.621 0 1.125.504 1.125 1.125V15a2.25 2.25 0 0 1-2.25 2.25H12a2.25 2.25 0 0 1-2.25-2.25V6.75m-.429 10.66c.21.058.423.1.636.1H12.75A2.25 2.25 0 0 0 15 15.75V6.75a2.25 2.25 0 0 0-2.25-2.25H9.75A2.25 2.25 0 0 0 7.5 6.75V15c0 1.036.784 1.875 1.815 1.905m-2.791-.013c-.457-.117-.914-.239-1.365-.363L4.352 15M3 15.75c0 1.35.617 2.559 1.59 3.39L8.25 21l-1.423-1.423a2.25 2.25 0 0 0-2.052-3.551z" />
          </svg>
          <h1 className="text-4xl font-bold text-[#6EE7B7]">Чат-Калькулятор <span className="text-[#6EE7B7]">Упаковки</span></h1>
        </div>
        <p className="text-gray-400 text-lg text-center">Опишите ваш заказ, и я рассчитаю примерную стоимость</p>
      </header>

      {/* Основной контейнер чата/приветствия */}
      <div className="flex-1 flex flex-col bg-[#2A313C] rounded-2xl shadow-2xl p-6 mb-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
            {/* Заменяем img на inline SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-6 w-28 h-28 opacity-40 text-[#6EE7B7]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5M9 12.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5M9 12.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5M9 12.75V15m6-6v8.25m.5 1.5H9.75a1.5 1.5 0 0 1-1.5-1.5V15m12-2.25V4.5m-3.935 6.525A2.25 2.25 0 0 1 12 12.75a2.25 2.25 0 0 1 2.25-2.25h.375c.621 0 1.125.504 1.125 1.125V15a2.25 2.25 0 0 1-2.25 2.25H12a2.25 2.25 0 0 1-2.25-2.25V6.75m-.429 10.66c.21.058.423.1.636.1H12.75A2.25 2.25 0 0 0 15 15.75V6.75a2.25 2.25 0 0 0-2.25-2.25H9.75A2.25 2.25 0 0 0 7.5 6.75V15c0 1.036.784 1.875 1.815 1.905m-2.791-.013c-.457-.117-.914-.239-1.365-.363L4.352 15M3 15.75c0 1.35.617 2.559 1.59 3.39L8.25 21l-1.423-1.423a2.25 2.25 0 0 0-2.052-3.551z" />
            </svg>
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
        <form onSubmit={handleSubmit} className="flex items-center mt-auto bg-[#3B4451] rounded-full shadow-inner p-1.5 focus-within:ring-2 focus-within:ring-[#6EE7B7]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Опишите ваш заказ упаковки..."
            disabled={isLoading}
            className="flex-1 p-2 rounded-full border-none focus:outline-none text-white bg-transparent placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="ml-2 p-2 bg-[#3F72AF] text-white rounded-full hover:bg-[#4A85C1] focus:outline-none focus:ring-2 focus:ring-[#6EE7B7] focus:ring-offset-2 focus:ring-offset-[#3B4451] transition-colors duration-200 flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
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