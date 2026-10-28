import type { Perfil } from '../types';

export interface UsuarioDb {
  id: number; nome: string; login: string; senha: string; perfil: Perfil;
  email: string; telefone: string; endereco?: string; convenioStatus?: string;
  registro?: string; ativo: boolean;
}
export interface PetDb {
  id: number; nome: string; tipo: string; raca: string; idade: number; peso: number;
  tutorId: number; criadoEm: string;
}
export interface ConsultaDb {
  id: number; petId: number; veterinarioId: number; data: string; hora: string;
  status: string; observacoes: string;
}
export interface VacinaDb {
  id: number; petId: number; nome: string; dataAplicacao: string | null;
  observacao: string; aplicada: boolean;
}
export interface HistoricoDb { id: number; petId: number; descricao: string; dataEvento: string; }
export interface RelatorioDb { id: number; petId: number; texto: string; status: string; atualizacao: string; }
export interface AvisoDb {
  id: number; titulo: string; texto: string; tipo: string; tutorId: number | null;
  petId: number | null; veterinarioId: number | null; autorId: number | null; lidoPor: number[];
}
export interface ResetDb { login: string; expira: number; }

export interface Db {
  usuarios: UsuarioDb[];
  pets: PetDb[];
  consultas: ConsultaDb[];
  vacinas: VacinaDb[];
  historico: HistoricoDb[];
  relatorios: RelatorioDb[];
  avisos: AvisoDb[];
  resets: Record<string, ResetDb>;
}

const CHAVE = 'petcare_mock_db';

const dois = (v: number) => String(v).padStart(2, '0');

