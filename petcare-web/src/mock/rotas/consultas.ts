import {
  avisoConsulta, consultaDto, consultasVisiveis, erro, GRADE, jaPassou, n, ocupado, ok,
  privada, REGEX_DATA, STATUS, t, type CtxAuth, type Resposta, type Rota,
} from '../comum';
import { proximoId } from '../db';
import { timestamp } from '../../utils/datas';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

function listar(c: CtxAuth): Resposta {
  return ok(consultasVisiveis(c.db, c.u).map((x) => consultaDto(c.db, x)));
}

function horariosDisponiveis(c: CtxAuth): Resposta {
  const vetId = n(c.q.veterinarioId);
  const data = c.q.data ?? '';
  if (!vetId || !REGEX_DATA.test(data)) return erro(400, 'Informe veterinário e data.');
  return ok(GRADE.filter((h) => !ocupado(c.db, vetId, data, h) && !jaPassou(data, h)));
}

function criar(c: CtxAuth): Resposta {
  const petId = n(c.corpo.petId);
  const vetId = n(c.corpo.veterinarioId);
  const data = t(c.corpo.data);
  const hora = t(c.corpo.hora);

  const pet = c.db.pets.find((p) => p.id === petId);
  if (!pet || (c.u.perfil === 'Tutor' && pet.tutorId !== c.u.id)) return erro(400, 'Pet não encontrado.');
  const vet = c.db.usuarios.find((x) => x.id === vetId && x.perfil === 'Veterinario' && x.ativo);
  if (!vet) return erro(400, 'Veterinário não encontrado.');
  if (!REGEX_DATA.test(data) || !GRADE.includes(hora)) return erro(400, 'Data ou hora inválida.');
  if (jaPassou(data, hora)) return erro(400, 'Escolha uma data e hora futuras.');
  if (ocupado(c.db, vetId, data, hora)) {
    return erro(400, 'Horário já reservado para este veterinário (Regra RN-002).');
  }

  const id = proximoId(c.db.consultas);
  c.db.consultas.unshift({
    id, petId, veterinarioId: vetId, data, hora, status: 'Marcada', observacoes: t(c.corpo.observacoes),
  });
  avisoConsulta(c.db, pet, 'Consulta agendada', `${pet.nome} foi agendado(a) com ${vet.nome} para ${data} às ${hora}.`);
  return ok(id, 'Consulta agendada com sucesso.');
}

function atualizarStatus(c: CtxAuth): Resposta {
  const cons = c.db.consultas.find((x) => x.id === Number(c.p.id));
  if (!cons) return erro(404, 'Consulta não encontrada.');
  if (c.u.perfil === 'Veterinario' && cons.veterinarioId !== c.u.id) {
    return erro(403, 'Esta consulta não é sua.');
  }
  const status = c.q.status ?? '';
  if (!STATUS.includes(status)) return erro(400, 'Status inválido.');

  cons.status = status;
  if (c.q.obs) cons.observacoes = c.q.obs;

  const pet = c.db.pets.find((p) => p.id === cons.petId);
  if (pet && status === 'Realizada') {
    avisoConsulta(c.db, pet, 'Consulta concluída', `A consulta de ${pet.nome} foi concluída.`);
  }
  return ok(undefined, 'Status atualizado.');
}

function cancelar(c: CtxAuth): Resposta {
  const cons = c.db.consultas.find((x) => x.id === Number(c.p.id));
  if (!cons) return erro(404, 'Consulta não encontrada.');
  const pet = c.db.pets.find((p) => p.id === cons.petId);
  if (c.u.perfil === 'Tutor' && pet?.tutorId !== c.u.id) return erro(403, 'Esta consulta não é sua.');
  if (cons.status !== 'Marcada') return erro(400, 'Apenas consultas marcadas podem ser desmarcadas.');

  // RN-005: menos de 24h de antecedência vira "NaoCompareceu"
  const faltam = timestamp(cons.data, cons.hora) - Date.now();
  cons.status = faltam < UM_DIA_MS ? 'NaoCompareceu' : 'Cancelada';

  if (pet) {
    avisoConsulta(
      c.db, pet, 'Consulta desmarcada',
      `A consulta de ${pet.nome}, marcada para ${cons.data} às ${cons.hora}, foi desmarcada.`
    );
  }
  return ok(undefined, 'Consulta desmarcada.');
}

export const rotasConsultas: Rota[] = [
  privada('GET', '/Consultas', listar),
  privada('GET', '/Consultas/horarios-disponiveis', horariosDisponiveis, ['Admin', 'Tutor']),
  privada('POST', '/Consultas', criar, ['Tutor', 'Admin']),
  privada('PATCH', '/Consultas/:id/status', atualizarStatus, ['Veterinario', 'Admin']),
  privada('POST', '/Consultas/:id/cancelar', cancelar, ['Tutor', 'Admin']),
];