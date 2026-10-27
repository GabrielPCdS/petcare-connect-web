import { useState, type ChangeEvent } from 'react';
import { adminApi, type CorpoAviso } from '../../../api/admin';
import { getErro } from '../../../api/http';
import Modal from '../../../components/Modal';
import Vazio from '../../../components/Vazio';
import type { Aviso, Usuario } from '../../../types';
import CamposAviso from '../avisos/CamposAviso';
import { FORM_AVISO_VAZIO, montarAviso, type Destino, type FormAviso } from '../avisos/montarAviso';
import type { DadosAdmin, SecaoAdminProps } from '../useAdminData';

type CampoEvento = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
type Resposta = { sucesso: boolean; mensagem?: string };

// Avisos criados pelo backend (consulta e pet): só título e mensagem podem mudar
const ehDoSistema = (a: Aviso) => a.tipo === 'consulta' || a.tipo === 'pet';

function formDoAviso(a: Aviso): FormAviso {
  const destino: Destino = a.tipo === 'tutor' || a.tipo === 'vet' ? a.tipo : 'geral';
  return {
    titulo: a.titulo,
    texto: a.texto,
    destino,
    tutorId: a.tutorId != null ? String(a.tutorId) : '',
    vetId: a.veterinarioId != null ? String(a.veterinarioId) : '',
  };
}

function rotuloDestino(a: Aviso, dados: DadosAdmin): string {
  const nome = (id?: number | null) => dados.usuarios.find((u) => u.id === id)?.nome ?? 'não definido';
  switch (a.tipo) {
    case 'tutor':
      return `Tutor(a): ${nome(a.tutorId)}`;
    case 'vet':
      return `Veterinário(a): ${nome(a.veterinarioId)}`;
    case 'pet':
      return a.tutorId != null ? `Tutor(a): ${nome(a.tutorId)} (pet relacionado)` : 'Pet / Tutor relacionado';
    case 'consulta':
      return 'Consulta relacionada';
    default:
      return 'Todos';
  }
}

export default function Avisos({ dados, recarregar, avisar }: SecaoAdminProps) {
  const [form, setForm] = useState<FormAviso>(FORM_AVISO_VAZIO);
  const [editando, setEditando] = useState<Aviso | null>(null);
  const [salvando, setSalvando] = useState(false);

  const tutores = dados.usuarios.filter((u) => u.perfil === 'Tutor' && u.ativo);
  const vets = dados.usuarios.filter((u) => u.perfil === 'Veterinario' && u.ativo);
  const lista = [...dados.avisos].sort((a, b) => b.id - a.id);

  async function executar(chamar: () => Promise<Resposta>, msgOk: string): Promise<boolean> {
    setSalvando(true);
    try {
      const r = await chamar();
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível concluir a operação.'));
        return false;
      }
      await recarregar();
      avisar(msgOk);
      return true;
    } catch (e) {
      avisar('❌ ' + getErro(e));
      return false;
    } finally {
      setSalvando(false);
    }
  }

  async function publicar() {
    const r = montarAviso(form);
    if ('erro' in r) {
      avisar(r.erro);
      return;
    }
    const ok = await executar(() => adminApi.criarAviso(r.corpo), '✅ Aviso publicado com sucesso.');
    if (ok) setForm(FORM_AVISO_VAZIO);
  }

  async function salvarEdicao(f: FormAviso) {
    if (!editando) return;
    const aviso = editando;
    let corpo: CorpoAviso;

    if (ehDoSistema(aviso)) {
      if (!f.titulo.trim() || !f.texto.trim()) {
        avisar('⚠️ Preencha ao menos título e mensagem.');
        return;
      }
      corpo = {
        titulo: f.titulo.trim(),
        texto: f.texto.trim(),
        tipo: aviso.tipo,
        tutorId: aviso.tutorId,
        veterinarioId: aviso.veterinarioId ?? null,
        petId: aviso.petId,
      };
    } else {
      const r = montarAviso(f);
      if ('erro' in r) {
        avisar(r.erro);
        return;
      }
      corpo = r.corpo;
    }

    const ok = await executar(() => adminApi.atualizarAviso(aviso.id, corpo), '✅ Aviso atualizado com sucesso.');
    if (ok) setEditando(null);
  }

  async function apagar(a: Aviso) {
    if (!window.confirm(`Deseja apagar o aviso "${a.titulo}"?`)) return;
    await executar(() => adminApi.apagarAviso(a.id), '✅ Aviso apagado com sucesso.');
  }

  return (
    <section>
      <div className="page-header">
        <h3>Publicar avisos</h3>
        <p>Escolha para quem o aviso será enviado: todos, um tutor(a) específico ou um veterinário(a) específico.</p>
      </div>

      <div className="card form-card">
        <CamposAviso
          f={form}
          onChange={(e: CampoEvento) => setForm({ ...form, [e.target.name]: e.target.value })}
          tutores={tutores}
          vets={vets}
          comDestino
        />
        <button className="pbtn pbtn-primary" onClick={publicar} disabled={salvando}>
          {salvando ? 'Salvando...' : '📢 Publicar aviso'}
        </button>
      </div>

      {lista.length === 0 ? (
        <Vazio icone="📢" texto="Nenhum aviso publicado." />
      ) : (
        <div className="cards-grid">
          {lista.map((a) => (
            <div className="card" key={a.id}>
              <div className="card-header">
                <div className="card-title">{a.titulo}</div>
                <span className={`tag ${ehDoSistema(a) ? 'tag-navy' : 'tag-green'}`}>
                  {ehDoSistema(a) ? 'Automático' : 'Aviso'}
                </span>
              </div>
              <p className="card-sub">
                {a.texto}<br />
                <strong>Destino:</strong> {rotuloDestino(a, dados)}
              </p>
              <div className="card-actions">
                <button className="pbtn pbtn-secondary pbtn-sm" onClick={() => setEditando(a)}>✏ Editar aviso</button>
                <button className="pbtn pbtn-secondary pbtn-sm" onClick={() => apagar(a)}>🗑 Apagar aviso</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal aberto={editando !== null} titulo="Editar aviso" onFechar={() => setEditando(null)}>
        {editando && (
          <FormEdicaoAviso
            key={editando.id}
            aviso={editando}
            tutores={tutores}
            vets={vets}
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
  aviso: Aviso;
  tutores: Usuario[];
  vets: Usuario[];
  salvando: boolean;
  onSalvar: (f: FormAviso) => void;
  onCancelar: () => void;
}

function FormEdicaoAviso({ aviso, tutores, vets, salvando, onSalvar, onCancelar }: EdicaoProps) {
  const [f, setF] = useState<FormAviso>(formDoAviso(aviso));

  return (
    <>
      <CamposAviso
        f={f}
        onChange={(e: CampoEvento) => setF({ ...f, [e.target.name]: e.target.value })}
        tutores={tutores}
        vets={vets}
        comDestino={!ehDoSistema(aviso)}
      />
      <div className="card-actions">
        <button className="pbtn pbtn-primary" onClick={() => onSalvar(f)} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button className="pbtn pbtn-secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </>
  );
}