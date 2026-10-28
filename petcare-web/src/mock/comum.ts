import type { Perfil } from '../types';
import { timestamp } from '../utils/datas';
import { proximoId, type ConsultaDb, type Db, type PetDb, type UsuarioDb, type AvisoDb } from './db';

export interface Resposta {
  status: number;
  corpo: unknown;
}

export interface Ctx {
  db: Db;
  u: UsuarioDb | null;
  corpo: Record<string, unknown>;
  bruto: unknown;
  p: Record<string, string>;
  q: Record<string, string>;
}
export type CtxAuth = Ctx & { u: UsuarioDb };

export type Rota =
  | { metodo: string; caminho: string; publica: true; h: (c: Ctx) => Resposta }
  | { metodo: string; caminho: string; publica?: false; perfis?: Perfil[]; h: (c: CtxAuth) => Resposta };

export const publica = (metodo: string, caminho: string, h: (c: Ctx) => Resposta): Rota => ({
  metodo, caminho, publica: true, h,
});
export const privada = (metodo: string, caminho: string, h: (c: CtxAuth) => Resposta, perfis?: Perfil[]): Rota => ({
  metodo, caminho, perfis, h,
});

export const ok = (dados?: unknown, mensagem?: string): Resposta => ({
  status: 200,
  corpo: { sucesso: true, mensagem, dados },
});
export const erro = (status: number, mensagem: string): Resposta => ({
  status,
  corpo: { sucesso: false, mensagem },
});

// ── Leitura segura do corpo ──────────────────────────────────────
export const t = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
export const n = (v: unknown): number => Number(v);
export const nul = (v: unknown): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v);

export const REGEX_DATA = /^\d{2}\/\d{2}\/\d{4}$/;
export const STATUS = ['Marcada', 'Realizada', 'Cancelada', 'NaoCompareceu'];

// Grade de horários: 08:00 a 17:30, de 30 em 30 minutos
export const GRADE: string[] = Array.from({ length: 20 }, (_, i) => {
  const min = 8 * 60 + i * 30;
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
});

export const nomeDe = (db: Db, id: number | null | undefined): string =>
  db.usuarios.find((x) => x.id === id)?.nome ?? '';

// ── Conversão para o formato da API (nunca expõe a senha) ────────
export const usuarioDto = (u: UsuarioDb) => ({
  id: u.id, nome: u.nome, login: u.login, perfil: u.perfil, email: u.email,
  telefone: u.telefone, endereco: u.endereco, convenioStatus: u.convenioStatus,
  registro: u.registro, ativo: u.ativo,
});

export const petDto = (db: Db, p: PetDb) => ({ ...p, tutorNome: nomeDe(db, p.tutorId) });

export const consultaDto = (db: Db, c: ConsultaDb) => ({
  id: c.id,
  petId: c.petId,
  petNome: db.pets.find((p) => p.id === c.petId)?.nome ?? '',
  veterinarioId: c.veterinarioId,
  vetNome: nomeDe(db, c.veterinarioId),
  data: c.data,
  hora: c.hora,
  status: c.status,
  observacoes: c.observacoes,
});

export const avisoDto = (a: AvisoDb, usuarioId: number) => ({
  id: a.id, titulo: a.titulo, texto: a.texto, tipo: a.tipo, tutorId: a.tutorId,
  petId: a.petId, veterinarioId: a.veterinarioId, lido: a.lidoPor.includes(usuarioId),
});

// ── Quem vê o quê ────────────────────────────────────────────────
export function petsVisiveis(db: Db, u: UsuarioDb): PetDb[] {
  if (u.perfil === 'Admin') return db.pets;
  if (u.perfil === 'Tutor') return db.pets.filter((p) => p.tutorId === u.id);
  const ids = new Set(db.consultas.filter((c) => c.veterinarioId === u.id).map((c) => c.petId));
  return db.pets.filter((p) => ids.has(p.id));
}

export function consultasVisiveis(db: Db, u: UsuarioDb): ConsultaDb[] {
  if (u.perfil === 'Admin') return db.consultas;
  if (u.perfil === 'Veterinario') return db.consultas.filter((c) => c.veterinarioId === u.id);
  const meus = new Set(db.pets.filter((p) => p.tutorId === u.id).map((p) => p.id));
  return db.consultas.filter((c) => meus.has(c.petId));
}

export const podeVerPet = (db: Db, u: UsuarioDb, petId: number): boolean =>
  petsVisiveis(db, u).some((p) => p.id === petId);

// ── Regras de consulta ───────────────────────────────────────────
export const ocupado = (db: Db, vetId: number, data: string, hora: string): boolean =>
  db.consultas.some(
    (c) => c.veterinarioId === vetId && c.data === data && c.hora === hora && c.status !== 'Cancelada'
  );

export const jaPassou = (data: string, hora: string): boolean => timestamp(data, hora) <= Date.now();

/** Aviso criado pelo "servidor" para o tutor quando algo acontece com a consulta */
export function avisoConsulta(db: Db, pet: PetDb, titulo: string, texto: string): void {
  db.avisos.unshift({
    id: proximoId(db.avisos), titulo, texto, tipo: 'consulta', tutorId: pet.tutorId,
    petId: pet.id, veterinarioId: null, autorId: null, lidoPor: [],
  });
}