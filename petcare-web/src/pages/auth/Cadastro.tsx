import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../../components/AuthCard';
import { authApi } from '../../api/auth';
import { getErro } from '../../api/http';
import type { Mensagem } from '../../types';

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', login: '', email: '', senha: '' });
  const [msg, setMsg] = useState<Mensagem | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    const { nome, login, email, senha } = form;
    if (!nome.trim() || !login.trim() || !email.trim() || !senha.trim()) {
      setMsg({ tipo: 'error', texto: '⚠️ Preencha todos os campos.' });
      return;
    }

    setLoading(true);
    try {
      const r = await authApi.cadastro({
        nome: nome.trim(), login: login.trim(), email: email.trim(),
        senha: senha.trim(), perfil: 'Tutor',
      });

      if (r.sucesso) {
        setMsg({ tipo: 'success', texto: '✅ Conta criada com sucesso.' });
        setTimeout(() => navigate('/'), 1800);
      } else {
        setMsg({ tipo: 'error', texto: '❌ ' + (r.mensagem ?? 'Não foi possível cadastrar.') });
      }
    } catch (err) {
      setMsg({ tipo: 'error', texto: '❌ ' + getErro(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Criar conta" subtitle="Cadastre-se como tutor e acompanhe seus pets online.">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nome">Nome completo</label>
          <input id="nome" name="nome" value={form.nome} onChange={handleChange} placeholder="Digite seu nome" />
        </div>
        <div className="field">
          <label htmlFor="login">Login</label>
          <input id="login" name="login" value={form.login} onChange={handleChange} placeholder="Escolha um login" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Digite seu email" />
        </div>
        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="Crie uma senha" />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>

        {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}
      </form>
    </AuthCard>
  );
}