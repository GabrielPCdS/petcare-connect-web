import Vazio from '../../../components/Vazio';
import type { SecaoProps } from '../useVetData';

type Props = Pick<SecaoProps, 'dados'>;

export default function Historico({ dados }: Props) {
  return (
    <section>
      <div className="page-header">
        <h3>Histórico clínico</h3>
        <p>Linha do tempo dos atendimentos dos pets da sua agenda.</p>
      </div>

      {dados.pets.length === 0 ? (
        <Vazio icone="📋" texto="Nenhum histórico disponível." />
      ) : (
        <div className="cards-grid">
          {dados.pets.map((p) => {
            const itens = dados.historico.filter((h) => h.petId === p.id);
            return (
              <div className="card" key={p.id}>
                <div className="card-header">
                  <div className="card-title">{p.nome}</div>
                  <span className="tag tag-navy">Prontuário</span>
                </div>
                {itens.length === 0 ? (
                  <p className="card-sub">Sem histórico clínico registrado.</p>
                ) : (
                  itens.map((h) => (
                    <div className="tl-item" key={h.id}>
                      <div className="tl-date">{h.dataEvento}</div>
                      <div className="card-sub">{h.descricao}</div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}