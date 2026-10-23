import { useState } from 'react';
import { clinicaApi } from '../../../api/clinica';
import { getErro } from '../../../api/http';
import SeletorPet from '../../../components/SeletorPet';
import Vazio from '../../../components/Vazio';
import { hojeIso, isoParaBr } from '../../../utils/datas';
import type { Vacina } from '../../../types';
import type { SecaoProps } from '../useVetData';

export default function Vacinas({ dados, recarregar, avisar }: SecaoProps) {
  const [petId, setPetId] = useState(String(dados.pets[0]?.id ?? ''));
  const [nome, setNome] = useState('');
  const [data, setData] = useState(hojeIso());
  const [obs, setObs] = useState('');

  async function registrar() {
    if (!petId || !nome.trim() || !data) {
      avisar('⚠️ Preencha pet, nome da vacina e data.');
      return;
    }
    try {
      const r = await clinicaApi.criarVacina({
        petId: Number(petId), nome: nome.trim(), dataAplicacao: isoParaBr(data),
        observacao: obs.trim(), aplicada: true,
      });
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível registrar.'));
        return;
      }
      setNome('');
      setObs('');
      await recarregar();
      avisar('✅ Vacina registrada com sucesso.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  async function aplicar(v: Vacina) {
    try {
      const r = await clinicaApi.aplicarVacina(v.id, isoParaBr(hojeIso()));
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível atualizar.'));
        return;
      }
      await recarregar();
      avisar('✅ Vacina marcada como aplicada.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  return (
    <section>
      <div className="page-header">
        <h3>Registrar vacinas</h3>
        <p>Registre vacinas aplicadas e acompanhe a carteira dos pets atendidos por você.</p>
      </div>

      <div className="card form-card">
        <div className="form-grid">
          <SeletorPet pets={dados.pets} valor={petId} onChange={setPetId} />
          <div className="form-group">
            <label>Nome da vacina</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: V10" />
          </div>
          <div className="form-group">
            <label>Data de aplicação</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Observação</label>
            <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: reforço em 30 dias" />
          </div>
        </div>
        <button className="pbtn pbtn-primary" onClick={registrar}>💉 Registrar vacina</button>
      </div>

      {dados.pets.length === 0 ? (
        <Vazio icone="💉" texto="Nenhum pet disponível para exibir vacinas." />
      ) : (
        <div className="cards-grid">
          {dados.pets.map((p) => {
            const vacinas = dados.vacinas.filter((v) => v.petId === p.id);
            const aplicadas = vacinas.filter((v) => v.aplicada).length;
            return (
              <div className="card" key={p.id}>
                <div className="card-header">
                  <div className="card-title">{p.nome}</div>
                  <span className="tag tag-green">{aplicadas} registradas</span>
                </div>
                <p className="card-sub">{p.tipo} • Tutor: {p.tutorNome}</p>
                {vacinas.length === 0 && <p className="card-sub">Nenhuma vacina registrada até o momento.</p>}
                {vacinas.map((v) => (
                  <p className="card-sub" key={v.id}>
                    • <strong>{v.nome}</strong> — {v.aplicada ? v.dataAplicacao : 'pendente'}
                    {v.observacao ? ` (${v.observacao})` : ''}
                    {!v.aplicada && (
                      <button className="pbtn pbtn-secondary pbtn-sm" style={{ marginLeft: 8 }} onClick={() => aplicar(v)}>
                        Marcar como aplicada
                      </button>
                    )}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}