import { useAuth } from '../../components/auth/AuthContext';

export function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div>
      <p>Welcome, {currentUser?.email}</p>
    </div>
  );
}
