import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialiser Sentry tidlig i applikasjonens livssyklus
import { initializeSentry } from './config/sentry';
import { reportWebVitals } from './utils/performance';

initializeSentry();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Start Web Vitals tracking for performance monitoring
reportWebVitals(); 

// Registrer service worker for PWA (kun i produksjon)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service worker registrert:', reg);
      })
      .catch(err => {
        console.error('Service worker-feil:', err);
      });
  });
} 