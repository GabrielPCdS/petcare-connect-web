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

export interface NovoPet {
  nome: string;
  tipo: string;
  raca: string;
  idade: number;
  peso: number;
  tutorId: number;
}

export interface CorpoAviso {
  titulo: string;
  texto: string;
  tipo: string;
  tutorId: number | null;
  veterinarioId: number | null;
  petId: number | null;
}

export const adminApi = {
  // Usuários
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

  // Pets
  criarPet: (body: NovoPet) =>
    http.post<ApiResponse<number>>('/Pets', body).then((r) => r.data),

  atualizarPet: (id: number, body: NovoPet) =>
    http.patch<ApiResponse>(`/Pets/${id}`, body).then((r) => r.data),

  // Avisos
  criarAviso: (body: CorpoAviso) =>
    http.post<ApiResponse<number>>('/Avisos', body).then((r) => r.data),

  atualizarAviso: (id: number, body: CorpoAviso) =>
    http.put<ApiResponse>(`/Avisos/${id}`, body).then((r) => r.data),

  apagarAviso: (id: number) =>
    http.delete<ApiResponse>(`/Avisos/${id}`).then((r) => r.data),
};