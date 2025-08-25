import React from 'react';
import ReactDOM from 'react-dom/client';
import Map from './Map';
import './index.css';

console.log("main.jsx loaded"); // Check in browser console

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Map />
  </React.StrictMode>
);