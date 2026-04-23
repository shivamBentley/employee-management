import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * Restricts access to a role.
 * Usage: <RoleGuard role="admin"><AdminPage /></RoleGuard>
 */
export default function RoleGuard({ role, children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}
