import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { CompareProvider } from './contexts/CompareContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LanguageProvider>
    <CompareProvider>
      <App />
    </CompareProvider>
    </LanguageProvider>
  </React.StrictMode>
);
