import { useEffect, useState } from 'react';
import { clinicaApi } from '../../../api/clinica';
import { isoParaBr } from '../../../utils/datas';

export function useHorarios(veterinarioId: string, dataIso: string, versao: number) {
  const chave = `${veterinarioId}|${dataIso}|${versao}`;
  const [resultado, setResultado] = useState<{ chave: string; lista: string[] }>({ chave: '', lista: [] });

  useEffect(() => {
    if (!veterinarioId || !dataIso) return;
    let cancelado = false;
    clinicaApi
      .horariosDisponiveis(Number(veterinarioId), isoParaBr(dataIso))
      .then((r) => {
        if (!cancelado) setResultado({ chave, lista: r.dados ?? [] });
      })
      .catch(() => {
        if (!cancelado) setResultado({ chave, lista: [] });
      });
    return () => {
      cancelado = true;
    };
  }, [chave, veterinarioId, dataIso]);

  const pronto = Boolean(veterinarioId && dataIso);
  const carregando = pronto && resultado.chave !== chave;
  const horarios = pronto && !carregando ? resultado.lista : [];

  return { horarios, carregando };
}