import { useState, type ChangeEvent } from 'react';
import { adminApi, type NovoPet } from '../../../api/admin';
import { getErro } from '../../../api/http';
import Modal from '../../../components/Modal';
import Vazio from '../../../components/Vazio';
import type { Pet, Usuario } from '../../../types';
import CamposPet from '../pets/CamposPet';
import { FORM_PET_VAZIO, validarPet, type FormPet } from '../pets/validarPet';
import type { SecaoAdminProps } from '../useAdminData';

type CampoEvento = ChangeEvent<HTMLInputElement | HTMLSelectElement>;
type Resposta = { sucesso: boolean; mensagem?: string };

export default function Pets({ dados, recarregar, avisar }: SecaoAdminProps) {
  const [form, setForm] = useState<FormPet>(FORM_PET_VAZIO);
  const [editando, setEditando] = useState<Pet | null>(null);
  const [salvando, setSalvando] = useState(false);

  const tutoresAtivos = dados.usuarios.filter((u) => u.perfil === 'Tutor' && u.ativo);
  // No modal, mantém o tutor atual mesmo que esteja desativado
  const tutoresDoModal = dados.usuarios.filter(
    (u) => u.perfil === 'Tutor' && (u.ativo || u.id === editando?.tutorId)
  );
  const lista = [...dados.pets].sort((a, b) => a.nome.localeCompare(b.nome));

  const duplicado = (f: FormPet, ignorarId?: number) =>
    dados.pets.some(
      (p) =>
        p.id !== ignorarId &&
        p.tutorId === Number(f.tutorId) &&
        p.nome.trim().toLowerCase() === f.nome.trim().toLowerCase()
    );

  async function persistir(
    f: FormPet,
    ignorarId: number | undefined,
    chamar: (pet: NovoPet) => Promise<Resposta>,
    msgOk: string
  ): Promise<boolean> {
    const r = validarPet(f);
    if ('erro' in r) {
      avisar(r.erro);
      return false;
    }
    if (duplicado(f, ignorarId)) {
      avisar('⚠️ Este tutor já tem um pet com esse nome.');
      return false;
    }

    setSalvando(true);
    try {
      const resp = await chamar(r.pet);
      if (!resp.sucesso) {
        avisar('❌ ' + (resp.mensagem ?? 'Não foi possível salvar o pet.'));
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

  async function criar() {
    const ok = await persistir(form, undefined, (pet) => adminApi.criarPet(pet), '✅ Pet cadastrado com sucesso.');
    if (ok) setForm(FORM_PET_VAZIO);
  }

  async function salvarEdicao(f: FormPet) {
    if (!editando) return;
    const id = editando.id;
    const ok = await persistir(f, id, (pet) => adminApi.atualizarPet(id, pet), '✅ Pet atualizado com sucesso.');
    if (ok) setEditando(null);
  }

  return (
    <section>
      <div className="page-header">
        <h3>Gerenciar pets</h3>
        <p>Cadastre novos pets e atualize os dados dos pets já existentes.</p>
      </div>

      <div className="card form-card">
        <div className="card-title" style={{ marginBottom: 14 }}>Cadastrar novo pet</div>
        <CamposPet
          f={form}
          onChange={(e: CampoEvento) => setForm({ ...form, [e.target.name]: e.target.value })}
          tutores={tutoresAtivos}
        />
        {tutoresAtivos.length === 0 && (
          <p className="card-sub">Nenhum tutor ativo. Cadastre um tutor na aba Usuários antes.</p>
        )}
        <button className="pbtn pbtn-primary" onClick={criar} disabled={salvando}>
          {salvando ? 'Salvando...' : '＋ Cadastrar pet'}
        </button>
      </div>

      {lista.length === 0 ? (
        <Vazio icone="🐾" texto="Nenhum pet cadastrado." />
      ) : (
        <div className="cards-grid">
          {lista.map((p) => {
            const totalConsultas = dados.consultas.filter((c) => c.petId === p.id).length;
            return (
              <div className="card" key={p.id}>
                <div className="card-header">
                  <div className="card-title">{p.nome}</div>
                  <span className="tag tag-green">{p.tipo}</span>
                </div>
                <p className="card-sub">
                  Tutor: <strong>{p.tutorNome}</strong><br />
                  Raça: {p.raca || 'não informada'}<br />
                  Idade: {p.idade ?? '-'} ano(s) • Peso: {p.peso != null ? `${String(p.peso).replace('.', ',')} kg` : '-'}<br />
                  Consultas: {totalConsultas}
                </p>
                <div className="card-actions">
                  <button className="pbtn pbtn-secondary pbtn-sm" onClick={() => setEditando(p)}>
                    ✏ Atualizar pet
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal aberto={editando !== null} titulo={`Atualizar ${editando?.nome ?? ''}`} onFechar={() => setEditando(null)}>
        {editando && (
          <FormEdicaoPet
            key={editando.id}
            pet={editando}
            tutores={tutoresDoModal}
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
  pet: Pet;
  tutores: Usuario[];
  salvando: boolean;
  onSalvar: (f: FormPet) => void;
  onCancelar: () => void;
}

function FormEdicaoPet({ pet, tutores, salvando, onSalvar, onCancelar }: EdicaoProps) {
  const [f, setF] = useState<FormPet>({
    nome: pet.nome,
    tutorId: String(pet.tutorId),
    tipo: pet.tipo,
    raca: pet.raca ?? '',
    idade: pet.idade != null ? String(pet.idade) : '',
    peso: pet.peso != null ? String(pet.peso).replace('.', ',') : '',
  });

  return (
    <>
      <CamposPet
        f={f}
        onChange={(e: CampoEvento) => setF({ ...f, [e.target.name]: e.target.value })}
        tutores={tutores}
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