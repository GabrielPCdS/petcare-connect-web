import { useState } from 'react';
import type { Pet, Usuario } from '../../../types';
import { amanhaIso, isoParaBr } from '../../../utils/datas';
import { useHorarios } from './useHorarios';

export interface NovaConsulta {
  petId: number;
  veterinarioId: number;
  data: string;
  hora: string;
}

interface Props {
  pets: Pet[];
  veterinarios: Usuario[];
  onAgendar: (body: NovaConsulta) => Promise<boolean>;
  avisar: (mensagem: string) => void;
}

export default function FormAgendamento({ pets, veterinarios, onAgendar, avisar }: Props) {
  const [petId, setPetId] = useState('');
  const [vetId, setVetId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [versao, setVersao] = useState(0);
  const [enviando, setEnviando] = useState(false);

  const { horarios, carregando } = useHorarios(vetId, data, versao);
  // Se a lista de horários mudar, uma escolha antiga deixa de valer
  const horaValida = horarios.includes(hora) ? hora : '';

  async function agendar() {
    if (!petId || !vetId || !data || !horaValida) {
      avisar('⚠️ Selecione pet, veterinário, data e hora.');
      return;
    }
    if (data < amanhaIso()) {
      avisar('⚠️ Escolha uma data futura válida.');
      return;
    }

    setEnviando(true);
    const ok = await onAgendar({
      petId: Number(petId),
      veterinarioId: Number(vetId),
      data: isoParaBr(data),
      hora: horaValida,
    });
    setEnviando(false);

    if (ok) {
      setVetId('');
      setData('');
      setHora('');
    } else {
      // O horário pode ter sido tomado por outra pessoa: recarrega a lista
      setVersao((v) => v + 1);
    }
  }

  const semEscolha = !vetId || !data;

  return (
    <div className="card form-card">
      <div className="card-title" style={{ marginBottom: 14 }}>Agendar consulta</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Pet</label>
          <select value={petId} onChange={(e) => setPetId(e.target.value)}>
            <option value="">{pets.length ? 'Selecione' : 'Nenhum pet cadastrado'}</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} — {p.tutorNome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Veterinário(a)</label>
          <select value={vetId} onChange={(e) => setVetId(e.target.value)}>
            <option value="">{veterinarios.length ? 'Selecione' : 'Nenhum veterinário ativo'}</option>
            {veterinarios.map((v) => (
              <option key={v.id} value={v.id}>{v.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Data</label>
          <input type="date" min={amanhaIso()} value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Hora</label>
          <select value={horaValida} onChange={(e) => setHora(e.target.value)} disabled={semEscolha || carregando}>
            {semEscolha ? (
              <option value="">Escolha veterinário e data</option>
            ) : carregando ? (
              <option value="">Carregando...</option>
            ) : horarios.length === 0 ? (
              <option value="">Sem horários</option>
            ) : (
              <>
                <option value="">Selecione</option>
                {horarios.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>
      <button className="pbtn pbtn-primary" onClick={agendar} disabled={enviando}>
        {enviando ? 'Agendando...' : '📅 Agendar consulta'}
      </button>
    </div>
  );
}