export function dataBr(d: Date): string {
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function agoraBr(): string {
  const d = new Date();
  return `${dataBr(d)} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

/** Data de hoje + n dias, em dd/MM/yyyy */
export function diasA(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dataBr(d);
}

export function proximoId(lista: { id: number }[]): number {
  return lista.reduce((maior, x) => Math.max(maior, x.id), 0) + 1;
}

function semente(): Db {
  return {
    usuarios: [
      { id: 1, nome: 'Maria Oliveira', login: 'tutor_teste', senha: 'Tutor123!', perfil: 'Tutor', email: 'maria@exemplo.com', telefone: '(11) 98888-1111', endereco: 'Rua das Flores, 120 - São Paulo', convenioStatus: 'Ativo', ativo: true },
      { id: 2, nome: 'Dr. Carlos Mendes', login: 'vet_teste', senha: 'Vet123!', perfil: 'Veterinario', email: 'carlos@exemplo.com', telefone: '(11) 97777-2222', registro: 'CRMV-SP 12345', ativo: true },
      { id: 3, nome: 'Administrador PetCare', login: 'admin_teste', senha: 'Admin123!', perfil: 'Admin', email: 'admin@exemplo.com', telefone: '', ativo: true },
      { id: 4, nome: 'Dra. Camila Rocha', login: 'vet_camila', senha: 'Vet123!', perfil: 'Veterinario', email: 'camila@exemplo.com', telefone: '(11) 96666-3333', registro: 'CRMV-SP 54321', ativo: true },
      { id: 5, nome: 'João Pereira', login: 'joao_tutor', senha: 'Tutor123!', perfil: 'Tutor', email: 'joao@exemplo.com', telefone: '(11) 95555-4444', endereco: 'Av. Brasil, 900 - São Paulo', convenioStatus: 'Pendente', ativo: true },
    ],
    pets: [
      { id: 1, nome: 'Rex', tipo: 'Cachorro', raca: 'Labrador Retriever', idade: 3, peso: 25.5, tutorId: 1, criadoEm: diasA(-60) },
      { id: 2, nome: 'Mia', tipo: 'Gato', raca: 'Siamês', idade: 2, peso: 4.2, tutorId: 1, criadoEm: diasA(-50) },
      { id: 3, nome: 'Thor', tipo: 'Cachorro', raca: 'Border Collie', idade: 4, peso: 18.3, tutorId: 5, criadoEm: diasA(-40) },
    ],
    consultas: [
      // Rex: amanhã às 08:00. Desmarcar vira "Não compareceu" (RN-005) se faltar menos de 24h
      { id: 1, petId: 1, veterinarioId: 2, data: diasA(1), hora: '08:00', status: 'Marcada', observacoes: 'Consulta de rotina anual' },
      { id: 2, petId: 2, veterinarioId: 2, data: diasA(-10), hora: '10:30', status: 'Realizada', observacoes: 'Exame clínico concluído com sucesso' },
      // Thor: daqui a 5 dias. Desmarcar vira "Cancelada"
      { id: 3, petId: 3, veterinarioId: 4, data: diasA(5), hora: '09:00', status: 'Marcada', observacoes: 'Avaliação de rotina' },
      { id: 4, petId: 3, veterinarioId: 4, data: diasA(-7), hora: '15:00', status: 'Realizada', observacoes: 'Retorno pós-vacina' },
    ],
    vacinas: [
      { id: 1, petId: 1, nome: 'Antirrábica', dataAplicacao: diasA(-120), observacao: 'Dose anual', aplicada: true },
      { id: 2, petId: 1, nome: 'V10 Canina', dataAplicacao: diasA(-90), observacao: 'Reforço anual', aplicada: true },
      { id: 3, petId: 1, nome: 'Giárdia Canina', dataAplicacao: null, observacao: 'Reforço pendente', aplicada: false },
      { id: 4, petId: 2, nome: 'V4 Felina', dataAplicacao: diasA(-100), observacao: 'Primeira dose', aplicada: true },
      { id: 5, petId: 3, nome: 'V10 Canina', dataAplicacao: null, observacao: 'Aguardando agendamento', aplicada: false },
    ],
    historico: [
      { id: 1, petId: 1, descricao: 'Consulta de rotina com pesagem e vermifugação.', dataEvento: diasA(-90) },
      { id: 2, petId: 1, descricao: 'Aplicação da vacina antirrábica preventiva.', dataEvento: diasA(-120) },
      { id: 3, petId: 2, descricao: 'Exame dermatológico e odontológico sem alterações.', dataEvento: diasA(-10) },
      { id: 4, petId: 3, descricao: 'Retorno pós-vacina sem intercorrências.', dataEvento: diasA(-7) },
    ],
    relatorios: [
      { id: 1, petId: 2, texto: 'PARECER CLÍNICO:\nPaciente felino, Siamês, 2 anos, 4.2 kg.\nAusculta cardiopulmonar límpida. Hidratação e reflexos preservados.', status: 'Disponivel', atualizacao: `${diasA(-10)} 11:15` },
    ],
    avisos: [
      { id: 1, titulo: 'Bem-vindo ao PetCare Connect', texto: 'O sistema está ativo! Acompanhe seus pets e consultas com rapidez.', tipo: 'geral', tutorId: null, petId: null, veterinarioId: null, autorId: null, lidoPor: [] },
      { id: 2, titulo: 'Consulta agendada', texto: `Rex foi agendado(a) com Dr. Carlos Mendes para ${diasA(1)} às 08:00.`, tipo: 'consulta', tutorId: 1, petId: 1, veterinarioId: null, autorId: null, lidoPor: [] },
      { id: 3, titulo: 'Reunião de equipe', texto: 'Reunião de alinhamento na sexta, às 17h.', tipo: 'vet', tutorId: null, petId: null, veterinarioId: 2, autorId: 3, lidoPor: [] },
    ],
    resets: {},
  };
}

export function salvarDb(db: Db): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(db));
  } catch {
    /* sem espaço ou bloqueado: segue sem persistir */
  }
}

export function carregarDb(): Db {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* dado corrompido: recria abaixo */
  }
  const db = semente();
  salvarDb(db);
  return db;
}

export function resetarDb(): void {
  localStorage.removeItem(CHAVE);
}