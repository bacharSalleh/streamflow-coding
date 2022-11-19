import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

(window as any).global = window;
(window as any).global.Buffer = require('buffer').Buffer;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


