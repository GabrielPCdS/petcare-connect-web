import type { Pet } from '../types';

interface Props {
  pets: Pet[];
  valor: string;
  onChange: (v: string) => void;
}

export default function SeletorPet({ pets, valor, onChange }: Props) {
  return (
    <div className="form-group">
      <label>Pet</label>
      <select value={valor} onChange={(e) => onChange(e.target.value)}>
        {pets.length ? (
          pets.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)
        ) : (
          <option value="">Nenhum pet vinculado</option>
        )}
      </select>
    </div>
  );
}