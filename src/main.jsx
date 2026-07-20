//import { createRoot } from "react-dom/client";
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App.jsx';
import './index.css';
import './i18n.js';
import { Provider } from 'react-redux';
import { store } from "./services/store/store"; 
ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </Provider>
);
