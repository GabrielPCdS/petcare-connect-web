import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo-petcare.png';
import '../styles/painel.css';

interface Props {
  titulo: string;
  children: ReactNode;
}

export default function PainelLayout({ titulo, children }: Props) {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  function handleSair() {
    sair();
    navigate('/', { replace: true });
  }

  return (
    <div className="painel">
      <header className="painel-header">
        <div className="painel-brand">
          <img src={logo} alt="" />
          <div>
            <strong>PetCare Connect</strong>
            <span>{titulo}</span>
          </div>
        </div>
        <div className="painel-user">
          <span>{usuario?.nome}</span>
          <button onClick={handleSair}>Sair</button>
        </div>
      </header>
      <main className="painel-main">{children}</main>
    </div>
  );
}