import { http } from './http';
import type {
  ApiResponse, Aviso, Consulta, Historico, Pet, Relatorio, StatusConsulta, Vacina,
} from '../types';

const get = <T>(url: string) => http.get<ApiResponse<T>>(url).then((r) => r.data);

export const clinicaApi = {
  pets: () => get<Pet[]>('/Pets'),
  consultas: () => get<Consulta[]>('/Consultas'),
  atualizarStatus: (id: number, status: StatusConsulta, obs = '') =>
    http.patch<ApiResponse>(`/Consultas/${id}/status`, null, { params: { status, obs } }).then((r) => r.data),

  vacinas: (petId: number) => get<Vacina[]>(`/Vacinas/${petId}`),
  criarVacina: (body: { petId: number; nome: string; dataAplicacao: string; observacao: string; aplicada: boolean }) =>
    http.post<ApiResponse<number>>('/Vacinas', body).then((r) => r.data),
  aplicarVacina: (id: number, data: string, obs = '') =>
    http.patch<ApiResponse>(`/Vacinas/${id}/aplicar`, null, { params: { data, obs } }).then((r) => r.data),

  historico: (petId: number) => get<Historico[]>(`/Historico/${petId}`),
  adicionarHistorico: (body: { petId: number; descricao: string; dataEvento: string }) =>
    http.post<ApiResponse>('/Historico', body).then((r) => r.data),

  relatorios: () => get<Relatorio[]>('/Relatorios'),
  salvarRelatorio: (petId: number, texto: string) =>
    http.post<ApiResponse>('/Relatorios', { petId, texto }).then((r) => r.data),

  avisos: () => get<Aviso[]>('/Avisos'),
  criarAviso: (body: { titulo: string; texto: string; tipo: string; tutorId: number | null; petId: number | null }) =>
    http.post<ApiResponse>('/Avisos', body).then((r) => r.data),
  marcarAvisoLido: (id: number) =>
    http.post<ApiResponse>(`/Avisos/${id}/lido`).then((r) => r.data),
};