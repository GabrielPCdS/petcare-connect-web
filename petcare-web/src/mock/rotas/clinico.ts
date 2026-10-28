import { erro, n, nomeDe, ok, petsVisiveis, podeVerPet, privada, t, type CtxAuth, type Resposta, type Rota } from '../comum';
import { agoraBr, proximoId, type Db, type RelatorioDb, type VacinaDb } from '../db';

const vacinaDto = (db: Db, v: VacinaDb) => ({ ...v, petNome: db.pets.find((p) => p.id === v.petId)?.nome ?? '' });

const relatorioDto = (db: Db, r: RelatorioDb) => {
  const pet = db.pets.find((p) => p.id === r.petId);
  return { ...r, petNome: pet?.nome ?? '', tutorNome: nomeDe(db, pet?.tutorId) };
};

// ── Vacinas ──────────────────────────────────────────────────────
function vacinasDoPet(c: CtxAuth): Resposta {
  const petId = n(c.p.petId);
  if (!podeVerPet(c.db, c.u, petId)) return erro(403, 'Sem acesso a este pet.');
  return ok(c.db.vacinas.filter((v) => v.petId === petId).map((v) => vacinaDto(c.db, v)));
}

function todasVacinas(c: CtxAuth): Resposta {
  const ids = new Set(petsVisiveis(c.db, c.u).map((p) => p.id));
  return ok(c.db.vacinas.filter((v) => ids.has(v.petId)).map((v) => vacinaDto(c.db, v)));
}

function criarVacina(c: CtxAuth): Resposta {
  const petId = n(c.corpo.petId);
  if (!podeVerPet(c.db, c.u, petId)) return erro(403, 'Sem acesso a este pet.');
  if (!t(c.corpo.nome)) return erro(400, 'Informe o nome da vacina.');

  const id = proximoId(c.db.vacinas);
  c.db.vacinas.push({
    id, petId, nome: t(c.corpo.nome), dataAplicacao: t(c.corpo.dataAplicacao) || null,
    observacao: t(c.corpo.observacao), aplicada: c.corpo.aplicada === true,
  });
  return ok(id, 'Vacina registrada com sucesso.');
}

function aplicarVacina(c: CtxAuth): Resposta {
  const v = c.db.vacinas.find((x) => x.id === Number(c.p.id));
  if (!v) return erro(404, 'Vacina não encontrada.');
  if (!podeVerPet(c.db, c.u, v.petId)) return erro(403, 'Sem acesso a este pet.');
  v.aplicada = true;
  v.dataAplicacao = c.q.data || agoraBr().slice(0, 10);
  if (c.q.obs) v.observacao = c.q.obs;
  return ok(undefined, 'Vacina marcada como aplicada.');
}

// ── Histórico ────────────────────────────────────────────────────
function historicoDoPet(c: CtxAuth): Resposta {
  const petId = n(c.p.petId);
  if (!podeVerPet(c.db, c.u, petId)) return erro(403, 'Sem acesso a este pet.');
  return ok(c.db.historico.filter((h) => h.petId === petId));
}

function criarHistorico(c: CtxAuth): Resposta {
  const petId = n(c.corpo.petId);
  if (!podeVerPet(c.db, c.u, petId)) return erro(403, 'Sem acesso a este pet.');
  if (!t(c.corpo.descricao) || !t(c.corpo.dataEvento)) return erro(400, 'Informe a data e a descrição.');

  const id = proximoId(c.db.historico);
  c.db.historico.push({ id, petId, descricao: t(c.corpo.descricao), dataEvento: t(c.corpo.dataEvento) });
  return ok(id, 'Atendimento registrado com sucesso.');
}

// ── Relatórios ───────────────────────────────────────────────────
function listarRelatorios(c: CtxAuth): Resposta {
  const ids = new Set(petsVisiveis(c.db, c.u).map((p) => p.id));
  return ok(c.db.relatorios.filter((r) => ids.has(r.petId)).map((r) => relatorioDto(c.db, r)));
}

function salvarRelatorio(c: CtxAuth): Resposta {
  const petId = n(c.corpo.petId);
  const texto = t(c.corpo.texto);
  if (!podeVerPet(c.db, c.u, petId)) return erro(403, 'Sem acesso a este pet.');
  if (!texto) return erro(400, 'Escreva o texto do relatório.');

  // RN-003: o pet precisa ter ao menos uma consulta realizada
  if (!c.db.consultas.some((x) => x.petId === petId && x.status === 'Realizada')) {
    return erro(400, 'O pet deve ter ao menos uma consulta com status "Realizada" para gerar relatório (Regra RN-003).');
  }

  const existente = c.db.relatorios.find((r) => r.petId === petId);
  if (existente) {
    existente.texto = texto;
    existente.atualizacao = agoraBr();
  } else {
    c.db.relatorios.push({ id: proximoId(c.db.relatorios), petId, texto, status: 'Disponivel', atualizacao: agoraBr() });
  }
  return ok(undefined, 'Relatório salvo com sucesso.');
}

export const rotasClinico: Rota[] = [
  privada('GET', '/Vacinas', todasVacinas),
  privada('GET', '/Vacinas/:petId', vacinasDoPet),
  privada('POST', '/Vacinas', criarVacina, ['Veterinario', 'Admin']),
  privada('PATCH', '/Vacinas/:id/aplicar', aplicarVacina, ['Veterinario', 'Admin']),
  privada('GET', '/Historico/:petId', historicoDoPet),
  privada('POST', '/Historico', criarHistorico, ['Veterinario', 'Admin']),
  privada('GET', '/Relatorios', listarRelatorios),
  privada('POST', '/Relatorios', salvarRelatorio, ['Veterinario', 'Admin']),
];