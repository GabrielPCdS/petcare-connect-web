import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../../components/AuthCard';
import { authApi } from '../../api/auth';
import { getErro } from '../../api/http';
import type { Mensagem } from '../../types';

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<Mensagem | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!login.trim() || !email.trim()) {
      setMsg({ tipo: 'error', texto: '⚠️ Preencha login e email.' });
      return;
    }

    setLoading(true);
    try {
      const r = await authApi.recuperarSenha({ login: login.trim(), email: email.trim() });

      if (r.sucesso) {
        setMsg({ tipo: 'success', texto: '✅ Identidade confirmada.' });
        setTimeout(
          () => navigate('/nova-senha', { state: { login: login.trim(), token: r.dados.token } }),
          1200
        );
      } else {
        setMsg({ tipo: 'error', texto: '❌ ' + (r.mensagem ?? 'Dados não conferem.') });
      }
    } catch (err) {
      setMsg({ tipo: 'error', texto: '❌ ' + getErro(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Recuperar senha" subtitle="Informe seu login e email cadastrados para redefinir sua senha.">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login">Login</label>
          <input id="login" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Digite seu login" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu email" />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Aguarde...' : 'Recuperar senha'}
        </button>

        {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}
      </form>
    </AuthCard>
  );
}