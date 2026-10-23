import { useState } from 'react';
import { clinicaApi } from '../../../api/clinica';
import { getErro } from '../../../api/http';
import SeletorPet from '../../../components/SeletorPet';
import Vazio from '../../../components/Vazio';
import type { SecaoProps } from '../useVetData';

export default function AvisosTutor({ dados, recarregar, avisar }: SecaoProps) {
  const [petId, setPetId] = useState(String(dados.pets[0]?.id ?? ''));
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');

  const enviados = dados.avisos.filter((a) => a.tutorId !== null);

  async function enviar() {
    const pet = dados.pets.find((p) => p.id === Number(petId));
    if (!pet || !titulo.trim() || !texto.trim()) {
      avisar('⚠️ Preencha pet, título e mensagem.');
      return;
    }
    try {
      const r = await clinicaApi.criarAviso({
        titulo: titulo.trim(), texto: texto.trim(), tipo: 'pet', tutorId: pet.tutorId, petId: pet.id,
      });
      if (!r.sucesso) {
        avisar('❌ ' + (r.mensagem ?? 'Não foi possível enviar o aviso.'));
        return;
      }
      setTitulo('');
      setTexto('');
      await recarregar();
      avisar('✅ Aviso enviado ao tutor.');
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  return (
    <section>
      <div className="page-header">
        <h3>Enviar avisos aos tutores</h3>
        <p>O aviso fica visível apenas para o tutor do pet escolhido, no aplicativo.</p>
      </div>

      <div className="card form-card">
        <div className="form-grid">
          <SeletorPet pets={dados.pets} valor={petId} onChange={setPetId} />
          <div className="form-group">
            <label>Título do aviso</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Orientação pós-consulta" />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Mensagem</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite a mensagem que o tutor deverá receber." />
        </div>
        <button className="pbtn pbtn-primary" onClick={enviar}>📢 Enviar aviso</button>
      </div>

      {enviados.length === 0 ? (
        <Vazio icone="📢" texto="Nenhum aviso enviado aos tutores até o momento." />
      ) : (
        <div className="cards-grid">
          {enviados.map((a) => {
            const pet = dados.pets.find((p) => p.id === a.petId);
            return (
              <div className="card" key={a.id}>
                <div className="card-header">
                  <div className="card-title">{a.titulo}</div>
                  <span className="tag tag-green">Tutor</span>
                </div>
                <p className="card-sub">
                  Tutor: <strong>{pet?.tutorNome ?? '-'}</strong><br />
                  Pet: <strong>{pet?.nome ?? '-'}</strong><br />
                  {a.texto}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}