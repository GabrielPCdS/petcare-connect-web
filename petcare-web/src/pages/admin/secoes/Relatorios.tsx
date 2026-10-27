import Vazio from '../../../components/Vazio';
import type { SecaoAdminProps } from '../useAdminData';

type Props = Pick<SecaoAdminProps, 'dados'>;

export default function Relatorios({ dados }: Props) {
  const pets = [...dados.pets].sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <section>
      <div className="page-header">
        <h3>Acesso total aos relatórios</h3>
        <p>Visualize todos os relatórios emitidos no sistema para todos os pets cadastrados.</p>
      </div>

      {pets.length === 0 ? (
        <Vazio icone="📄" texto="Nenhum relatório disponível." />
      ) : (
        <div className="cards-grid">
          {pets.map((p) => {
            const rel = dados.relatorios.find((r) => r.petId === p.id);
            return (
              <div className="card" key={p.id}>
                <div className="card-header">
                  <div className="card-title">Relatório — {p.nome}</div>
                  <span className={`tag ${rel ? 'tag-green' : 'tag-yellow'}`}>{rel ? 'Disponível' : 'Pendente'}</span>
                </div>
                <p className="card-sub">Tutor: <strong>{p.tutorNome}</strong></p>
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