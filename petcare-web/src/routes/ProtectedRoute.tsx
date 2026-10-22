import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Perfil } from '../types';

export default function ProtectedRoute({ perfis }: { perfis: Perfil[] }) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/" replace />;
  if (!perfis.includes(usuario.perfil)) return <Navigate to="/nao-autorizado" replace />;

  return <Outlet />;
}