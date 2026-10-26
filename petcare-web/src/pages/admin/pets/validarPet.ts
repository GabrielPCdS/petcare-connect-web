import type { NovoPet } from '../../../api/admin';

export interface FormPet {
  nome: string;
  tutorId: string;
  tipo: string;
  raca: string;
  idade: string;
  peso: string;
}

export const FORM_PET_VAZIO: FormPet = { nome: '', tutorId: '', tipo: '', raca: '', idade: '', peso: '' };

export const TIPOS_PET = ['Cachorro', 'Gato', 'Pássaro', 'Coelho', 'Hamster', 'Outro'];

export type ResultadoPet = { erro: string } | { pet: NovoPet };

export function validarPet(f: FormPet): ResultadoPet {
  if (!f.nome.trim() || !f.tutorId || !f.tipo || !f.idade.trim() || !f.peso.trim()) {
    return { erro: '⚠️ Preencha nome, tutor, tipo, idade e peso do pet.' };
  }

  const idade = Number(f.idade);
  if (!Number.isInteger(idade) || idade <= 0) {
    return { erro: '⚠️ A idade deve ser um número inteiro maior que 0.' };
  }

  const peso = Number(f.peso.replace(',', '.'));
  if (Number.isNaN(peso)) return { erro: '⚠️ Informe um peso válido. Ex.: 4,5' };
  if (peso <= 0) return { erro: '⚠️ O peso deve ser maior que 0.' };

  return {
    pet: {
      nome: f.nome.trim(),
      tutorId: Number(f.tutorId),
      tipo: f.tipo,
      raca: f.raca.trim(),
      idade,
      peso,
    },
  };
}