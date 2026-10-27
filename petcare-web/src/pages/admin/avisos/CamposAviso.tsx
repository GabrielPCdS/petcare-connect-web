import type { ChangeEvent } from 'react';
import type { Usuario } from '../../../types';
import type { FormAviso } from './montarAviso';

type CampoEvento = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

interface Props {
  f: FormAviso;
  onChange: (e: CampoEvento) => void;
  tutores: Usuario[];
  vets: Usuario[];
  comDestino: boolean;
}

export default function CamposAviso({ f, onChange, tutores, vets, comDestino }: Props) {
  return (
    <>
      <div className="form-grid">
        <div className="form-group">
          <label>Título</label>
          <input name="titulo" value={f.titulo} onChange={onChange} placeholder="Ex.: Horário especial" />
        </div>

        {comDestino && (
          <div className="form-group">
            <label>Enviar para</label>
            <select name="destino" value={f.destino} onChange={onChange}>
              <option value="geral">Todos</option>
              <option value="tutor">Tutor(a)</option>
              <option value="vet">Veterinário(a)</option>
            </select>
          </div>
        )}

        {comDestino && f.destino === 'tutor' && (
          <div className="form-group">
            <label>Selecionar tutor(a)</label>
            <select name="tutorId" value={f.tutorId} onChange={onChange}>
              <option value="">Selecione</option>
              {tutores.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
        )}

        {comDestino && f.destino === 'vet' && (
          <div className="form-group">
            <label>Selecionar veterinário(a)</label>
            <select name="vetId" value={f.vetId} onChange={onChange}>
              <option value="">Selecione</option>
              {vets.map((v) => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <label>Mensagem</label>
        <textarea name="texto" value={f.texto} onChange={onChange} placeholder="Digite o conteúdo do aviso." />
      </div>
    </>
  );
}