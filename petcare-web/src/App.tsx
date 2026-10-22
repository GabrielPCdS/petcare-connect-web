import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Cadastro from './pages/auth/Cadastro';
import RecuperarSenha from './pages/auth/RecuperarSenha';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/veterinario" element={<h1>Painel do Veterinário (Ponto 4)</h1>} />
        <Route path="/admin" element={<h1>Painel Administrativo (Ponto 4)</h1>} />
      </Routes>
    </BrowserRouter>
  );
}