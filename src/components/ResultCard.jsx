import React from "react"

export default function ResultCard({ result }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg">
      <h2 className="font-bold text-xl mb-2">Результат расчета</h2>
      <div className="text-lg mb-2">
        Итоговая стоимость: <b>{result.total.toLocaleString()} ₽</b>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>В стоимость включено:</p>
        <ul className="list-disc pl-4 mt-2">
          {result.items?.map((item, i) => (
            <li key={i} className="mb-1">
              {item.name}: {item.price.toLocaleString()} ₽ × {item.qty} шт
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        * Расчет является предварительным. Для точной стоимости свяжитесь с менеджером.
      </div>
    </div>
  )
} 