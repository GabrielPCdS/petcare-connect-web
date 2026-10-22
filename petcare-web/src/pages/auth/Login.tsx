import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/AuthCard';
import { authApi } from '../../api/auth';
import { getErro } from '../../api/http';
import { salvarSessao } from '../../api/session';
import type { Mensagem, Perfil } from '../../types';

const DESTINO: Record<Perfil, string | null> = {
  Admin: '/admin',
  Veterinario: '/veterinario',
  Tutor: null, // tutor usa o aplicativo mobile
};

export default function Login() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil>('Veterinario');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState<Mensagem | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!login.trim() || !senha.trim()) {
      setMsg({ tipo: 'error', texto: '⚠️ Preencha login e senha.' });
      return;
    }

    setLoading(true);
    try {
      const r = await authApi.login({ login: login.trim(), senha: senha.trim(), perfil });

      if (!r.sucesso) {
        setMsg({ tipo: 'error', texto: '❌ ' + (r.mensagem ?? 'Falha no login.') });
        return;
      }

      const destino = DESTINO[r.dados.perfil];
      if (!destino) {
        setMsg({
          tipo: 'error',
          texto: 'Esta conta é de Tutor. Utilize o aplicativo PetCare Connect no celular.',
        });
        return;
      }

      salvarSessao(r.dados);
      navigate(destino);
    } catch (err) {
      setMsg({ tipo: 'error', texto: '❌ ' + getErro(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Entrar no sistema"
      subtitle="Acesso ao painel de gestão"
      showBack={false}
    >
      <form onSubmit={handleSubmit}>
        <div className="role-tabs">
          <button type="button" className={`role-tab ${perfil === 'Veterinario' ? 'active' : ''}`}
            onClick={() => setPerfil('Veterinario')}>🩺 Veterinário</button>
          <button type="button" className={`role-tab ${perfil === 'Admin' ? 'active' : ''}`}
            onClick={() => setPerfil('Admin')}>⚙️ Admin</button>
        </div>

        <div className="field">
          <label htmlFor="login">Login</label>
          <input id="login" value={login} autoComplete="username"
            onChange={(e) => setLogin(e.target.value)} placeholder="Digite seu login" />
        </div>

        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" value={senha} autoComplete="current-password"
            onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
        </div>

        <div className="auth-links">
          <Link to="/cadastro">Cadastrar-se</Link>
          <Link to="/recuperar-senha">Esqueci minha senha</Link>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Aguarde...' : 'Entrar →'}
        </button>

        {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}
      </form>
    </AuthCard>
  );
}