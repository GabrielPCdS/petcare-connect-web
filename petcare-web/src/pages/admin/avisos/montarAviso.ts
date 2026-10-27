import type { CorpoAviso } from '../../../api/admin';

export type Destino = 'geral' | 'tutor' | 'vet';

export interface FormAviso {
  titulo: string;
  texto: string;
  destino: Destino;
  tutorId: string;
  vetId: string;
}

export const FORM_AVISO_VAZIO: FormAviso = { titulo: '', texto: '', destino: 'geral', tutorId: '', vetId: '' };

export type ResultadoAviso = { erro: string } | { corpo: CorpoAviso };

export function montarAviso(f: FormAviso): ResultadoAviso {
  if (!f.titulo.trim() || !f.texto.trim()) {
    return { erro: '⚠️ Preencha ao menos título e mensagem.' };
  }
  if (f.destino === 'tutor' && !f.tutorId) {
    return { erro: '⚠️ Selecione o tutor(a) que receberá o aviso.' };
  }
  if (f.destino === 'vet' && !f.vetId) {
    return { erro: '⚠️ Selecione o veterinário(a) que receberá o aviso.' };
  }

  return {
    corpo: {
      titulo: f.titulo.trim(),
      texto: f.texto.trim(),
      tipo: f.destino,
      tutorId: f.destino === 'tutor' ? Number(f.tutorId) : null,
      veterinarioId: f.destino === 'vet' ? Number(f.vetId) : null,
      petId: null,
    },
  };
}