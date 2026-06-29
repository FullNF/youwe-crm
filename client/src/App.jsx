import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadsList from './pages/Leads/LeadsList';
import LeadDetails from './pages/Leads/LeadDetails';
import NeedAttention from './pages/NeedAttention';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  // Keep the service worker fresh on every visit. Without this, a browser
  // that already has notifications enabled keeps running whatever Service
  // Worker version it first installed (e.g. missing icons, old behavior)
  // until something explicitly re-registers it - which previously only
  // happened when someone clicked "Enable" again. This check on every load
  // means fixes here actually reach people who already turned it on.
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgb(var(--c-surface))',
                color: 'rgb(var(--c-ink))',
                border: '1px solid rgb(var(--c-surface-border))',
                fontSize: 13,
                boxShadow: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -8px rgba(0,0,0,0.25)',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#ffffff' },
                style: { border: '1px solid rgba(16,185,129,0.35)' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#ffffff' },
                style: { border: '1px solid rgba(239,68,68,0.35)' },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadsList />} />
              <Route path="/leads/:id" element={<LeadDetails />} />
              <Route path="/need-attention" element={<NeedAttention />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
