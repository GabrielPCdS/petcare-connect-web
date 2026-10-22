import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { lerSessao, limparSessao, salvarSessao } from '../api/session';
import type { LoginResponse } from '../types';

interface AuthContextData {
  usuario: LoginResponse | null;
  entrar: (dados: LoginResponse) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lê a sessão salva, então F5 não desloga
  const [usuario, setUsuario] = useState<LoginResponse | null>(() => lerSessao());

  const entrar = useCallback((dados: LoginResponse) => {
    salvarSessao(dados);
    setUsuario(dados);
  }, []);

  const sair = useCallback(() => {
    limparSessao();
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, entrar, sair }), [usuario, entrar, sair]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}