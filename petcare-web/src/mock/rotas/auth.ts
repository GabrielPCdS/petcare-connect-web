import { erro, ok, publica, t, type Ctx, type Resposta, type Rota } from '../comum';
import { proximoId } from '../db';

const senhaDe = (v: unknown): string => (typeof v === 'string' ? v : '');
const achar = (c: Ctx, login: string) =>
  c.db.usuarios.find((x) => x.login.toLowerCase() === login.toLowerCase());

function login(c: Ctx): Resposta {
  const u = achar(c, t(c.corpo.login));
  if (!u || u.senha !== senhaDe(c.corpo.senha)) return erro(400, 'Login ou senha inválidos.');
  if (!u.ativo) return erro(400, 'Usuário desativado.');
  // O perfil enviado é ignorado: devolvemos sempre o perfil real da conta
  return ok({ token: `mock-${u.id}`, usuarioId: u.id, nome: u.nome, login: u.login, perfil: u.perfil });
}

function cadastro(c: Ctx): Resposta {
  const nome = t(c.corpo.nome);
  const loginNovo = t(c.corpo.login);
  const email = t(c.corpo.email);
  const senha = senhaDe(c.corpo.senha);
  if (!nome || !loginNovo || !email || !senha) return erro(400, 'Preencha todos os campos.');
  if (achar(c, loginNovo)) return erro(400, 'Login já cadastrado.');
  const id = proximoId(c.db.usuarios);
  c.db.usuarios.push({
    id, nome, login: loginNovo, senha, perfil: 'Tutor', email, telefone: '', ativo: true,
  });
  return ok(id, 'Conta criada com sucesso.');
}

function recuperarSenha(c: Ctx): Resposta {
  const u = achar(c, t(c.corpo.login));
  if (!u || u.email.toLowerCase() !== t(c.corpo.email).toLowerCase()) {
    return erro(400, 'Usuário não encontrado.');
  }
  const token = crypto.randomUUID();
  c.db.resets[token] = { login: u.login, expira: Date.now() + 15 * 60 * 1000 };
  return ok({ token }, 'Identidade confirmada.');
}

function novaSenha(c: Ctx): Resposta {
  const token = t(c.corpo.token);
  const reset = c.db.resets[token];
  if (!reset || reset.expira < Date.now() || reset.login.toLowerCase() !== t(c.corpo.login).toLowerCase()) {
    return erro(400, 'Redefinição inválida ou expirada. Refaça a recuperação.');
  }
  const senha = senhaDe(c.corpo.novaSenha);
  if (senha.length < 6) return erro(400, 'A senha deve ter pelo menos 6 caracteres.');
  const u = achar(c, reset.login);
  if (!u) return erro(400, 'Usuário não encontrado.');
  u.senha = senha;
  delete c.db.resets[token];
  return ok(undefined, 'Senha alterada com sucesso.');
}

export const rotasAuth: Rota[] = [
  publica('POST', '/Auth/login', login),
  publica('POST', '/Auth/cadastro', cadastro),
  publica('POST', '/Auth/recuperar-senha', recuperarSenha),
  publica('POST', '/Auth/nova-senha', novaSenha),
];