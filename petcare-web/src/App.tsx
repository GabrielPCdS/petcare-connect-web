import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import Cadastro from './pages/auth/Cadastro';
import RecuperarSenha from './pages/auth/RecuperarSenha';
import NovaSenha from './pages/auth/NovaSenha';
import VeterinarioPage from './pages/veterinario/VeterinarioPage';
import AdminPage from './pages/admin/AdminPage';
import NaoAutorizado from './pages/NaoAutorizado';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/nova-senha" element={<NovaSenha />} />
          <Route path="/nao-autorizado" element={<NaoAutorizado />} />

          {/* Só Veterinário */}
          <Route element={<ProtectedRoute perfis={['Veterinario']} />}>
            <Route path="/veterinario" element={<VeterinarioPage />} />
          </Route>

          {/* Só Admin */}
          <Route element={<ProtectedRoute perfis={['Admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}