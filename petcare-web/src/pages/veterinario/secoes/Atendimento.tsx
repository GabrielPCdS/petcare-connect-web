import { useState } from 'react';
import { clinicaApi } from '../../../api/clinica';
import { getErro } from '../../../api/http';
import SeletorPet from '../../../components/SeletorPet';
import { hojeIso, isoParaBr } from '../../../utils/datas';
import type { SecaoProps } from '../useVetData';

interface Props extends SecaoProps {
  petInicial?: number;
}

export default function Atendimento({ dados, recarregar, avisar, petInicial }: Props) {
  const [petId, setPetId] = useState(String(petInicial ?? dados.pets[0]?.id ?? ''));
  const [data, setData] = useState(hojeIso());
  const [texto, setTexto] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!petId || !data || !texto.trim()) {
      avisar('⚠️ Preencha pet, data e descrição do atendimento.');
      return;
    }
    setSalvando(true);
    try {
      const r = await clinicaApi.adicionarHistorico({
        petId: Number(petId), descricao: texto.trim(), dataEvento: isoParaBr(data),
      });
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível salvar.'));
        return;
      }
      setTexto('');
      await recarregar();
      avisar('✅ Atendimento registrado com sucesso.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <h3>Registrar atendimento</h3>
        <p>Registre a evolução clínica no histórico do pet: sintomas, avaliação e conduta.</p>
      </div>

      <div className="card form-card">
        <div className="form-grid">
          <SeletorPet pets={dados.pets} valor={petId} onChange={setPetId} />
          <div className="form-group">
            <label>Data do atendimento</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Evolução clínica / atendimento</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex.: paciente com melhora clínica, sem febre, hidratado e com bom apetite." />
        </div>
        <div className="card-actions">
          <button className="pbtn pbtn-primary" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : '✓ Salvar atendimento'}
          </button>
          <button className="pbtn pbtn-secondary" onClick={() => setTexto('')}>Limpar</button>
        </div>
      </div>
    </section>
  );
}