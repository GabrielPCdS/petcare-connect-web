import { useState } from 'react';
import PainelLayout from '../../components/PainelLayout';
import { useAdminData } from './useAdminData';
import Inicio from './secoes/Inicio';
import Usuarios from './secoes/Usuarios';

type Aba = 'inicio' | 'usuarios';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'inicio', rotulo: '🏠 Início' },
  { id: 'usuarios', rotulo: '👤 Usuários' },
];

export default function AdminPage() {
  const { dados, loading, erro, recarregar } = useAdminData();
  const [aba, setAba] = useState<Aba>('inicio');
  const [toast, setToast] = useState('');

  function avisar(mensagem: string) {
    setToast(mensagem);
    window.setTimeout(() => setToast(''), 2400);
  }

  const totalUsuarios = dados.usuarios.filter((u) => u.perfil !== 'Admin').length;
  const comuns = { dados, recarregar, avisar };

  return (
    <PainelLayout titulo="Painel Administrativo">
      <div className="stats-row">
        <div className="stat-card"><span className="sc-label">👤 Usuários</span><span className="sc-num">{totalUsuarios}</span></div>
        <div className="stat-card"><span className="sc-label">🐾 Pets</span><span className="sc-num">{dados.pets.length}</span></div>
        <div className="stat-card"><span className="sc-label">📅 Consultas</span><span className="sc-num">{dados.consultas.length}</span></div>
        <div className="stat-card"><span className="sc-label">📄 Relatórios</span><span className="sc-num">{dados.relatorios.length}</span></div>
        <div className="stat-card"><span className="sc-label">📢 Avisos</span><span className="sc-num">{dados.avisos.length}</span></div>
      </div>

      <div className="tabs">
        {ABAS.map((a) => (
          <button key={a.id} className={`tab ${aba === a.id ? 'active' : ''}`} onClick={() => setAba(a.id)}>
            {a.rotulo}
          </button>
        ))}
      </div>

      {loading && <p>Carregando...</p>}
      {erro && <div className="msg error">❌ {erro}</div>}

      {!loading && !erro && (
        <>
          {aba === 'inicio' && <Inicio dados={dados} />}
          {aba === 'usuarios' && <Usuarios {...comuns} />}
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </PainelLayout>
  );
}