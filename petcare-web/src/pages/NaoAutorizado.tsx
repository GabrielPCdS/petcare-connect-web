import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { useAuth } from '../contexts/AuthContext';
import type { Perfil } from '../types';

const PAINEL: Record<Perfil, string> = {
  Admin: '/admin',
  Veterinario: '/veterinario',
  Tutor: '/',
};

export default function NaoAutorizado() {
  const { usuario, sair } = useAuth();

  return (
    <AuthCard
      title="Acesso negado"
      subtitle="Seu perfil não tem permissão para acessar esta página."
      showBack={false}
    >
      {usuario && (
        <Link to={PAINEL[usuario.perfil]} className="auth-back">← Voltar ao meu painel</Link>
      )}
      <Link to="/" className="auth-back" onClick={sair}>Entrar com outra conta</Link>
    </AuthCard>
  );
}