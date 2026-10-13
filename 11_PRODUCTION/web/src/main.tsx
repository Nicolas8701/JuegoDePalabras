import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/app.css';
import './styles/ux-0.2.4.css';
import './styles/illustrated-0.2.6.css';
import './styles/reference-crops-0.2.6.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
