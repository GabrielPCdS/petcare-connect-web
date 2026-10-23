import { clinicaApi } from '../../../api/clinica';
import { getErro } from '../../../api/http';
import Vazio from '../../../components/Vazio';
import type { SecaoProps } from '../useVetData';

export default function AvisosRecebidos({ dados, recarregar, avisar }: SecaoProps) {
  const recebidos = dados.avisos.filter((a) => a.tutorId === null);

  async function marcarLido(id: number) {
    try {
      await clinicaApi.marcarAvisoLido(id);
      await recarregar();
    } catch (e) {
      avisar('❌ ' + getErro(e));
    }
  }

  return (
    <section>
      <div className="page-header">
        <h3>Avisos recentes</h3>
        <p>Comunicados da clínica e do sistema.</p>
      </div>

      {recebidos.length === 0 ? (
        <Vazio icone="🔔" texto="Nenhum aviso publicado." />
      ) : (
        <div className="cards-grid">
          {recebidos.map((a) => (
            <div className={`card aviso ${a.lido ? '' : 'unread'}`} key={a.id}>
              <div className="card-title">{a.titulo}</div>
              <p className="card-sub">{a.texto}</p>
              {!a.lido && (
                <button className="pbtn pbtn-secondary pbtn-sm" onClick={() => marcarLido(a.id)}>
                  Marcar como lido
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}