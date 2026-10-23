import { useState } from 'react';
import PainelLayout from '../../components/PainelLayout';
import { useVetData } from './useVetData';
import Agenda from './secoes/Agenda';
import Atendimento from './secoes/Atendimento';
import Vacinas from './secoes/Vacinas';
import Historico from './secoes/Historico';
import Relatorios from './secoes/Relatorios';
import AvisosTutor from './secoes/AvisosTutor';
import AvisosRecebidos from './secoes/AvisosRecebidos';

type Aba = 'agenda' | 'atendimento' | 'vacinas' | 'historico' | 'relatorios' | 'avisosTutor' | 'avisos';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'agenda', rotulo: '📅 Agenda' },
  { id: 'atendimento', rotulo: '🩺 Atendimento' },
  { id: 'vacinas', rotulo: '💉 Vacinas' },
  { id: 'historico', rotulo: '📋 Histórico' },
  { id: 'relatorios', rotulo: '📄 Relatórios' },
  { id: 'avisosTutor', rotulo: '📢 Avisos aos tutores' },
  { id: 'avisos', rotulo: '🔔 Avisos' },
];

export default function VeterinarioPage() {
  const { dados, loading, erro, recarregar } = useVetData();
  const [aba, setAba] = useState<Aba>('agenda');
  const [petAtendimento, setPetAtendimento] = useState<number | undefined>();
  const [toast, setToast] = useState('');

  function avisar(mensagem: string) {
    setToast(mensagem);
    window.setTimeout(() => setToast(''), 2400);
  }

  function irParaAtendimento(petId: number) {
    setPetAtendimento(petId);
    setAba('atendimento');
  }

  const marcadas = dados.consultas.filter((c) => c.status === 'Marcada').length;
  const realizadas = dados.consultas.filter((c) => c.status === 'Realizada').length;
  const vacinasAplicadas = dados.vacinas.filter((v) => v.aplicada).length;
  const naoLidos = dados.avisos.filter((a) => a.tutorId === null && !a.lido).length;

  const comuns = { dados, recarregar, avisar };

  return (
    <PainelLayout titulo="Portal do Veterinário">
      <div className="stats-row">
        <div className="stat-card"><span className="sc-label">📅 Consultas marcadas</span><span className="sc-num">{marcadas}</span></div>
        <div className="stat-card"><span className="sc-label">✅ Consultas realizadas</span><span className="sc-num">{realizadas}</span></div>
        <div className="stat-card"><span className="sc-label">💉 Vacinas registradas</span><span className="sc-num">{vacinasAplicadas}</span></div>
        <div className="stat-card"><span className="sc-label">📄 Relatórios emitidos</span><span className="sc-num">{dados.relatorios.length}</span></div>
      </div>

      <div className="tabs">
        {ABAS.map((a) => (
          <button key={a.id} className={`tab ${aba === a.id ? 'active' : ''}`} onClick={() => setAba(a.id)}>
            {a.rotulo}
            {a.id === 'avisos' && naoLidos > 0 && <span className="badge">{naoLidos}</span>}
          </button>
        ))}
      </div>

      {loading && <p>Carregando...</p>}
      {erro && <div className="msg error">❌ {erro}</div>}

      {!loading && !erro && (
        <>
          {aba === 'agenda' && <Agenda {...comuns} irParaAtendimento={irParaAtendimento} />}
          {aba === 'atendimento' && (
            <Atendimento key={petAtendimento ?? 'novo'} petInicial={petAtendimento} {...comuns} />
          )}
          {aba === 'vacinas' && <Vacinas {...comuns} />}
          {aba === 'historico' && <Historico dados={dados} />}
          {aba === 'relatorios' && <Relatorios {...comuns} />}
          {aba === 'avisosTutor' && <AvisosTutor {...comuns} />}
          {aba === 'avisos' && <AvisosRecebidos {...comuns} />}
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </PainelLayout>
  );
}