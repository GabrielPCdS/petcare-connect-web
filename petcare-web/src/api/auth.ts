import { http } from './http';
import type {
  ApiResponse, LoginRequest, LoginResponse, CadastroRequest,
} from '../types';

export const authApi = {
  login: (body: LoginRequest) =>
    http.post<ApiResponse<LoginResponse>>('/Auth/login', body).then((r) => r.data),

  cadastro: (body: CadastroRequest) =>
    http.post<ApiResponse>('/Auth/cadastro', body).then((r) => r.data),

  recuperarSenha: (body: { login: string; email: string }) =>
    http.post<ApiResponse<{ token: string }>>('/Auth/recuperar-senha', body).then((r) => r.data),

  novaSenha: (body: { login: string; novaSenha: string; token: string }) =>
    http.post<ApiResponse>('/Auth/nova-senha', body).then((r) => r.data),
};