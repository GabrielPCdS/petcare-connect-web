import type { SecaoAdminProps } from '../useAdminData';

type Props = Pick<SecaoAdminProps, 'dados'>;

export default function Inicio({ dados }: Props) {
  const tutores = dados.usuarios.filter((u) => u.perfil === 'Tutor').length;
  const vets = dados.usuarios.filter((u) => u.perfil === 'Veterinario').length;
  const porStatus = (s: string) => dados.consultas.filter((c) => c.status === s).length;

  return (
    <section>
      <div className="page-header">
        <h3>Painel administrativo</h3>
        <p>Área central de gerenciamento do sistema PetCare Connect.</p>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Usuários</div>
            <span className="tag tag-green">Administrador</span>
          </div>
          <p className="card-sub">
            Tutores: <strong>{tutores}</strong><br />
            Veterinários: <strong>{vets}</strong><br />
            Pets cadastrados: <strong>{dados.pets.length}</strong>
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Consultas por status</div>
            <span className="tag tag-navy">{dados.consultas.length} no total</span>
          </div>
          <p className="card-sub">
            📅 Marcadas: <strong>{porStatus('Marcada')}</strong><br />
            ✅ Realizadas: <strong>{porStatus('Realizada')}</strong><br />
            ❌ Canceladas: <strong>{porStatus('Cancelada')}</strong><br />
            ⚠️ Não compareceu: <strong>{porStatus('NaoCompareceu')}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}