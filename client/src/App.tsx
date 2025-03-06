import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider }         from './context/SocketContext';
import Layout from './components/layout/Layout';

// Existing pages
import LandingPage        from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';
import CreatorDashboard   from './pages/creator/Dashboard';
import MyApplications     from './pages/creator/MyApplications';
import BusinessDashboard  from './pages/business/Dashboard';
import CreateCampaign     from './pages/business/CreateCampaign';
import CampaignsList      from './pages/shared/CampaignsList';
import CampaignDetail     from './pages/shared/CampaignDetail';
import CreatorsList       from './pages/shared/CreatorsList';
import CoinsPage          from './pages/shared/CoinsPage';
import ProfileEditor      from './pages/profile/ProfileEditor';
import ChatPage           from './pages/chat/ChatPage';
import AdminDashboard     from './pages/admin/AdminDashboard';

// ── New Admin pages ───────────────────────────────────────
import UserManagementPage   from './pages/admin/UserManagementPage';
import ApproveProfilePage   from './pages/admin/ApproveProfilePage';
import SuperAdminDashboard  from './pages/admin/SuperAdminDashboard';
import AdminManagementPage  from './pages/admin/AdminManagementPage';
import AdminActivityLogPage from './pages/admin/AdminActivityLogPage';
import DisputeResolutionPage from './pages/admin/DisputeResolutionPage';

// ── New Shared pages ──────────────────────────────────────
import AIRecommendationView      from './pages/shared/AIRecommendationView';
import AdvertiserPerformancePage from './pages/shared/AdvertiserPerformancePage';
import TrustScorePage            from './pages/shared/TrustScorePage';
import NotificationCenterPage    from './pages/shared/NotificationCenterPage';
import SystemSettingsPage        from './pages/shared/SystemSettingsPage';
import CreatorProfilePage        from './pages/shared/CreatorProfilePage';
import CampaignAnalyticsPage     from './pages/shared/CampaignAnalyticsPage';

// ── Loading screen ────────────────────────────────────────
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F1340, #4F6EF7)' }}>
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-black text-2xl">A</span>
      </div>
      <div className="flex gap-1.5 justify-center">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 bg-blue-300 rounded-full bounce-dot" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

// ── Protected Route ───────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ── Dashboard redirect by role ────────────────────────────
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'superadmin') return <SuperAdminDashboard />;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'business') return <BusinessDashboard />;
  return <CreatorDashboard />;
};

// ── App Routes ────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;

  const P = (element: React.ReactNode, roles?: string[]) => (
    <ProtectedRoute roles={roles}><Layout>{element}</Layout></ProtectedRoute>
  );
  const SA = (element: React.ReactNode) => P(element, ['superadmin']);
  const ADM = (element: React.ReactNode) => P(element, ['admin', 'superadmin']);

  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={!isAuthenticated ? <LoginPage />    : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={P(<DashboardRedirect />)} />

      {/* Campaigns */}
      <Route path="/campaigns"        element={P(<CampaignsList />)} />
      <Route path="/campaigns/create" element={P(<CreateCampaign />, ['business','admin','superadmin'])} />
      <Route path="/campaigns/my"     element={P(<BusinessDashboard />, ['business'])} />
      <Route path="/campaigns/:id"    element={P(<CampaignDetail />)} />

      {/* Creator */}
      <Route path="/applications" element={P(<MyApplications />, ['creator'])} />
      <Route path="/creators"     element={P(<CreatorsList />)} />
      <Route path="/creators/:userId" element={P(<CreatorProfilePage />)} />

      {/* Shared features */}
      <Route path="/chat"            element={P(<ChatPage />)} />
      <Route path="/chat/:chatId"    element={P(<ChatPage />)} />
      <Route path="/profile"         element={P(<ProfileEditor />)} />
      <Route path="/coins"           element={P(<CoinsPage />)} />
      <Route path="/notifications"   element={P(<NotificationCenterPage />)} />
      <Route path="/settings"        element={P(<SystemSettingsPage />)} />

      {/* AI & Analytics */}
      <Route path="/ai/recommendations" element={P(<AIRecommendationView />, ['business','admin','superadmin'])} />
      <Route path="/performance"        element={P(<AdvertiserPerformancePage />, ['business','admin','superadmin'])} />
      <Route path="/trust-scores"       element={P(<TrustScorePage />)} />
      <Route path="/campaigns/:id/analytics" element={P(<CampaignAnalyticsPage />, ['business','admin','superadmin'])} />

      {/* Admin routes */}
      <Route path="/admin"          element={ADM(<AdminDashboard />)} />
      <Route path="/admin/users"    element={ADM(<UserManagementPage />)} />
      <Route path="/admin/approvals" element={ADM(<ApproveProfilePage />)} />
      <Route path="/admin/*"        element={ADM(<AdminDashboard />)} />

      {/* Super Admin routes */}
      <Route path="/superadmin"          element={SA(<SuperAdminDashboard />)} />
      <Route path="/superadmin/admins"   element={SA(<AdminManagementPage />)} />
      <Route path="/superadmin/logs"     element={SA(<AdminActivityLogPage />)} />
      <Route path="/superadmin/disputes" element={SA(<DisputeResolutionPage />)} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { borderRadius: '14px', fontSize: '13px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
            success: { style: { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' } },
            error:   { style: { background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3' } },
          }} />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
export default App;
