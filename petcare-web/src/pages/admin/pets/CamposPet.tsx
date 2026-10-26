import type { ChangeEvent } from 'react';
import type { Usuario } from '../../../types';
import { TIPOS_PET, type FormPet } from './validarPet';

interface Props {
  f: FormPet;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  tutores: Usuario[];
}

export default function CamposPet({ f, onChange, tutores }: Props) {
  return (
    <div className="form-grid">
      <div className="form-group">
        <label>Nome do pet</label>
        <input name="nome" value={f.nome} onChange={onChange} placeholder="Ex.: Luna" />
      </div>
      <div className="form-group">
        <label>Tutor</label>
        <select name="tutorId" value={f.tutorId} onChange={onChange}>
          <option value="">Selecione</option>
          {tutores.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Tipo</label>
        <select name="tipo" value={f.tipo} onChange={onChange}>
          <option value="">Selecione</option>
          {TIPOS_PET.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Raça (opcional)</label>
        <input name="raca" value={f.raca} onChange={onChange} placeholder="Ex.: Labrador" />
      </div>
      <div className="form-group">
        <label>Idade (anos)</label>
        <input name="idade" type="number" min={1} step={1} value={f.idade} onChange={onChange} placeholder="Ex.: 3" />
      </div>
      <div className="form-group">
        <label>Peso (kg)</label>
        <input name="peso" inputMode="decimal" value={f.peso} onChange={onChange} placeholder="Ex.: 4,5" />
      </div>
    </div>
  );
}