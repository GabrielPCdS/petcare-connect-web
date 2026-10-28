import { erro, n, ok, petDto, petsVisiveis, privada, t, type CtxAuth, type Resposta, type Rota } from '../comum';
import { agoraBr, proximoId } from '../db';

function validar(c: CtxAuth): string | null {
  if (!t(c.corpo.nome) || !t(c.corpo.tipo)) return 'Informe nome e tipo do pet.';
  if (!Number.isInteger(n(c.corpo.idade)) || n(c.corpo.idade) <= 0) return 'A idade deve ser um inteiro maior que 0.';
  if (!(n(c.corpo.peso) > 0)) return 'O peso deve ser maior que 0.';
  return null;
}

function listar(c: CtxAuth): Resposta {
  return ok(petsVisiveis(c.db, c.u).map((p) => petDto(c.db, p)));
}

function criar(c: CtxAuth): Resposta {
  const problema = validar(c);
  if (problema) return erro(400, problema);

  const tutorId = c.u.perfil === 'Tutor' ? c.u.id : n(c.corpo.tutorId);
  if (!c.db.usuarios.some((x) => x.id === tutorId && x.perfil === 'Tutor')) {
    return erro(400, 'Tutor não encontrado.');
  }
  const nome = t(c.corpo.nome);
  if (c.db.pets.some((p) => p.tutorId === tutorId && p.nome.toLowerCase() === nome.toLowerCase())) {
    return erro(400, 'Este tutor já possui um pet com esse nome.');
  }

  const id = proximoId(c.db.pets);
  c.db.pets.push({
    id, nome, tipo: t(c.corpo.tipo), raca: t(c.corpo.raca), idade: n(c.corpo.idade),
    peso: n(c.corpo.peso), tutorId, criadoEm: agoraBr().slice(0, 10),
  });
  return ok(id, 'Pet cadastrado com sucesso.');
}

function atualizar(c: CtxAuth): Resposta {
  const pet = c.db.pets.find((p) => p.id === Number(c.p.id));
  if (!pet) return erro(404, 'Pet não encontrado.');
  if (c.u.perfil === 'Tutor' && pet.tutorId !== c.u.id) return erro(403, 'Este pet não é seu.');

  const problema = validar(c);
  if (problema) return erro(400, problema);

  const tutorId = c.u.perfil === 'Admin' ? n(c.corpo.tutorId) : pet.tutorId;
  const nome = t(c.corpo.nome);
  if (c.db.pets.some((p) => p.id !== pet.id && p.tutorId === tutorId && p.nome.toLowerCase() === nome.toLowerCase())) {
    return erro(400, 'Este tutor já possui um pet com esse nome.');
  }

  pet.nome = nome;
  pet.tipo = t(c.corpo.tipo);
  pet.raca = t(c.corpo.raca);
  pet.idade = n(c.corpo.idade);
  pet.peso = n(c.corpo.peso);
  pet.tutorId = tutorId;
  return ok(undefined, 'Pet atualizado com sucesso.');
}

export const rotasPets: Rota[] = [
  privada('GET', '/Pets', listar),
  privada('POST', '/Pets', criar, ['Tutor', 'Admin']),
  privada('PATCH', '/Pets/:id', atualizar, ['Tutor', 'Admin']),
];