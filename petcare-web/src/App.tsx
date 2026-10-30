import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import RecuperarSenha from './pages/auth/RecuperarSenha';
import NovaSenha from './pages/auth/NovaSenha';
import VeterinarioPage from './pages/veterinario/VeterinarioPage';
import AdminPage from './pages/admin/AdminPage';
import NaoAutorizado from './pages/NaoAutorizado';

const MODO_EXEMPLO = import.meta.env.VITE_USE_MOCK === 'true';

export default function App() {
  return (
    <AuthProvider>
      {MODO_EXEMPLO && <div className="mock-banner">MODO DE EXEMPLO · dados fictícios</div>}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/nova-senha" element={<NovaSenha />} />
          <Route path="/nao-autorizado" element={<NaoAutorizado />} />

          <Route
            path="/veterinario"
            element={
              <ProtectedRoute perfis={['Veterinario']}>
                <VeterinarioPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute perfis={['Admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}