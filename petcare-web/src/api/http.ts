import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'petcare_token';
export const USER_KEY = 'petcare_user';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Injeta o token JWT em toda requisição
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expirado ou inválido: limpa a sessão e volta pro login
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const naoEhLogin = !error.config?.url?.includes('/Auth/login');
    if (error.response?.status === 401 && naoEhLogin) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/** Extrai uma mensagem amigável de qualquer erro do Axios */
export function getErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Servidor offline.';
    return error.response.data?.mensagem ?? 'Erro ao processar a requisição.';
  }
  return 'Erro inesperado.';
}