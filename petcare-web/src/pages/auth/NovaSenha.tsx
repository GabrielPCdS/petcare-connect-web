import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/AuthCard';
import { authApi } from '../../api/auth';
import { getErro } from '../../api/http';
import type { Mensagem } from '../../types';

interface Estado {
  login: string;
  token: string;
}

export default function NovaSenha() {
  const navigate = useNavigate();
  const estado = useLocation().state as Estado | null;
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [msg, setMsg] = useState<Mensagem | null>(null);
  const [loading, setLoading] = useState(false);

  // Sem passar pela recuperação não há token: volta para o início do fluxo
  if (!estado?.token) return <Navigate to="/recuperar-senha" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!novaSenha.trim() || !confirmar.trim()) {
      setMsg({ tipo: 'error', texto: '⚠️ Preencha todos os campos.' });
      return;
    }
    if (novaSenha.length < 6) {
      setMsg({ tipo: 'error', texto: '⚠️ A senha deve possuir pelo menos 6 caracteres.' });
      return;
    }
    if (novaSenha !== confirmar) {
      setMsg({ tipo: 'error', texto: '⚠️ As senhas não coincidem.' });
      return;
    }

    setLoading(true);
    try {
      const r = await authApi.novaSenha({
        login: estado!.login,
        novaSenha,
        token: estado!.token,
      });

      if (r.sucesso) {
        setMsg({ tipo: 'success', texto: '✅ Senha alterada com sucesso.' });
        setTimeout(() => navigate('/'), 1800);
      } else {
        setMsg({ tipo: 'error', texto: '❌ ' + (r.mensagem ?? 'Não foi possível alterar a senha.') });
      }
    } catch (err) {
      setMsg({ tipo: 'error', texto: '❌ ' + getErro(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Criar nova senha" subtitle="Defina sua nova senha para acessar o sistema novamente.">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="novaSenha">Nova senha</label>
          <input id="novaSenha" type="password" value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)} placeholder="Digite sua nova senha" />
        </div>
        <div className="field">
          <label htmlFor="confirmar">Confirmar senha</label>
          <input id="confirmar" type="password" value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)} placeholder="Confirme sua nova senha" />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </button>

        {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}
      </form>
    </AuthCard>
  );
}