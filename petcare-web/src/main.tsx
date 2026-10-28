import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';

async function iniciar() {
  // O mock só é carregado (import dinâmico) quando a variável está ligada
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { ativarMock } = await import('./mock');
    ativarMock();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void iniciar();