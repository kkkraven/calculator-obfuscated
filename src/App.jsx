import React, { useState } from "react"
import CalculatorForm from "./components/CalculatorForm"
import ResultCard from "./components/ResultCard"

function App() {
  const [result, setResult] = useState(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-indigo-900">
      <div className="w-full max-w-lg bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-[#6EE7B7]">
          Калькулятор стоимости упаковки
        </h1>
        <CalculatorForm onResult={setResult} />
        {result && (
          <div className="mt-6">
            <ResultCard result={result} />
          </div>
        )}
      </div>
      <footer className="mt-6 text-xs text-gray-400">
        © {new Date().getFullYear()} AI Packaging Calculator
      </footer>
    </div>
  )
}

export default App 