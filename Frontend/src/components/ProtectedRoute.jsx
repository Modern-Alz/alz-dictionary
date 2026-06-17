import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GlowOrb from './GlowOrb';

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100 dark:bg-ink-900">
        <GlowOrb size={64} busy />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
