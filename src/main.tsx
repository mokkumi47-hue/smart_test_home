import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// AI Studio 클라우드 컨테이너 포트 환경 특성상 발생하는 무해한 Vite HMR 웹소켓 연결 실패 경고를 숨깁니다.
if (typeof window !== 'undefined') {
  const ignorePatterns = ['WebSocket', 'vite', 'hmr'];
  
  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = event.reason?.message || '';
    const errorStack = event.reason?.stack || '';
    if (ignorePatterns.some(pattern => errorMsg.includes(pattern) || errorStack.includes(pattern))) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    if (ignorePatterns.some(pattern => errorMsg.includes(pattern))) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

