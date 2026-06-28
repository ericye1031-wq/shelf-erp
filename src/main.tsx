import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 开发环境的 API mock 已在 vite.config.ts > configureServer 中处理
// 无需在浏览器端加载任何 mock 代码

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
