import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { useAuth } from '../contexts/AuthContext';

export default function NaoAutorizado() {
  const { sair } = useAuth();
  return (
    <AuthCard title="Acesso negado" subtitle="Seu perfil não tem permissão para acessar esta página." showBack={false}>
      <Link to="/" className="auth-back" onClick={sair}>Entrar com outra conta</Link>
    </AuthCard>
  );
}