import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ProductionCareplanAgent from './components/ProductionCareplanAgent';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ProductionCareplanAgent />
  </React.StrictMode>
);