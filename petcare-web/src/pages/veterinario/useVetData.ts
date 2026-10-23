import { useCallback, useEffect, useState } from 'react';
import { clinicaApi } from '../../api/clinica';
import { getErro } from '../../api/http';
import { useAuth } from '../../contexts/AuthContext';
import type { Aviso, Consulta, Historico, Pet, Relatorio, Vacina } from '../../types';

export interface DadosVet {
  consultas: Consulta[];
  pets: Pet[];
  vacinas: Vacina[];
  historico: Historico[];
  relatorios: Relatorio[];
  avisos: Aviso[];
}

export interface SecaoProps {
  dados: DadosVet;
  recarregar: () => Promise<void>;
  avisar: (mensagem: string) => void;
}

const VAZIO: DadosVet = { consultas: [], pets: [], vacinas: [], historico: [], relatorios: [], avisos: [] };

export function useVetData() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState<DadosVet>(VAZIO);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const recarregar = useCallback(async () => {
    try {
      const [rc, rp, rr, ra] = await Promise.all([
        clinicaApi.consultas(), clinicaApi.pets(), clinicaApi.relatorios(), clinicaApi.avisos(),
      ]);

      // O backend deve filtrar pelo token; aqui é uma segunda trava
      const minhas = (rc.dados ?? []).filter((c) => c.veterinarioId === usuario?.usuarioId);
      const idsPets = [...new Set(minhas.map((c) => c.petId))];

      const [vac, his] = await Promise.all([
        Promise.all(idsPets.map((id) => clinicaApi.vacinas(id))),
        Promise.all(idsPets.map((id) => clinicaApi.historico(id))),
      ]);

      setDados({
        consultas: minhas,
        pets: (rp.dados ?? []).filter((p) => idsPets.includes(p.id)),
        vacinas: vac.flatMap((r) => r.dados ?? []),
        historico: his.flatMap((r) => r.dados ?? []),
        relatorios: (rr.dados ?? []).filter((r) => idsPets.includes(r.petId)),
        avisos: ra.dados ?? [],
      });
      setErro('');
    } catch (e) {
      setErro(getErro(e));
    } finally {
      setLoading(false);
    }
  }, [usuario?.usuarioId]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { dados, loading, erro, recarregar };
}