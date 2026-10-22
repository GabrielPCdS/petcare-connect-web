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