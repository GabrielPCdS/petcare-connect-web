import { useState } from 'react';
import { clinicaApi } from '../../../api/clinica';
import { getErro } from '../../../api/http';
import Vazio from '../../../components/Vazio';
import type { Consulta, StatusConsulta } from '../../../types';
import { timestamp } from '../../../utils/datas';
import { ROTULO_STATUS, TAG_STATUS } from '../../../utils/statusConsulta';
import FormAgendamento, { type NovaConsulta } from '../consultas/FormAgendamento';
import type { SecaoAdminProps } from '../useAdminData';

type Filtro = 'Todas' | StatusConsulta;

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'Todas', rotulo: 'Todas' },
  { valor: 'Marcada', rotulo: 'Marcadas' },
  { valor: 'Realizada', rotulo: 'Realizadas' },
  { valor: 'Cancelada', rotulo: 'Canceladas' },
  { valor: 'NaoCompareceu', rotulo: 'Não compareceu' },
];

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export default function Consultas({ dados, recarregar, avisar }: SecaoAdminProps) {
  const [filtro, setFiltro] = useState<Filtro>('Todas');

  const veterinarios = dados.usuarios.filter((u) => u.perfil === 'Veterinario' && u.ativo);
  const tutorDe = (petId: number) => dados.pets.find((p) => p.id === petId)?.tutorNome ?? '-';

  const lista = dados.consultas
    .filter((c) => filtro === 'Todas' || c.status === filtro)
    .sort((a, b) => {
      const am = a.status === 'Marcada';
      const bm = b.status === 'Marcada';
      if (am !== bm) return am ? -1 : 1;
      return timestamp(a.data, a.hora) - timestamp(b.data, b.hora);
    });

  async function agendar(body: NovaConsulta): Promise<boolean> {
    try {
      const r = await clinicaApi.criarConsulta(body);
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível agendar a consulta.'));
        return false;
      }
      await recarregar();
      avisar('✅ Consulta agendada com sucesso.');
      return true;
    } catch (e) {
      avisar('❌ ' + getErro(e));
      return false;
    }
  }

  async function concluir(c: Consulta) {
    if (!window.confirm(`Marcar a consulta de ${c.petNome} em ${c.data} às ${c.hora} como realizada?`)) return;
    try {
      const r = await clinicaApi.atualizarStatus(c.id, 'Realizada');
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível concluir a consulta.'));
        return;
      }
      await recarregar();
      avisar('✅ Consulta marcada como realizada.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  async function desmarcar(c: Consulta) {
    const faltam = timestamp(c.data, c.hora) - Date.now();
    const aviso =
      faltam < UM_DIA_MS
        ? '\n\nFaltam menos de 24h: ela será registrada como "Não compareceu" (Regra RN-005).'
        : '';
    if (!window.confirm(`Desmarcar a consulta de ${c.petNome} em ${c.data} às ${c.hora}?${aviso}`)) return;
    try {
      const r = await clinicaApi.cancelarConsulta(c.id);
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível desmarcar a consulta.'));
        return;
      }
      await recarregar();
      avisar('✅ Consulta desmarcada com sucesso.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  return (
    <section>
      <div className="page-header">
        <h3>Gerenciar consultas</h3>
        <p>Agende, conclua ou desmarque consultas da clínica.</p>
      </div>

      <FormAgendamento pets={dados.pets} veterinarios={veterinarios} onAgendar={agendar} avisar={avisar} />

      <div className="form-group" style={{ maxWidth: 240, marginBottom: 16 }}>
        <label>Filtrar por status</label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)}>
          {FILTROS.map((f) => (
            <option key={f.valor} value={f.valor}>{f.rotulo}</option>
          ))}
        </select>
      </div>

      {lista.length === 0 ? (
        <Vazio icone="📅" texto="Nenhuma consulta encontrada." />
      ) : (
        <div className="cards-grid">
          {lista.map((c) => (
            <div className="card" key={c.id}>
              <div className="card-header">
                <div className="card-title">{c.petNome} — {c.data} às {c.hora}</div>
                <span className={`tag ${TAG_STATUS[c.status] ?? 'tag-navy'}`}>
                  {ROTULO_STATUS[c.status] ?? c.status}
                </span>
              </div>
              <p className="card-sub">
                Veterinário: <strong>{c.vetNome}</strong><br />
                Tutor: <strong>{tutorDe(c.petId)}</strong>
                {c.observacoes && <><br />{c.observacoes}</>}
              </p>
              {c.status === 'Marcada' && (
                <div className="card-actions">
                  <button className="pbtn pbtn-primary pbtn-sm" onClick={() => concluir(c)}>✓ Concluir</button>
                  <button className="pbtn pbtn-secondary pbtn-sm" onClick={() => desmarcar(c)}>🗑 Desmarcar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}