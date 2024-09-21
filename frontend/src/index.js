import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThirdwebProvider } from '@thirdweb-dev/react'; // Importar el proveedor de ThirdWeb
import reportWebVitals from './reportWebVitals';
import { authConfig } from './thirdweb-config'; // Importar la configuración de auth

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThirdwebProvider authConfig={authConfig}> {/* Wrapping the app in ThirdWebProvider */}
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
);

// Opcional para medir rendimiento de tu app
reportWebVitals();
