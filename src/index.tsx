import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css'; // Предполагая, что глобальные стили для App.tsx находятся здесь

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element with ID \'root\' not found in the document.');
} 