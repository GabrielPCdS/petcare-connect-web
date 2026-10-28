import { erro, ok, privada, t, usuarioDto, type CtxAuth, type Resposta, type Rota } from '../comum';
import { proximoId } from '../db';

function listar(c: CtxAuth): Resposta {
  const perfil = c.q.perfil;
  return ok(c.db.usuarios.filter((u) => !perfil || u.perfil === perfil).map(usuarioDto));
}

function criar(c: CtxAuth): Resposta {
  const perfil = t(c.corpo.perfil);
  const nome = t(c.corpo.nome);
  const login = t(c.corpo.login);
  const email = t(c.corpo.email);
  const senha = typeof c.corpo.senha === 'string' ? c.corpo.senha : '';

  if (perfil !== 'Tutor' && perfil !== 'Veterinario') return erro(400, 'Perfil inválido.');
  if (!nome || !login || !email) return erro(400, 'Informe nome, login e e-mail.');
  if (senha.length < 6) return erro(400, 'A senha deve ter pelo menos 6 caracteres.');
  if (c.db.usuarios.some((x) => x.login.toLowerCase() === login.toLowerCase())) {
    return erro(400, 'Login já cadastrado.');
  }

  const id = proximoId(c.db.usuarios);
  c.db.usuarios.push({
    id, nome, login, senha, perfil, email, telefone: t(c.corpo.telefone),
    endereco: t(c.corpo.endereco), convenioStatus: t(c.corpo.convenioStatus),
    registro: t(c.corpo.registro), ativo: true,
  });
  return ok(id, 'Usuário cadastrado com sucesso.');
}

function atualizar(c: CtxAuth): Resposta {
  const u = c.db.usuarios.find((x) => x.id === Number(c.p.id));
  if (!u) return erro(404, 'Usuário não encontrado.');
  const nome = t(c.corpo.nome);
  if (!nome) return erro(400, 'O nome não pode ficar vazio.');

  u.nome = nome;
  u.email = t(c.corpo.email);
  u.telefone = t(c.corpo.telefone);
  if ('endereco' in c.corpo) u.endereco = t(c.corpo.endereco);
  if ('convenioStatus' in c.corpo) u.convenioStatus = t(c.corpo.convenioStatus);
  if ('registro' in c.corpo) u.registro = t(c.corpo.registro);
  return ok(undefined, 'Usuário atualizado com sucesso.');
}

function alternarAtivo(c: CtxAuth): Resposta {
  const u = c.db.usuarios.find((x) => x.id === Number(c.p.id));
  if (!u) return erro(404, 'Usuário não encontrado.');
  if (typeof c.bruto !== 'boolean') return erro(400, 'Envie true ou false.');
  u.ativo = c.bruto;
  return ok(undefined, 'Status atualizado.');
}

export const rotasUsuarios: Rota[] = [
  privada('GET', '/Usuarios', listar, ['Admin']),
  privada('POST', '/Usuarios', criar, ['Admin']),
  privada('PUT', '/Usuarios/:id', atualizar, ['Admin']),
  privada('PATCH', '/Usuarios/:id/ativo', alternarAtivo, ['Admin']),
];