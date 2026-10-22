import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo-petcare.png';
import '../styles/auth.css';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  showBack?: boolean;
}

export default function AuthCard({ title, subtitle, children, showBack = true }: Props) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} className="auth-logo" alt="PetCare Connect" />
        <h1 className="auth-title">{title}</h1>
        <p className="auth-sub">{subtitle}</p>
        {children}
        {showBack && (
          <Link to="/" className="auth-back">← Voltar para login</Link>
        )}
      </div>
    </div>
  );
}