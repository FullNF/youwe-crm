import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { firebaseUser, profile, loading, authError } = useAuth();

  if (loading || firebaseUser === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-base">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (!firebaseUser) return <Navigate to="/login" replace />;

  if (firebaseUser && !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-base px-6">
        <div className="card p-6 max-w-md text-center">
          <p className="text-ink font-medium mb-2">Access pending</p>
          <p className="text-sm text-ink-muted">{authError || 'Your account is signed in but not yet added to the CRM. Ask an Admin to add your email in Settings > Manage Users.'}</p>
        </div>
      </div>
    );
  }

  if (adminOnly && profile.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
