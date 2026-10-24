export type Perfil = 'Tutor' | 'Veterinario' | 'Admin';

export interface ApiResponse<T = null> {
  sucesso: boolean;
  mensagem?: string;
  dados: T;
}

export interface LoginRequest {
  login: string;
  senha: string;
  perfil?: Perfil;
}

export interface LoginResponse {
  token: string;
  usuarioId: number;
  nome: string;
  login: string;
  perfil: Perfil;
}

export interface CadastroRequest {
  nome: string;
  login: string;
  email: string;
  senha: string;
  perfil: 'Tutor';
}

export interface Mensagem {
  tipo: 'error' | 'success';
  texto: string;
}

export type StatusConsulta = 'Marcada' | 'Realizada' | 'Cancelada' | 'NaoCompareceu';

export interface Pet {
  id: number; nome: string; tipo: string; raca?: string;
  idade?: number; peso?: number; tutorId: number; tutorNome: string;
}
export interface Consulta {
  id: number; petId: number; petNome: string; veterinarioId: number; vetNome: string;
  data: string; hora: string; status: StatusConsulta; observacoes?: string;
}
export interface Vacina {
  id: number; petId: number; nome: string; dataAplicacao: string | null;
  observacao?: string; aplicada: boolean;
}
export interface Historico { id: number; petId: number; descricao: string; dataEvento: string; }
export interface Relatorio {
  id: number; petId: number; petNome: string; tutorNome: string;
  texto: string; status: string; atualizacao: string;
}
export interface Aviso {
  id: number; titulo: string; texto: string; tipo: string;
  tutorId: number | null; petId: number | null; lido: boolean;
}

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  perfil: Perfil;
  email?: string;
  telefone?: string;
  endereco?: string;
  convenioStatus?: string;
  registro?: string;
  ativo: boolean;
}