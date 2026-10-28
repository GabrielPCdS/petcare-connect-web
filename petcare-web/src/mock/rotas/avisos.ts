import { avisoDto, erro, ok, nul, privada, t, type CtxAuth, type Resposta, type Rota } from '../comum';
import { proximoId, type AvisoDb, type Db, type UsuarioDb } from '../db';

function visiveis(db: Db, u: UsuarioDb): AvisoDb[] {
  if (u.perfil === 'Admin') return db.avisos;
  if (u.perfil === 'Tutor') return db.avisos.filter((a) => a.tipo === 'geral' || a.tutorId === u.id);
  // Veterinário: gerais, endereçados a ele e os que ele mesmo enviou
  return db.avisos.filter((a) => a.tipo === 'geral' || a.veterinarioId === u.id || a.autorId === u.id);
}

function listar(c: CtxAuth): Resposta {
  return ok(visiveis(c.db, c.u).map((a) => avisoDto(a, c.u.id)));
}

function criar(c: CtxAuth): Resposta {
  if (!t(c.corpo.titulo) || !t(c.corpo.texto)) return erro(400, 'Preencha ao menos título e mensagem.');
  const id = proximoId(c.db.avisos);
  c.db.avisos.unshift({
    id, titulo: t(c.corpo.titulo), texto: t(c.corpo.texto), tipo: t(c.corpo.tipo) || 'geral',
    tutorId: nul(c.corpo.tutorId), petId: nul(c.corpo.petId), veterinarioId: nul(c.corpo.veterinarioId),
    autorId: c.u.id, lidoPor: [],
  });
  return ok(id, 'Aviso publicado com sucesso.');
}

function atualizar(c: CtxAuth): Resposta {
  const a = c.db.avisos.find((x) => x.id === Number(c.p.id));
  if (!a) return erro(404, 'Aviso não encontrado.');
  if (!t(c.corpo.titulo) || !t(c.corpo.texto)) return erro(400, 'Preencha ao menos título e mensagem.');

  a.titulo = t(c.corpo.titulo);
  a.texto = t(c.corpo.texto);
  a.tipo = t(c.corpo.tipo) || a.tipo;
  a.tutorId = nul(c.corpo.tutorId);
  a.petId = nul(c.corpo.petId);
  a.veterinarioId = nul(c.corpo.veterinarioId);
  a.lidoPor = []; // editar zera a leitura de todos
  return ok(undefined, 'Aviso atualizado com sucesso.');
}

function apagar(c: CtxAuth): Resposta {
  const antes = c.db.avisos.length;
  c.db.avisos = c.db.avisos.filter((x) => x.id !== Number(c.p.id));
  if (c.db.avisos.length === antes) return erro(404, 'Aviso não encontrado.');
  return ok(undefined, 'Aviso apagado com sucesso.');
}

function marcarLido(c: CtxAuth): Resposta {
  const a = c.db.avisos.find((x) => x.id === Number(c.p.id));
  if (!a) return erro(404, 'Aviso não encontrado.');
  if (!a.lidoPor.includes(c.u.id)) a.lidoPor.push(c.u.id);
  return ok();
}

export const rotasAvisos: Rota[] = [
  privada('GET', '/Avisos', listar),
  privada('POST', '/Avisos', criar, ['Veterinario', 'Admin']),
  privada('PUT', '/Avisos/:id', atualizar, ['Admin']),
  privada('DELETE', '/Avisos/:id', apagar, ['Admin']),
  privada('POST', '/Avisos/:id/lido', marcarLido),
];