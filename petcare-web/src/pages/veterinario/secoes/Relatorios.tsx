import { useState } from 'react';
import { clinicaApi } from '../../../api/clinica';
import { getErro } from '../../../api/http';
import SeletorPet from '../../../components/SeletorPet';
import Vazio from '../../../components/Vazio';
import type { SecaoProps } from '../useVetData';

export default function Relatorios({ dados, recarregar, avisar }: SecaoProps) {
  const [petId, setPetId] = useState(String(dados.pets[0]?.id ?? ''));
  const [texto, setTexto] = useState('');

  async function salvar() {
    if (!petId || !texto.trim()) {
      avisar('⚠️ Selecione o pet e escreva o relatório.');
      return;
    }
    try {
      const r = await clinicaApi.salvarRelatorio(Number(petId), texto.trim());
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível salvar o relatório.'));
        return;
      }
      setTexto('');
      await recarregar();
      avisar('✅ Relatório salvo com sucesso.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  return (
    <section>
      <div className="page-header">
        <h3>Emitir relatório clínico</h3>
        <p>Crie ou atualize o relatório consolidado do pet, que o tutor poderá consultar.</p>
      </div>

      <div className="card form-card">
        <div className="form-grid">
          <SeletorPet pets={dados.pets} valor={petId} onChange={setPetId} />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Texto do relatório</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex.: paciente em acompanhamento, evolução estável, sem sinais de agravamento." />
        </div>
        <button className="pbtn pbtn-primary" onClick={salvar}>📄 Salvar relatório</button>
      </div>

      {dados.pets.length === 0 ? (
        <Vazio icone="📄" texto="Nenhum relatório disponível." />
      ) : (
        <div className="cards-grid">
          {dados.pets.map((p) => {
            const rel = dados.relatorios.find((r) => r.petId === p.id);
            return (
              <div className="card" key={p.id}>
                <div className="card-header">
                  <div className="card-title">Relatório — {p.nome}</div>
                  <span className={`tag ${rel ? 'tag-green' : 'tag-yellow'}`}>{rel ? 'Disponível' : 'Pendente'}</span>
                </div>
                <p className="card-sub" style={{ whiteSpace: 'pre-wrap' }}>
                  {rel?.texto ?? 'Sem relatório disponível para este pet.'}
                </p>
                <span className="tag tag-navy">Última atualização: {rel?.atualizacao ?? 'sem data'}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}