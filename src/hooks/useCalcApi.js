import { sendMessage } from '../services/geminiService';

export default function useCalcApi() {
  return async function(form) {
    try {
      // Формируем запрос в формате, который ожидает наш сервис
      const request = `Нужны коробки самосборные ${form.width}x${form.height}x${form.depth}мм, ${form.material}, ${form.qty} штук, печать ${form.printing}`;
      
      // Отправляем запрос через существующий сервис
      const response = await sendMessage(request);
      
      // Парсим ответ и форматируем его в нужный формат
      // Предполагаем, что ответ содержит информацию о стоимости
      const result = {
        total: parseFloat(response.match(/\d+/)[0]), // Извлекаем число из ответа
        items: [
          {
            name: 'Коробки',
            price: parseFloat(response.match(/\d+/)[0]),
            qty: form.qty
          }
        ]
      };
      
      return result;
    } catch (error) {
      console.error('Error in useCalcApi:', error);
      throw new Error('Failed to calculate cost');
    }
  };
} 