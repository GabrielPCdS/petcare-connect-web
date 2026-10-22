import { TOKEN_KEY, USER_KEY } from './http';
import type { LoginResponse } from '../types';

export function salvarSessao(dados: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, dados.token);
  localStorage.setItem(USER_KEY, JSON.stringify(dados));
}

export function lerSessao(): LoginResponse | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as LoginResponse) : null;
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}