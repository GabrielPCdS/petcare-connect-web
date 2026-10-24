import { useState, type ChangeEvent } from 'react';
import { adminApi, type EdicaoUsuario, type NovoUsuario } from '../../../api/admin';
import { getErro } from '../../../api/http';
import Modal from '../../../components/Modal';
import Vazio from '../../../components/Vazio';
import type { Usuario } from '../../../types';
import type { SecaoAdminProps } from '../useAdminData';

type PerfilNovo = 'Tutor' | 'Veterinario';
type CampoEvento = ChangeEvent<HTMLInputElement | HTMLSelectElement>;

const ROTULO_PERFIL: Record<string, string> = {
  Tutor: 'Tutor(a)', Veterinario: 'Veterinário(a)', Admin: 'Administrador',
};

const FORM_VAZIO = {
  nome: '', login: '', senha: '', email: '', telefone: '',
  endereco: '', convenioStatus: 'Ativo', registro: '',
};

export default function Usuarios({ dados, recarregar, avisar }: SecaoAdminProps) {
  const [perfil, setPerfil] = useState<PerfilNovo>('Tutor');
  const [form, setForm] = useState(FORM_VAZIO);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [salvando, setSalvando] = useState(false);

  const lista = dados.usuarios.filter((u) => u.perfil !== 'Admin');
  const campo = (e: CampoEvento) => setForm({ ...form, [e.target.name]: e.target.value });

  async function criar() {
    if (!form.nome.trim() || !form.login.trim() || !form.email.trim()) {
      avisar('⚠️ Informe nome, login e e-mail.');
      return;
    }
    if (!form.email.includes('@')) {
      avisar('⚠️ Informe um e-mail válido.');
      return;
    }
    if (form.senha.length < 6) {
      avisar('⚠️ A senha inicial deve ter pelo menos 6 caracteres.');
      return;
    }

    const body: NovoUsuario = {
      nome: form.nome.trim(),
      login: form.login.trim(),
      senha: form.senha,
      perfil,
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      ...(perfil === 'Tutor'
        ? { endereco: form.endereco.trim(), convenioStatus: form.convenioStatus }
        : { registro: form.registro.trim() }),
    };

    setSalvando(true);
    try {
      const r = await adminApi.criarUsuario(body);
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível cadastrar.'));
        return;
      }
      setForm(FORM_VAZIO);
      await recarregar();
      avisar('✅ Usuário cadastrado com sucesso.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarEdicao(body: EdicaoUsuario) {
    if (!editando) return;
    if (!body.nome?.trim()) {
      avisar('⚠️ O nome não pode ficar vazio.');
      return;
    }
    setSalvando(true);
    try {
      const r = await adminApi.atualizarUsuario(editando.id, body);
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível atualizar.'));
        return;
      }
      setEditando(null);
      await recarregar();
      avisar('✅ Usuário atualizado com sucesso.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(u: Usuario) {
    const acao = u.ativo ? 'desativar' : 'reativar';
    if (!window.confirm(`Deseja ${acao} o acesso de ${u.nome}?`)) return;
    try {
      const r = await adminApi.alternarAtivo(u.id, !u.ativo);
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível alterar o status.'));
        return;
      }
      await recarregar();
      avisar(u.ativo ? '✅ Usuário desativado.' : '✅ Usuário reativado.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  return (
    <section>
      <div className="page-header">
        <h3>Gerenciar usuários</h3>
        <p>Cadastre tutores e veterinários, atualize dados e controle quem pode acessar o sistema.</p>
      </div>

      <div className="card form-card">
        <div className="card-title" style={{ marginBottom: 14 }}>Cadastrar novo usuário</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Perfil</label>
            <select value={perfil} onChange={(e) => setPerfil(e.target.value as PerfilNovo)}>
              <option value="Tutor">Tutor(a)</option>
              <option value="Veterinario">Veterinário(a)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={campo} placeholder="Nome completo" />
          </div>
          <div className="form-group">
            <label>Login</label>
            <input name="login" value={form.login} onChange={campo} placeholder="Login de acesso" />
          </div>
          <div className="form-group">
            <label>Senha inicial</label>
            <input name="senha" type="password" value={form.senha} onChange={campo} placeholder="Mínimo 6 caracteres" />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input name="email" type="email" value={form.email} onChange={campo} placeholder="E-mail" />
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input name="telefone" value={form.telefone} onChange={campo} placeholder="Telefone" />
          </div>
          {perfil === 'Tutor' ? (
            <>
              <div className="form-group">
                <label>Endereço</label>
                <input name="endereco" value={form.endereco} onChange={campo} placeholder="Endereço completo" />
              </div>
              <div className="form-group">
                <label>Status do convênio</label>
                <select name="convenioStatus" value={form.convenioStatus} onChange={campo}>
                  <option>Ativo</option>
                  <option>Pendente</option>
                </select>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Número de registro</label>
              <input name="registro" value={form.registro} onChange={campo} placeholder="Ex.: CRMV 12345" />
            </div>
          )}
        </div>
        <button className="pbtn pbtn-primary" onClick={criar} disabled={salvando}>
          {salvando ? 'Salvando...' : '＋ Cadastrar usuário'}
        </button>
      </div>

      {lista.length === 0 ? (
        <Vazio icone="👤" texto="Nenhum usuário encontrado." />
      ) : (
        <div className="cards-grid">
          {lista.map((u) => {
            const petsDoTutor = dados.pets.filter((p) => p.tutorId === u.id);
            return (
              <div className="card" key={u.id}>
                <div className="card-header">
                  <div className="card-title">{u.nome}</div>
                  <span>
                    <span className={`tag ${u.perfil === 'Tutor' ? 'tag-green' : 'tag-navy'}`}>
                      {ROTULO_PERFIL[u.perfil] ?? u.perfil}
                    </span>
                    {!u.ativo && <span className="tag tag-red" style={{ marginLeft: 6 }}>Inativo</span>}
                  </span>
                </div>
                <p className="card-sub">
                  Login: {u.login}<br />
                  E-mail: {u.email || 'não informado'}<br />
                  Telefone: {u.telefone || 'não informado'}<br />
                  {u.perfil === 'Tutor' ? (
                    <>
                      Endereço: {u.endereco || 'não informado'}<br />
                      Convênio: {u.convenioStatus || 'Pendente'}<br />
                      Pets vinculados: {petsDoTutor.length ? petsDoTutor.map((p) => p.nome).join(', ') : 'nenhum'}
                    </>
                  ) : (
                    <>Registro: {u.registro || 'não informado'}</>
                  )}
                </p>
                <div className="card-actions">
                  <button className="pbtn pbtn-secondary pbtn-sm" onClick={() => setEditando(u)}>✏ Atualizar dados</button>
                  <button className="pbtn pbtn-secondary pbtn-sm" onClick={() => alternarAtivo(u)}>
                    {u.ativo ? '⛔ Desativar' : '✅ Reativar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal aberto={editando !== null} titulo={`Atualizar ${editando?.nome ?? ''}`} onFechar={() => setEditando(null)}>
        {editando && (
          <FormEdicao
            key={editando.id}
            usuario={editando}
            salvando={salvando}
            onSalvar={salvarEdicao}
            onCancelar={() => setEditando(null)}
          />
        )}
      </Modal>
    </section>
  );
}

interface EdicaoProps {
  usuario: Usuario;
  salvando: boolean;
  onSalvar: (body: EdicaoUsuario) => void;
  onCancelar: () => void;
}

function FormEdicao({ usuario, salvando, onSalvar, onCancelar }: EdicaoProps) {
  const [f, setF] = useState({
    nome: usuario.nome,
    email: usuario.email ?? '',
    telefone: usuario.telefone ?? '',
    endereco: usuario.endereco ?? '',
    convenioStatus: usuario.convenioStatus ?? 'Pendente',
    registro: usuario.registro ?? '',
  });
  const campo = (e: CampoEvento) => setF({ ...f, [e.target.name]: e.target.value });
  const tutor = usuario.perfil === 'Tutor';

  function salvar() {
    onSalvar({
      nome: f.nome.trim(),
      email: f.email.trim(),
      telefone: f.telefone.trim(),
      ...(tutor
        ? { endereco: f.endereco.trim(), convenioStatus: f.convenioStatus }
        : { registro: f.registro.trim() }),
    });
  }

  return (
    <>
      <div className="form-grid">
        <div className="form-group">
          <label>Nome</label>
          <input name="nome" value={f.nome} onChange={campo} />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input name="email" type="email" value={f.email} onChange={campo} />
        </div>
        <div className="form-group">
          <label>Telefone</label>
          <input name="telefone" value={f.telefone} onChange={campo} />
        </div>
        {tutor ? (
          <>
            <div className="form-group">
              <label>Endereço</label>
              <input name="endereco" value={f.endereco} onChange={campo} />
            </div>
            <div className="form-group">
              <label>Status do convênio</label>
              <select name="convenioStatus" value={f.convenioStatus} onChange={campo}>
                <option>Ativo</option>
                <option>Pendente</option>
              </select>
            </div>
          </>
        ) : (
          <div className="form-group">
            <label>Número de registro</label>
            <input name="registro" value={f.registro} onChange={campo} />
          </div>
        )}
      </div>
      <div className="card-actions">
        <button className="pbtn pbtn-primary" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button className="pbtn pbtn-secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </>
  );
}