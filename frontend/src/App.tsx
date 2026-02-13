import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Depolar from './pages/Depolar';
import Malzemeler from './pages/Malzemeler';
import Faturalar from './pages/Faturalar';
import Cariler from './pages/Cariler';
import Kategoriler from './pages/Kategoriler';
import Personeller from './pages/Personeller';
import Bolumler from './pages/Bolumler';
import Zimmetler from './pages/Zimmetler';
import PersonelZimmet from './pages/PersonelZimmet';
// Admin Pages
import Kullanicilar from './pages/admin/Kullanicilar';
import RolYonetimi from './pages/admin/RolYonetimi';
import Talepler from './pages/admin/Talepler';
import Loglar from './pages/admin/Loglar';
// User Pages
import TalepOlustur from './pages/user/TalepOlustur';
import { ReactNode } from 'react';

// Protected Route Component
function ProtectedRoute({ children, pageKey }: { children: ReactNode; pageKey: string }) {
    const { hasPagePermission } = useAuth();

    if (!hasPagePermission(pageKey)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

// Main App Content (needs to be inside AuthProvider)
function AppContent() {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Login />;
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute pageKey="dashboard">
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/depolar" element={
                    <ProtectedRoute pageKey="depolar">
                        <Depolar />
                    </ProtectedRoute>
                } />
                <Route path="/malzeme-karti" element={
                    <ProtectedRoute pageKey="malzemeler">
                        <Malzemeler />
                    </ProtectedRoute>
                } />
                <Route path="/faturalar" element={
                    <ProtectedRoute pageKey="faturalar">
                        <Faturalar />
                    </ProtectedRoute>
                } />
                <Route path="/cariler" element={
                    <ProtectedRoute pageKey="cariler">
                        <Cariler />
                    </ProtectedRoute>
                } />
                <Route path="/kategoriler" element={
                    <ProtectedRoute pageKey="kategoriler">
                        <Kategoriler />
                    </ProtectedRoute>
                } />
                <Route path="/personeller" element={
                    <ProtectedRoute pageKey="personeller">
                        <Personeller />
                    </ProtectedRoute>
                } />
                <Route path="/zimmetler" element={
                    <ProtectedRoute pageKey="zimmetler">
                        <Zimmetler />
                    </ProtectedRoute>
                } />
                <Route path="/personel-zimmet" element={
                    <ProtectedRoute pageKey="zimmetler">
                        <PersonelZimmet />
                    </ProtectedRoute>
                } />
                <Route path="/bolumler" element={
                    <ProtectedRoute pageKey="bolumler">
                        <Bolumler />
                    </ProtectedRoute>
                } />
                {/* Admin Routes */}
                <Route path="/kullanicilar" element={
                    <ProtectedRoute pageKey="kullanicilar">
                        <Kullanicilar />
                    </ProtectedRoute>
                } />
                <Route path="/roller" element={
                    <ProtectedRoute pageKey="roller">
                        <RolYonetimi />
                    </ProtectedRoute>
                } />
                <Route path="/talepler" element={
                    <ProtectedRoute pageKey="talepler">
                        <Talepler />
                    </ProtectedRoute>
                } />
                <Route path="/loglar" element={
                    <ProtectedRoute pageKey="loglar">
                        <Loglar />
                    </ProtectedRoute>
                } />
                {/* User Routes */}
                <Route path="/talep-olustur" element={
                    <ProtectedRoute pageKey="talep-olustur">
                        <TalepOlustur />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Layout>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
