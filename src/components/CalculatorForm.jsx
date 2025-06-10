import React, { useState } from "react"
import useCalcApi from "../hooks/useCalcApi"

const initialState = {
  width: "",
  height: "",
  depth: "",
  material: "мелованная бумага 350г/м²",
  printing: "4+0",
  qty: 1
}

const materials = [
  "мелованная бумага 350г/м²",
  "мелованная бумага 300г/м²",
  "мелованная бумага 250г/м²",
  "картон 300г/м²",
  "картон 400г/м²"
]

const printingOptions = [
  "4+0",
  "4+1",
  "1+0",
  "1+1"
]

export default function CalculatorForm({ onResult }) {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const calcApi = useCalcApi()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await calcApi(form)
      onResult(res)
    } catch (err) {
      setError("Ошибка запроса. Попробуйте еще раз.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <input
          name="width"
          type="number"
          placeholder="Ширина (мм)"
          value={form.width}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
        <input
          name="height"
          type="number"
          placeholder="Высота (мм)"
          value={form.height}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
        <input
          name="depth"
          type="number"
          placeholder="Глубина (мм)"
          value={form.depth}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
      </div>
      
      <select
        name="material"
        value={form.material}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        required
      >
        {materials.map((material) => (
          <option key={material} value={material}>
            {material}
          </option>
        ))}
      </select>

      <select
        name="printing"
        value={form.printing}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        required
      >
        {printingOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <input
        name="qty"
        type="number"
        min="1"
        placeholder="Количество (шт)"
        value={form.qty}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        required
      />

      {error && <div className="text-red-600">{error}</div>}
      
      <button 
        type="submit" 
        className="w-full mt-2 bg-[#6EE7B7] text-white font-semibold py-2 px-4 rounded-xl hover:bg-[#4FD1A5] transition-colors duration-200 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Рассчитываем..." : "Рассчитать стоимость"}
      </button>
    </form>
  )
} 