import React from 'react';
import ReactDOM from 'react-dom/client';
import InitWasm from './components/InitWasm';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <InitWasm />
  </React.StrictMode>,
);
