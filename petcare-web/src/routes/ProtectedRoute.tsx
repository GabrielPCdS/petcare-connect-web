import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Perfil } from '../types';

interface Props {
  perfis: Perfil[];
  children?: ReactNode;
}

export default function ProtectedRoute({ perfis, children }: Props) {
  const { usuario } = useAuth();


  if (!usuario) return <Navigate to="/" replace />;
  if (!perfis.includes(usuario.perfil)) return <Navigate to="/nao-autorizado" replace />;

  return <>{children ?? <Outlet />}</>;
}