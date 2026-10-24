import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { clinicaApi } from '../../api/clinica';
import { getErro } from '../../api/http';
import type { Aviso, Consulta, Pet, Relatorio, Usuario } from '../../types';

export interface DadosAdmin {
  usuarios: Usuario[];
  pets: Pet[];
  consultas: Consulta[];
  relatorios: Relatorio[];
  avisos: Aviso[];
}

export interface SecaoAdminProps {
  dados: DadosAdmin;
  recarregar: () => Promise<void>;
  avisar: (mensagem: string) => void;
}

const VAZIO: DadosAdmin = { usuarios: [], pets: [], consultas: [], relatorios: [], avisos: [] };

export function useAdminData() {
  const [dados, setDados] = useState<DadosAdmin>(VAZIO);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const recarregar = useCallback(async () => {
    try {
      const [ru, rp, rc, rr, ra] = await Promise.all([
        adminApi.usuarios(), clinicaApi.pets(), clinicaApi.consultas(),
        clinicaApi.relatorios(), clinicaApi.avisos(),
      ]);
      setDados({
        usuarios: ru.dados ?? [],
        pets: rp.dados ?? [],
        consultas: rc.dados ?? [],
        relatorios: rr.dados ?? [],
        avisos: ra.dados ?? [],
      });
      setErro('');
    } catch (e) {
      setErro(getErro(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { dados, loading, erro, recarregar };
}