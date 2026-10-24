import { http } from './http';
import type { ApiResponse, Perfil, Usuario } from '../types';

export interface NovoUsuario {
  nome: string;
  login: string;
  senha: string;
  perfil: Exclude<Perfil, 'Admin'>;
  email: string;
  telefone: string;
  endereco?: string;
  convenioStatus?: string;
  registro?: string;
}

export type EdicaoUsuario = Partial<Omit<Usuario, 'id' | 'login' | 'perfil' | 'ativo'>>;

export const adminApi = {
  usuarios: (perfil?: Perfil) =>
    http.get<ApiResponse<Usuario[]>>('/Usuarios', { params: perfil ? { perfil } : undefined }).then((r) => r.data),

  criarUsuario: (body: NovoUsuario) =>
    http.post<ApiResponse<number>>('/Usuarios', body).then((r) => r.data),

  atualizarUsuario: (id: number, body: EdicaoUsuario) =>
    http.put<ApiResponse>(`/Usuarios/${id}`, body).then((r) => r.data),

  // O corpo é um boolean puro (true/false), como no petcare-api.js
  alternarAtivo: (id: number, ativo: boolean) =>
    http
      .patch<ApiResponse>(`/Usuarios/${id}/ativo`, ativo, { headers: { 'Content-Type': 'application/json' } })
      .then((r) => r.data),
};