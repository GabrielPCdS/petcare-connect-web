import { clinicaApi } from '../../../api/clinica';
import { getErro } from '../../../api/http';
import Vazio from '../../../components/Vazio';
import { timestamp } from '../../../utils/datas';
import type { Consulta } from '../../../types';
import type { SecaoProps } from '../useVetData';

const TAG: Record<string, string> = {
  Marcada: 'tag-green', Realizada: 'tag-navy', Cancelada: 'tag-yellow', NaoCompareceu: 'tag-red',
};
const ROTULO: Record<string, string> = { NaoCompareceu: 'Não compareceu' };

interface Props extends SecaoProps {
  irParaAtendimento: (petId: number) => void;
}

export default function Agenda({ dados, recarregar, avisar, irParaAtendimento }: Props) {
  const ordenadas = [...dados.consultas].sort((a, b) => {
    const am = a.status === 'Marcada';
    const bm = b.status === 'Marcada';
    if (am !== bm) return am ? -1 : 1;
    return timestamp(a.data, a.hora) - timestamp(b.data, b.hora);
  });

  const tutorDe = (petId: number) => dados.pets.find((p) => p.id === petId)?.tutorNome ?? '-';

  async function concluir(c: Consulta) {
    if (!window.confirm(`Marcar a consulta de ${c.petNome} em ${c.data} às ${c.hora} como realizada?`)) return;
    try {
      const r = await clinicaApi.atualizarStatus(c.id, 'Realizada');
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível concluir a consulta.'));
        return;
      }
      await recarregar();
      avisar('✅ Consulta concluída.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  return (
    <section>
      <div className="page-header">
        <h3>Agenda de consultas</h3>
        <p>Consultas vinculadas a você. Conclua o atendimento quando terminar.</p>
      </div>

      {ordenadas.length === 0 ? (
        <Vazio icone="📅" texto="Nenhuma consulta vinculada a você." />
      ) : (
        <div className="cards-grid">
          {ordenadas.map((c) => (
            <div className="card" key={c.id}>
              <div className="card-header">
                <div className="card-title">{c.petNome} — {c.data} às {c.hora}</div>
                <span className={`tag ${TAG[c.status] ?? 'tag-navy'}`}>{ROTULO[c.status] ?? c.status}</span>
              </div>
              <p className="card-sub">
                Tutor: <strong>{tutorDe(c.petId)}</strong>
                {c.observacoes && <><br />{c.observacoes}</>}
              </p>
              {c.status === 'Marcada' && (
                <div className="card-actions">
                  <button className="pbtn pbtn-secondary pbtn-sm" onClick={() => irParaAtendimento(c.petId)}>
                    🩺 Iniciar atendimento
                  </button>
                  <button className="pbtn pbtn-primary pbtn-sm" onClick={() => concluir(c)}>
                    ✓ Concluir consulta
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}